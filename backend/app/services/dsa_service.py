from typing import List, Optional, Tuple, Dict
from collections import defaultdict
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_, desc, asc
import re

from app.models.company import Company
from app.models.problem import Problem, CompanyProblem

class DSAService:
    @staticmethod
    def get_companies(
        db: Session,
        search: Optional[str] = None,
        sort_by: str = "problems_desc", # problems_desc, problems_asc, name_asc, name_desc, hard_desc, easy_desc
        page: int = 1,
        limit: int = 20
    ) -> Tuple[List[Company], int]:
        query = db.query(Company)

        if search:
            search_clean = search.strip().lower()
            query = query.filter(
                or_(
                    func.lower(Company.name).contains(search_clean),
                    func.lower(Company.slug).contains(search_clean)
                )
            )

        if sort_by == "problems_desc":
            query = query.order_by(desc(Company.problem_count), asc(Company.name))
        elif sort_by == "problems_asc":
            query = query.order_by(asc(Company.problem_count), asc(Company.name))
        elif sort_by == "name_asc":
            query = query.order_by(asc(Company.name))
        elif sort_by == "name_desc":
            query = query.order_by(desc(Company.name))
        elif sort_by == "hard_desc":
            query = query.order_by(desc(Company.hard_count), desc(Company.problem_count))
        elif sort_by == "easy_desc":
            query = query.order_by(desc(Company.easy_count), desc(Company.problem_count))
        else:
            query = query.order_by(desc(Company.problem_count), asc(Company.name))

        total = query.count()
        offset = (page - 1) * limit
        items = query.offset(offset).limit(limit).all()
        return items, total

    @staticmethod
    def get_company_by_id_or_slug(db: Session, identifier: str) -> Optional[Company]:
        if identifier.isdigit():
            company = db.query(Company).filter(Company.id == int(identifier)).first()
            if company:
                return company
        return db.query(Company).filter(
            or_(
                func.lower(Company.slug) == identifier.lower().strip(),
                func.lower(Company.name) == identifier.lower().strip()
            )
        ).first()

    @staticmethod
    def get_company_problems(
        db: Session,
        company_id: int,
        search: Optional[str] = None,
        difficulty: Optional[str] = None,
        topic: Optional[str] = None, # can be comma-separated or single topic
        sort_by: str = "default",
        page: int = 1,
        limit: int = 20
    ) -> Tuple[List[dict], int]:
        # Query problems associated with company_id
        query = db.query(Problem).join(CompanyProblem, CompanyProblem.problem_id == Problem.id)\
            .filter(CompanyProblem.company_id == company_id)

        if search:
            search_clean = search.strip().lower()
            query = query.filter(
                or_(
                    func.lower(Problem.name).contains(search_clean),
                    func.lower(Problem.topics).contains(search_clean)
                )
            )

        if difficulty and difficulty.lower() != "all":
            query = query.filter(func.lower(Problem.difficulty) == difficulty.lower().strip())

        if topic and topic.lower() != "all":
            # Support multiple comma-separated topics (AND condition or OR condition)
            topics_list = [t.strip().lower() for t in topic.split(",") if t.strip() and t.lower() != "all"]
            if topics_list:
                for t in topics_list:
                    query = query.filter(func.lower(Problem.topics).contains(t))

        if sort_by == "name_asc":
            query = query.order_by(asc(Problem.name))
        elif sort_by == "name_desc":
            query = query.order_by(desc(Problem.name))
        elif sort_by == "difficulty_asc": # Easy -> Medium -> Hard
            # Custom sorting
            pass
        else:
            query = query.order_by(asc(Problem.name))

        total = query.count()
        offset = (page - 1) * limit
        problems = query.offset(offset).limit(limit).all()

        # Batch load asking companies for these problems
        prob_ids = [p.id for p in problems]
        company_map = DSAService._get_companies_for_problem_ids(db, prob_ids)

        result = []
        for p in problems:
            comps = company_map.get(p.id, [])
            result.append({
                "id": p.id,
                "name": p.name,
                "slug": p.slug,
                "difficulty": p.difficulty,
                "topics": [t.strip() for t in p.topics.split(",") if t.strip()],
                "leetcode_url": p.leetcode_url,
                "leetcode_problem_number": p.leetcode_problem_number,
                "company_count": len(comps),
                "companies": comps
            })

        return result, total

    @staticmethod
    def get_all_problems(
        db: Session,
        search: Optional[str] = None,
        difficulty: Optional[str] = None,
        topic: Optional[str] = None,
        company_slug_or_id: Optional[str] = None,
        sort_by: str = "companies_desc", # companies_desc, name_asc, name_desc
        page: int = 1,
        limit: int = 20
    ) -> Tuple[List[dict], int]:
        query = db.query(Problem)

        if company_slug_or_id and company_slug_or_id.lower() != "all":
            comp = DSAService.get_company_by_id_or_slug(db, company_slug_or_id)
            if comp:
                query = query.join(CompanyProblem, CompanyProblem.problem_id == Problem.id)\
                             .filter(CompanyProblem.company_id == comp.id)

        if search:
            search_clean = search.strip().lower()
            query = query.filter(
                or_(
                    func.lower(Problem.name).contains(search_clean),
                    func.lower(Problem.topics).contains(search_clean)
                )
            )

        if difficulty and difficulty.lower() != "all":
            query = query.filter(func.lower(Problem.difficulty) == difficulty.lower().strip())

        if topic and topic.lower() != "all":
            topics_list = [t.strip().lower() for t in topic.split(",") if t.strip() and t.lower() != "all"]
            for t in topics_list:
                query = query.filter(func.lower(Problem.topics).contains(t))

        if sort_by == "name_asc":
            query = query.order_by(asc(Problem.name))
        elif sort_by == "name_desc":
            query = query.order_by(desc(Problem.name))
        else:
            # Default sort by problem name
            query = query.order_by(asc(Problem.name))

        total = query.count()
        offset = (page - 1) * limit
        problems = query.offset(offset).limit(limit).all()

        prob_ids = [p.id for p in problems]
        company_map = DSAService._get_companies_for_problem_ids(db, prob_ids)

        result = []
        for p in problems:
            comps = company_map.get(p.id, [])
            result.append({
                "id": p.id,
                "name": p.name,
                "slug": p.slug,
                "difficulty": p.difficulty,
                "topics": [t.strip() for t in p.topics.split(",") if t.strip()],
                "leetcode_url": p.leetcode_url,
                "leetcode_problem_number": p.leetcode_problem_number,
                "company_count": len(comps),
                "companies": comps
            })

        return result, total

    @staticmethod
    def get_problem_by_id_or_slug(db: Session, identifier: str) -> Optional[dict]:
        problem = None
        if identifier.isdigit():
            problem = db.query(Problem).filter(Problem.id == int(identifier)).first()
        if not problem:
            problem = db.query(Problem).filter(
                or_(
                    func.lower(Problem.slug) == identifier.lower().strip(),
                    func.lower(Problem.name) == identifier.lower().strip()
                )
            ).first()

        if not problem:
            return None

        # Fetch asking companies
        companies = db.query(Company).join(CompanyProblem, CompanyProblem.company_id == Company.id)\
            .filter(CompanyProblem.problem_id == problem.id)\
            .order_by(desc(Company.problem_count), asc(Company.name))\
            .all()

        # Fetch related problems (problems that share topics)
        first_topic = problem.topics.split(",")[0].strip() if problem.topics else ""
        related = []
        if first_topic:
            related_objs = db.query(Problem)\
                .filter(Problem.id != problem.id, func.lower(Problem.topics).contains(first_topic.lower()))\
                .order_by(asc(Problem.name))\
                .limit(6)\
                .all()
            for r in related_objs:
                related.append({
                    "id": r.id,
                    "name": r.name,
                    "slug": r.slug,
                    "difficulty": r.difficulty,
                    "topics": [t.strip() for t in r.topics.split(",") if t.strip()],
                    "leetcode_url": r.leetcode_url,
                    "leetcode_problem_number": r.leetcode_problem_number,
                    "company_count": 0
                })

        return {
            "id": problem.id,
            "name": problem.name,
            "slug": problem.slug,
            "difficulty": problem.difficulty,
            "topics": [t.strip() for t in problem.topics.split(",") if t.strip()],
            "leetcode_url": problem.leetcode_url,
            "leetcode_problem_number": problem.leetcode_problem_number,
            "company_count": len(companies),
            "companies": [{"id": c.id, "name": c.name, "slug": c.slug} for c in companies],
            "related_problems": related
        }

    @staticmethod
    def generate_preparation_set(
        db: Session,
        company_id_or_slug: str,
        difficulties: Optional[List[str]] = None,
        count: Optional[int] = 25
    ) -> Optional[dict]:
        company = DSAService.get_company_by_id_or_slug(db, company_id_or_slug)
        if not company:
            return None

        query = db.query(Problem).join(CompanyProblem, CompanyProblem.problem_id == Problem.id)\
            .filter(CompanyProblem.company_id == company.id)

        if difficulties and len(difficulties) > 0:
            clean_diffs = [d.capitalize() for d in difficulties if d.capitalize() in ["Easy", "Medium", "Hard"]]
            if clean_diffs:
                query = query.filter(Problem.difficulty.in_(clean_diffs))

        # Order by problem name (preserving pure dataset integrity without fake frequencies)
        query = query.order_by(asc(Problem.name))

        if count and count > 0:
            problems = query.limit(count).all()
        else:
            problems = query.all()

        prob_ids = [p.id for p in problems]
        company_map = DSAService._get_companies_for_problem_ids(db, prob_ids)

        items = []
        for p in problems:
            comps = company_map.get(p.id, [])
            items.append({
                "id": p.id,
                "name": p.name,
                "slug": p.slug,
                "difficulty": p.difficulty,
                "topics": [t.strip() for t in p.topics.split(",") if t.strip()],
                "leetcode_url": p.leetcode_url,
                "leetcode_problem_number": p.leetcode_problem_number,
                "company_count": len(comps),
                "companies": comps
            })

        diff_str = ", ".join(difficulties) if difficulties else "All Difficulties"
        title = f"{company.name} — {len(items)} Problem Preparation Set"

        return {
            "company": {"id": company.id, "name": company.name, "slug": company.slug},
            "title": title,
            "total_selected": len(items),
            "difficulty_filter": diff_str,
            "problems": items
        }

    @staticmethod
    def get_all_topics_with_counts(db: Session) -> List[Dict[str, any]]:
        problems = db.query(Problem.topics).all()
        topic_counter = {}
        for (topics_str,) in problems:
            if not topics_str:
                continue
            for t in topics_str.split(","):
                t_clean = t.strip()
                if t_clean:
                    topic_counter[t_clean] = topic_counter.get(t_clean, 0) + 1

        sorted_topics = sorted(topic_counter.items(), key=lambda x: (-x[1], x[0]))
        return [{"name": name, "count": count} for name, count in sorted_topics]

    @staticmethod
    def get_platform_stats(db: Session) -> dict:
        total_companies = db.query(Company).count()
        total_problems = db.query(Problem).count()
        total_rel = db.query(CompanyProblem).count()

        easy_count = db.query(Problem).filter(Problem.difficulty == "Easy").count()
        medium_count = db.query(Problem).filter(Problem.difficulty == "Medium").count()
        hard_count = db.query(Problem).filter(Problem.difficulty == "Hard").count()

        popular_companies = db.query(Company).order_by(desc(Company.problem_count)).limit(10).all()
        top_topics = DSAService.get_all_topics_with_counts(db)[:12]

        return {
            "total_companies": total_companies,
            "total_problems": total_problems,
            "total_company_problems": total_rel,
            "easy_count": easy_count,
            "medium_count": medium_count,
            "hard_count": hard_count,
            "popular_companies": popular_companies,
            "top_topics": top_topics,
            "creator": "Maharshi"
        }

    @staticmethod
    def _get_companies_for_problem_ids(db: Session, problem_ids: List[int]) -> Dict[int, List[dict]]:
        if not problem_ids:
            return {}
        results = db.query(CompanyProblem.problem_id, Company.id, Company.name, Company.slug)\
            .join(Company, Company.id == CompanyProblem.company_id)\
            .filter(CompanyProblem.problem_id.in_(problem_ids))\
            .order_by(desc(Company.problem_count), asc(Company.name))\
            .all()

        mapping = defaultdict(list)
        for prob_id, c_id, c_name, c_slug in results:
            mapping[prob_id].append({"id": c_id, "name": c_name, "slug": c_slug})
        return mapping
