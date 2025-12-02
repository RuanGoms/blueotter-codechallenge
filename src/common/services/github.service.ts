import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { ServiceResponse } from '../types/http.types';

@Injectable()
export class GitHubService {
  private readonly axiosInstance: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const baseURL = this.configService.get<string>('GITHUB_API_URL');
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });
  }

  async fetchUser(username: string): Promise<ServiceResponse<any>> {
    try {
      const response = await this.axiosInstance.get(`/users/${username}`);
      return { kind: 'OK', data: response.data };
    } catch (error) {
      if (error.response?.status === 404) {
        return { kind: 'NotFound' };
      }
      return {
        kind: 'Error',
        error: 'Failed to fetch user from GitHub API',
      };
    }
  }

  async fetchUserRepositories(
    username: string,
  ): Promise<ServiceResponse<any[]>> {
    try {
      const allRepositories: any[] = [];
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await this.axiosInstance.get(
          `/users/${username}/repos`,
          {
            params: {
              per_page: 100,
              page,
              type: 'public',
            },
          },
        );

        const repositories = response.data;
        allRepositories.push(...repositories);

        // If we got less than 100 repos, we've reached the last page
        hasMorePages = repositories.length === 100;
        page++;
      }

      return { kind: 'OK', data: allRepositories };
    } catch (error) {
      if (error.response?.status === 404) {
        return { kind: 'NotFound' };
      }
      return {
        kind: 'Error',
        error: 'Failed to fetch repositories from GitHub API',
      };
    }
  }
}
