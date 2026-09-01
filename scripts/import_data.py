import sys
import os
import csv
import re
import logging
from collections import defaultdict

# Add backend directory to sys.path so app modules can be imported
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(parent_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.db.session import engine, Base, SessionLocal
from app.models.company import Company
from app.models.problem import Problem, CompanyProblem

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("importer")

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def normalize_difficulty(diff: str) -> str:
    d = diff.strip().lower()
    if "easy" in d:
        return "Easy"
    elif "hard" in d:
        return "Hard"
    elif "med" in d:
        return "Medium"
    return "Medium"

def clean_topics(topics_str: str) -> str:
    if not topics_str:
        return "General"
    # Split by comma or slash
    raw_topics = [t.strip() for t in re.split(r'[,/|]', topics_str) if t.strip()]
    # Deduplicate while preserving case
    seen = set()
    cleaned = []
    for t in raw_topics:
        t_normalized = " ".join(t.split()) # clean multi-spaces
        if t_normalized.lower() not in seen:
            seen.add(t_normalized.lower())
            cleaned.append(t_normalized)
    return ", ".join(cleaned) if cleaned else "General"

def find_csv_file() -> str:
    candidates = [
        os.path.join(parent_dir, "data", "tuf_company_questions.csv"),
        os.path.join(parent_dir, "tuf_company_questions.csv"),
        "M:\\PC\\MAHARSHI\\!PLACEMENTS\\COMPANY BASED PROBLEMS\\tuf_company_questions.csv",
        "data/tuf_company_questions.csv"
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    raise FileNotFoundError(f"Could not find tuf_company_questions.csv in candidates: {candidates}")

def run_import():
    logger.info("=== Starting OneXCode Data Ingestion Pipeline ===")
    csv_path = find_csv_file()
    logger.info(f"Reading dataset from: {csv_path}")

    # Create tables if not exist
    logger.info("Creating database tables if not present...")
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()

    try:
        with open(csv_path, mode="r", encoding="utf-8-sig", errors="ignore") as f:
            reader = csv.DictReader(f)
            # Find exact column names (handling case/BOM)
            field_map = {}
            for fn in reader.fieldnames:
                clean_fn = fn.strip().lower()
                if "company" in clean_fn:
                    field_map["company"] = fn
                elif "problem" in clean_fn:
                    field_map["problem"] = fn
                elif "topic" in clean_fn:
                    field_map["topics"] = fn
                elif "diff" in clean_fn:
                    field_map["difficulty"] = fn

            logger.info(f"Mapped CSV fields: {field_map}")
            
            raw_rows = list(reader)
            logger.info(f"Total raw records read: {len(raw_rows)}")

        # Step 1: Parse and normalize all records
        companies_dict = {} # slug -> clean_name
        problems_dict = {}  # slug -> {name, difficulty, topics_set}
        company_problem_pairs = set() # (company_slug, problem_slug)
        
        duplicate_records = 0
        invalid_records = 0
        
        for idx, row in enumerate(raw_rows, start=1):
            comp_name = row.get(field_map.get("company", "Company"), "").strip()
            prob_name = row.get(field_map.get("problem", "Problem"), "").strip()
            topic_str = row.get(field_map.get("topics", "Topics"), "").strip()
            diff_str = row.get(field_map.get("difficulty", "Difficulty"), "").strip()

            if not comp_name or not prob_name:
                invalid_records += 1
                continue

            comp_slug = slugify(comp_name)
            prob_slug = slugify(prob_name)
            difficulty = normalize_difficulty(diff_str)
            topics_cleaned = clean_topics(topic_str)

            if comp_slug not in companies_dict:
                companies_dict[comp_slug] = comp_name

            if prob_slug not in problems_dict:
                problems_dict[prob_slug] = {
                    "name": prob_name,
                    "slug": prob_slug,
                    "difficulty": difficulty,
                    "topics": set(t.strip() for t in topics_cleaned.split(",") if t.strip())
                }
            else:
                # Merge topics if already seen
                new_topics = set(t.strip() for t in topics_cleaned.split(",") if t.strip())
                problems_dict[prob_slug]["topics"].update(new_topics)

            pair = (comp_slug, prob_slug)
            if pair in company_problem_pairs:
                duplicate_records += 1
            else:
                company_problem_pairs.add(pair)

        logger.info(f"Parsed {len(companies_dict)} unique companies.")
        logger.info(f"Parsed {len(problems_dict)} unique problems.")
        logger.info(f"Parsed {len(company_problem_pairs)} unique company-problem relationships.")
        if duplicate_records:
            logger.info(f"Filtered out {duplicate_records} exact duplicate company-problem rows.")
        if invalid_records:
            logger.warning(f"Skipped {invalid_records} invalid records with missing fields.")

        # Step 2: Database Ingestion
        logger.info("Syncing companies with database...")
        company_model_map = {} # slug -> Company instance
        for comp_slug, comp_name in companies_dict.items():
            existing = session.query(Company).filter_by(slug=comp_slug).first()
            if not existing:
                existing = Company(
                    name=comp_name,
                    slug=comp_slug,
                    problem_count=0,
                    easy_count=0,
                    medium_count=0,
                    hard_count=0
                )
                session.add(existing)
                session.flush()
            company_model_map[comp_slug] = existing

        logger.info("Syncing unique problems with database...")
        problem_model_map = {} # slug -> Problem instance
        for prob_slug, pdata in problems_dict.items():
            existing = session.query(Problem).filter_by(slug=prob_slug).first()
            sorted_topics = ", ".join(sorted(list(pdata["topics"])))
            if not existing:
                existing = Problem(
                    name=pdata["name"],
                    slug=prob_slug,
                    difficulty=pdata["difficulty"],
                    topics=sorted_topics,
                    leetcode_url=None,
                    leetcode_problem_number=None
                )
                session.add(existing)
                session.flush()
            else:
                existing.difficulty = pdata["difficulty"]
                existing.topics = sorted_topics
            problem_model_map[prob_slug] = existing

        logger.info("Creating company-problem associations...")
        # Fetch existing associations
        existing_pairs = set(
            session.query(CompanyProblem.company_id, CompanyProblem.problem_id).all()
        )

        new_associations = []
        company_stats = defaultdict(lambda: {"total": 0, "easy": 0, "medium": 0, "hard": 0})

        for comp_slug, prob_slug in company_problem_pairs:
            comp_obj = company_model_map[comp_slug]
            prob_obj = problem_model_map[prob_slug]

            # Update stats
            stats = company_stats[comp_obj.id]
            stats["total"] += 1
            if prob_obj.difficulty == "Easy":
                stats["easy"] += 1
            elif prob_obj.difficulty == "Hard":
                stats["hard"] += 1
            else:
                stats["medium"] += 1

            if (comp_obj.id, prob_obj.id) not in existing_pairs:
                new_associations.append(
                    CompanyProblem(company_id=comp_obj.id, problem_id=prob_obj.id)
                )

        if new_associations:
            session.bulk_save_objects(new_associations)
            session.flush()
            logger.info(f"Inserted {len(new_associations)} new company-problem links.")

        # Step 3: Update company aggregated statistics
        logger.info("Updating aggregated statistics for each company...")
        for comp_id, stats in company_stats.items():
            comp_obj = session.query(Company).filter_by(id=comp_id).first()
            if comp_obj:
                comp_obj.problem_count = stats["total"]
                comp_obj.easy_count = stats["easy"]
                comp_obj.medium_count = stats["medium"]
                comp_obj.hard_count = stats["hard"]

        session.commit()
        logger.info("=== Import Process Completed Successfully! ===")
        
        # Display summary report
        total_comp = session.query(Company).count()
        total_prob = session.query(Problem).count()
        total_rel = session.query(CompanyProblem).count()
        
        print("\n" + "="*50)
        print("            OneXCode DATA IMPORT SUMMARY")
        print("="*50)
        print(f" Total Companies in Database:       {total_comp}")
        print(f" Total Unique Problems:            {total_prob}")
        print(f" Total Company-Problem Mappings:   {total_rel}")
        print("="*50 + "\n")

    except Exception as e:
        session.rollback()
        logger.error(f"Error during import: {e}", exc_info=True)
        raise
    finally:
        session.close()

if __name__ == "__main__":
    run_import()
