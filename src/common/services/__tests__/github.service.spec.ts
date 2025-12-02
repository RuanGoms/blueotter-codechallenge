import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GitHubService } from '../github.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GitHubService', () => {
  let service: GitHubService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GitHubService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('https://api.github.com'),
          },
        },
      ],
    }).compile();

    service = module.get<GitHubService>(GitHubService);
    configService = module.get<ConfigService>(ConfigService);

    mockedAxios.create.mockReturnValue({
      get: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUser', () => {
    it('should fetch GitHub user successfully', async () => {
      // Arrange
      const username = 'torvalds';
      const expectedUser = {
        id: 1024025,
        login: 'torvalds',
        avatar_url: 'https://avatars.githubusercontent.com/u/1024025',
      };

      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: expectedUser }),
      };
      mockedAxios.create.mockReturnValue(axiosInstance as any);

      const newService = new GitHubService(configService);

      // Act
      const result = await newService.fetchUser(username);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(axiosInstance.get).toHaveBeenCalledWith(`/users/${username}`);
    });

    it('should throw 404 error when user not found', async () => {
      // Arrange
      const username = 'nonexistentuser123456';
      const axiosInstance = {
        get: jest.fn().mockRejectedValue({
          response: { status: 404 },
        }),
      };
      mockedAxios.create.mockReturnValue(axiosInstance as any);

      const newService = new GitHubService(configService);

      // Act & Assert
      await expect(newService.fetchUser(username)).rejects.toThrow(
        new HttpException(`GitHub user '${username}' not found`, HttpStatus.NOT_FOUND),
      );
      expect(axiosInstance.get).toHaveBeenCalledWith(`/users/${username}`);
    });

    it('should throw 503 error when GitHub API is unavailable', async () => {
      // Arrange
      const username = 'torvalds';
      const axiosInstance = {
        get: jest.fn().mockRejectedValue({
          response: { status: 500 },
        }),
      };
      mockedAxios.create.mockReturnValue(axiosInstance as any);

      const newService = new GitHubService(configService);

      // Act & Assert
      await expect(newService.fetchUser(username)).rejects.toThrow(
        new HttpException('Failed to fetch user from GitHub API', HttpStatus.SERVICE_UNAVAILABLE),
      );
    });
  });

  describe('fetchUserRepositories', () => {
    it('should fetch all repositories with single page', async () => {
      // Arrange
      const username = 'testuser';
      const expectedRepos = [
        {
          id: 123456,
          name: 'test-repo',
          description: 'Test repository',
          html_url: 'https://github.com/testuser/test-repo',
          language: 'TypeScript',
          created_at: '2023-01-15T10:30:00Z',
          owner: {
            id: 1,
            login: 'testuser',
            avatar_url: 'https://avatars.githubusercontent.com/u/1',
          },
        },
      ];

      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: expectedRepos }),
      };
      mockedAxios.create.mockReturnValue(axiosInstance as any);

      const newService = new GitHubService(configService);

      // Act
      const result = await newService.fetchUserRepositories(username);

      // Assert
      expect(result).toEqual(expectedRepos);
      expect(axiosInstance.get).toHaveBeenCalledWith(`/users/${username}/repos`, {
        params: {
          per_page: 100,
          page: 1,
          type: 'public',
        },
      });
    });

    it('should fetch all repositories with pagination', async () => {
      // Arrange
      const username = 'torvalds';
      const page1Repos = new Array(100).fill(null).map((_, i) => ({
        id: i,
        name: `repo-${i}`,
        description: 'Test',
        html_url: `https://github.com/torvalds/repo-${i}`,
        language: 'C',
        created_at: '2011-09-04T22:48:12Z',
        owner: {
          id: 1024025,
          login: 'torvalds',
          avatar_url: 'https://avatars.githubusercontent.com/u/1024025',
        },
      }));

      const page2Repos = new Array(50).fill(null).map((_, i) => ({
        id: 100 + i,
        name: `repo-${100 + i}`,
        description: 'Test',
        html_url: `https://github.com/torvalds/repo-${100 + i}`,
        language: 'C',
        created_at: '2011-09-04T22:48:12Z',
        owner: {
          id: 1024025,
          login: 'torvalds',
          avatar_url: 'https://avatars.githubusercontent.com/u/1024025',
        },
      }));

      const axiosInstance = {
        get: jest
          .fn()
          .mockResolvedValueOnce({ data: page1Repos })
          .mockResolvedValueOnce({ data: page2Repos }),
      };
      mockedAxios.create.mockReturnValue(axiosInstance as any);

      const newService = new GitHubService(configService);

      // Act
      const result = await newService.fetchUserRepositories(username);

      // Assert
      expect(result).toHaveLength(150);
      expect(axiosInstance.get).toHaveBeenCalledTimes(2);
      expect(axiosInstance.get).toHaveBeenNthCalledWith(1, `/users/${username}/repos`, {
        params: { per_page: 100, page: 1, type: 'public' },
      });
      expect(axiosInstance.get).toHaveBeenNthCalledWith(2, `/users/${username}/repos`, {
        params: { per_page: 100, page: 2, type: 'public' },
      });
    });

    it('should return empty array for user with no repositories', async () => {
      // Arrange
      const username = 'emptyuser';
      const axiosInstance = {
        get: jest.fn().mockResolvedValue({ data: [] }),
      };
      mockedAxios.create.mockReturnValue(axiosInstance as any);

      const newService = new GitHubService(configService);

      // Act
      const result = await newService.fetchUserRepositories(username);

      // Assert
      expect(result).toEqual([]);
      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    });

    it('should throw 404 error when user not found', async () => {
      // Arrange
      const username = 'nonexistentuser123456';
      const axiosInstance = {
        get: jest.fn().mockRejectedValue({
          response: { status: 404 },
        }),
      };
      mockedAxios.create.mockReturnValue(axiosInstance as any);

      const newService = new GitHubService(configService);

      // Act & Assert
      await expect(newService.fetchUserRepositories(username)).rejects.toThrow(
        new HttpException(`GitHub user '${username}' not found`, HttpStatus.NOT_FOUND),
      );
    });

    it('should throw 503 error when GitHub API fails', async () => {
      // Arrange
      const username = 'testuser';
      const axiosInstance = {
        get: jest.fn().mockRejectedValue({
          response: { status: 503 },
        }),
      };
      mockedAxios.create.mockReturnValue(axiosInstance as any);

      const newService = new GitHubService(configService);

      // Act & Assert
      await expect(newService.fetchUserRepositories(username)).rejects.toThrow(
        new HttpException(
          'Failed to fetch repositories from GitHub API',
          HttpStatus.SERVICE_UNAVAILABLE,
        ),
      );
    });
  });
});
