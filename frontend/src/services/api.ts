import {
  PlatformStats,
  Company,
  CompanyDetail,
  Problem,
  ProblemDetail,
  PaginatedResponse,
  TopicStat,
  PrepSetResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private async fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });

      if (!response.ok) {
        let errorDetail = `HTTP Error ${response.status}`;
        try {
          const errData = await response.json();
          errorDetail = errData.detail || errorDetail;
        } catch {
          // keep fallback
        }
        throw new Error(errorDetail);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`API Error on ${endpoint}:`, error);
      throw error;
    }
  }

  // Stats
  async getStats(): Promise<PlatformStats> {
    return this.fetchJson<PlatformStats>('/stats');
  }

  // Companies
  async getCompanies(params?: {
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Company>> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const qs = query.toString();
    return this.fetchJson<PaginatedResponse<Company>>(`/companies${qs ? `?${qs}` : ''}`);
  }

  async getCompany(idOrSlug: string | number): Promise<CompanyDetail> {
    return this.fetchJson<CompanyDetail>(`/companies/${idOrSlug}`);
  }

  async getCompanyProblems(
    idOrSlug: string | number,
    params?: {
      search?: string;
      difficulty?: string;
      topic?: string;
      sort?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<Problem>> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.difficulty && params.difficulty !== 'All') query.append('difficulty', params.difficulty);
    if (params?.topic && params.topic !== 'All') query.append('topic', params.topic);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const qs = query.toString();
    return this.fetchJson<PaginatedResponse<Problem>>(`/companies/${idOrSlug}/problems${qs ? `?${qs}` : ''}`);
  }

  // Problems
  async getProblems(params?: {
    search?: string;
    difficulty?: string;
    topic?: string;
    company?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Problem>> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.difficulty && params.difficulty !== 'All') query.append('difficulty', params.difficulty);
    if (params?.topic && params.topic !== 'All') query.append('topic', params.topic);
    if (params?.company && params.company !== 'All') query.append('company', params.company);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const qs = query.toString();
    return this.fetchJson<PaginatedResponse<Problem>>(`/problems${qs ? `?${qs}` : ''}`);
  }

  async getProblem(idOrSlug: string | number): Promise<ProblemDetail> {
    return this.fetchJson<ProblemDetail>(`/problems/${idOrSlug}`);
  }

  // Topics
  async getTopics(): Promise<TopicStat[]> {
    return this.fetchJson<TopicStat[]>('/topics');
  }

  // Preparation Mode Set
  async getPreparationSet(params: {
    company: string;
    difficulty?: string;
    count?: number;
  }): Promise<PrepSetResponse> {
    const query = new URLSearchParams();
    query.append('company', params.company);
    if (params.difficulty && params.difficulty !== 'All') query.append('difficulty', params.difficulty);
    if (params.count) query.append('count', params.count.toString());

    return this.fetchJson<PrepSetResponse>(`/problems/preparation-set?${query.toString()}`);
  }
}

export const api = new ApiService();
