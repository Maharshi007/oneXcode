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

import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private async fetchJson<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      /*
       * Get the current Supabase session.
       *
       * Public APIs work without authentication.
       * If a user is logged in, attach the Supabase access token
       * so protected FastAPI endpoints can authenticate the user.
       */
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers = new Headers(options?.headers);

      headers.set('Content-Type', 'application/json');

      if (session?.access_token) {
        headers.set(
          'Authorization',
          `Bearer ${session.access_token}`
        );
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorDetail = `HTTP Error ${response.status}`;

        try {
          const errData = await response.json();

          if (typeof errData?.detail === 'string') {
            errorDetail = errData.detail;
          } else if (Array.isArray(errData?.detail)) {
            const messages = errData.detail.map((item: any) => {
              if (typeof item === 'string') return item;

              if (item && typeof item === 'object') {
                const loc = Array.isArray(item.loc)
                  ? item.loc
                      .filter(
                        (l: any) =>
                          l !== 'query' && l !== 'body'
                      )
                      .join('.')
                  : '';

                const msg =
                  item.msg ||
                  item.message ||
                  JSON.stringify(item);

                return loc ? `${loc}: ${msg}` : msg;
              }

              return String(item);
            });

            errorDetail =
              messages.filter(Boolean).join('; ') ||
              errorDetail;
          } else if (
            errData?.detail &&
            typeof errData.detail === 'object'
          ) {
            errorDetail =
              errData.detail.msg ||
              errData.detail.message ||
              JSON.stringify(errData.detail);
          } else if (
            typeof errData?.message === 'string'
          ) {
            errorDetail = errData.message;
          }
        } catch {
          // Keep fallback error message.
        }

        throw new Error(errorDetail);
      }

      return await response.json();
    } catch (error: any) {
      console.error(
        `API Error on ${endpoint}:`,
        error
      );

      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // Stats
  // -------------------------------------------------------------------------

  async getStats(): Promise<PlatformStats> {
    return this.fetchJson<PlatformStats>('/stats');
  }

  // -------------------------------------------------------------------------
  // Companies
  // -------------------------------------------------------------------------

  async getCompanies(params?: {
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Company>> {
    const query = new URLSearchParams();

    if (params?.search) {
      query.append('search', params.search);
    }

    if (params?.sort) {
      query.append('sort', params.sort);
    }

    if (params?.page) {
      query.append('page', params.page.toString());
    }

    if (params?.limit) {
      query.append('limit', params.limit.toString());
    }

    const qs = query.toString();

    return this.fetchJson<PaginatedResponse<Company>>(
      `/companies${qs ? `?${qs}` : ''}`
    );
  }

  async getCompany(
    idOrSlug: string | number
  ): Promise<CompanyDetail> {
    return this.fetchJson<CompanyDetail>(
      `/companies/${idOrSlug}`
    );
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

    if (params?.search) {
      query.append('search', params.search);
    }

    if (
      params?.difficulty &&
      params.difficulty !== 'All'
    ) {
      query.append('difficulty', params.difficulty);
    }

    if (params?.topic && params.topic !== 'All') {
      query.append('topic', params.topic);
    }

    if (params?.sort) {
      query.append('sort', params.sort);
    }

    if (params?.page) {
      query.append(
        'page',
        params.page.toString()
      );
    }

    if (params?.limit) {
      query.append(
        'limit',
        params.limit.toString()
      );
    }

    const qs = query.toString();

    return this.fetchJson<PaginatedResponse<Problem>>(
      `/companies/${idOrSlug}/problems${qs ? `?${qs}` : ''}`
    );
  }

  // -------------------------------------------------------------------------
  // Problems
  // -------------------------------------------------------------------------

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

    if (params?.search) {
      query.append('search', params.search);
    }

    if (
      params?.difficulty &&
      params.difficulty !== 'All'
    ) {
      query.append('difficulty', params.difficulty);
    }

    if (params?.topic && params.topic !== 'All') {
      query.append('topic', params.topic);
    }

    if (
      params?.company &&
      params.company !== 'All'
    ) {
      query.append('company', params.company);
    }

    if (params?.sort) {
      query.append('sort', params.sort);
    }

    if (params?.page) {
      query.append(
        'page',
        params.page.toString()
      );
    }

    if (params?.limit) {
      query.append(
        'limit',
        params.limit.toString()
      );
    }

    const qs = query.toString();

    return this.fetchJson<PaginatedResponse<Problem>>(
      `/problems${qs ? `?${qs}` : ''}`
    );
  }

  async getProblem(
    idOrSlug: string | number
  ): Promise<ProblemDetail> {
    return this.fetchJson<ProblemDetail>(
      `/problems/${idOrSlug}`
    );
  }

  // -------------------------------------------------------------------------
  // Topics
  // -------------------------------------------------------------------------

  async getTopics(): Promise<TopicStat[]> {
    return this.fetchJson<TopicStat[]>('/topics');
  }

  // -------------------------------------------------------------------------
  // Preparation Mode Set / Random Problem Generation
  // -------------------------------------------------------------------------

  async getPreparationSet(params: {
    company?: string;
    difficulty?: string;
    topic?: string;
    count?: number;
    randomize?: boolean;
  }): Promise<PrepSetResponse> {
    const query = new URLSearchParams();

    if (
      params.company &&
      params.company !== 'All'
    ) {
      query.append(
        'company',
        params.company
      );
    }

    if (
      params.difficulty &&
      params.difficulty !== 'All'
    ) {
      query.append(
        'difficulty',
        params.difficulty
      );
    }

    if (
      params.topic &&
      params.topic !== 'All'
    ) {
      query.append(
        'topic',
        params.topic
      );
    }

    if (params.count) {
      query.append(
        'count',
        params.count.toString()
      );
    }

    if (params.randomize !== undefined) {
      query.append(
        'randomize',
        params.randomize.toString()
      );
    }

    try {
      return await this.fetchJson<PrepSetResponse>(
        `/problems/preparation-set?${query.toString()}`
      );
    } catch (err: any) {
      /*
       * Fallback for older backend behavior when no company
       * is supplied.
       */
      if (
        !params.company ||
        params.company === 'All'
      ) {
        const pRes =
          await this.getProblems({
            difficulty:
              params.difficulty !== 'All'
                ? params.difficulty
                : undefined,

            topic:
              params.topic !== 'All'
                ? params.topic
                : undefined,

            limit: 100,
          });

        if (pRes.items.length === 0) {
          throw new Error(
            'No problems found matching the selected filters.'
          );
        }

        const shuffled = [...pRes.items].sort(
          () => 0.5 - Math.random()
        );

        const selected = shuffled.slice(
          0,
          Math.min(
            params.count || 5,
            shuffled.length
          )
        );

        return {
          company: null,
          title: `Random — ${selected.length} Problem Preparation Set`,
          total_selected: selected.length,

          difficulty_filter:
            params.difficulty &&
            params.difficulty !== 'All'
              ? params.difficulty
              : 'All Difficulties',

          topic_filter:
            params.topic &&
            params.topic !== 'All'
              ? params.topic
              : undefined,

          problems: selected,
        };
      }

      throw err;
    }
  }

  // -------------------------------------------------------------------------
  // User Progress
  // -------------------------------------------------------------------------

  async getUserProgress(): Promise<{
    solved_problem_ids: number[];
    count: number;
  }> {
    return this.fetchJson<{
      solved_problem_ids: number[];
      count: number;
    }>('/progress');
  }

  async getUserProgressStats(): Promise<{
    total_problems: number;
    solved_problems: number;
    unsolved_problems: number;
    completion_percentage: number;
    easy: number;
    medium: number;
    hard: number;
  }> {
    return this.fetchJson<{
      total_problems: number;
      solved_problems: number;
      unsolved_problems: number;
      completion_percentage: number;
      easy: number;
      medium: number;
      hard: number;
    }>('/progress/stats');
  }

  async markProblemSolved(
    problemId: number
  ): Promise<{
    message: string;
    problem_id: number;
    solved: boolean;
    solved_at: string;
  }> {
    return this.fetchJson<{
      message: string;
      problem_id: number;
      solved: boolean;
      solved_at: string;
    }>(`/progress/${problemId}`, {
      method: 'POST',
    });
  }

  async markProblemUnsolved(
    problemId: number
  ): Promise<{
    message: string;
    problem_id: number;
    solved: boolean;
  }> {
    return this.fetchJson<{
      message: string;
      problem_id: number;
      solved: boolean;
    }>(`/progress/${problemId}`, {
      method: 'DELETE',
    });
  }

  async migrateProgress(
    problemIds: number[]
  ): Promise<{
    inserted: number;
    skipped: number;
    solved_problem_ids: number[];
    count: number;
  }> {
    return this.fetchJson<{
      inserted: number;
      skipped: number;
      solved_problem_ids: number[];
      count: number;
    }>('/progress/migrate', {
      method: 'POST',
      body: JSON.stringify({ problem_ids: problemIds }),
    });
  }

  async resetAllProgress(): Promise<{
    message: string;
    deleted: number;
  }> {
    return this.fetchJson<{
      message: string;
      deleted: number;
    }>('/progress', {
      method: 'DELETE',
    });
  }
}


export const api = new ApiService();