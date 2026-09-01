export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'All';

export type ProblemStatus = 'not_started' | 'attempted' | 'solved';

export interface Company {
  id: number;
  name: string;
  slug: string;
  problem_count: number;
  easy_count: number;
  medium_count: number;
  hard_count: number;
}

export interface CompanyDifficultyBreakdown {
  easy: number;
  medium: number;
  hard: number;
}

export interface CompanyDetail extends Company {
  created_at: string;
  difficulty_breakdown?: CompanyDifficultyBreakdown;
}

export interface ProblemCompanyBrief {
  id: number;
  name: string;
  slug: string;
}

export interface Problem {
  id: number;
  name: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  leetcode_url?: string | null;
  leetcode_problem_number?: number | null;
  company_count?: number;
  companies?: ProblemCompanyBrief[];
}

export interface ProblemDetail extends Problem {
  companies: ProblemCompanyBrief[];
  related_problems: Problem[];
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface TopicStat {
  name: string;
  count: number;
}

export interface PlatformStats {
  total_companies: number;
  total_problems: number;
  total_company_problems: number;
  easy_count: number;
  medium_count: number;
  hard_count: number;
  popular_companies: Company[];
  top_topics: TopicStat[];
  creator: string;
}

export interface PrepSetResponse {
  company: ProblemCompanyBrief;
  title: string;
  total_selected: number;
  difficulty_filter?: string;
  problems: Problem[];
}

export interface ProblemProgress {
  status: ProblemStatus;
  updatedAt: string;
  notes?: string;
  isBookmarked?: boolean;
}

export interface UserProgressState {
  problems: Record<number, ProblemProgress>; // problem_id -> progress
  lastActive: string;
}
