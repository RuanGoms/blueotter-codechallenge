import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository, SelectQueryBuilder } from 'typeorm';
import { RepositoriesService } from '../repositories.service';
import { Repository } from '../entities/repository.entity';

describe('RepositoriesService', () => {
  let service: RepositoriesService;
  let repositoriesRepository: jest.Mocked<TypeOrmRepository<Repository>>;
  let queryBuilder: jest.Mocked<SelectQueryBuilder<Repository>>;

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepositoriesService,
        {
          provide: getRepositoryToken(Repository),
          useValue: {
            createQueryBuilder: jest.fn(() => queryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<RepositoriesService>(RepositoriesService);
    repositoriesRepository = module.get(getRepositoryToken(Repository));
  });

  describe('searchRepositories', () => {
    it('should search repositories by keyword successfully', async () => {
      // Arrange
      const keywords = 'typescript';
      const expectedRepos = [
        {
          id: 123456,
          name: 'typescript-api',
          description: 'REST API built with TypeScript',
          url: 'https://github.com/user/typescript-api',
          language: 'TypeScript',
          createdAt: new Date('2023-05-20T14:30:00Z'),
          userId: 1,
          user: {
            id: 1,
            login: 'developer',
            avatarUrl: 'https://avatars.githubusercontent.com/u/1',
            repositories: [],
          },
        },
      ];

      queryBuilder.getMany.mockResolvedValue(expectedRepos as Repository[]);

      // Act
      const result = await service.searchRepositories(keywords);

      // Assert
      expect(result).toEqual(expectedRepos);
      expect(repositoriesRepository.createQueryBuilder).toHaveBeenCalledWith('repository');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('repository.user', 'user');
      expect(queryBuilder.where).toHaveBeenCalledWith('LOWER(repository.name) LIKE LOWER(:search)', {
        search: '%typescript%',
      });
      expect(queryBuilder.orWhere).toHaveBeenCalledTimes(2);
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('repository.createdAt', 'DESC');
      expect(queryBuilder.getMany).toHaveBeenCalled();
    });

    it('should return empty array when no matches found', async () => {
      // Arrange
      const keywords = 'nonexistentlanguage';
      queryBuilder.getMany.mockResolvedValue([]);

      // Act
      const result = await service.searchRepositories(keywords);

      // Assert
      expect(result).toEqual([]);
      expect(queryBuilder.getMany).toHaveBeenCalled();
    });

    it('should search case-insensitively', async () => {
      // Arrange
      const keywords = 'TYPESCRIPT';
      const expectedRepos = [
        {
          id: 123456,
          name: 'typescript-api',
          description: 'REST API',
          url: 'https://github.com/user/typescript-api',
          language: 'TypeScript',
          createdAt: new Date('2023-05-20T14:30:00Z'),
          userId: 1,
        },
      ];

      queryBuilder.getMany.mockResolvedValue(expectedRepos as Repository[]);

      // Act
      const result = await service.searchRepositories(keywords);

      // Assert
      expect(result).toEqual(expectedRepos);
      expect(queryBuilder.where).toHaveBeenCalledWith('LOWER(repository.name) LIKE LOWER(:search)', {
        search: '%TYPESCRIPT%',
      });
    });

    it('should search by username', async () => {
      // Arrange
      const keywords = 'torvalds';
      const expectedRepos = [
        {
          id: 2325298,
          name: 'linux',
          description: 'Linux kernel',
          url: 'https://github.com/torvalds/linux',
          language: 'C',
          createdAt: new Date('2011-09-04T22:48:12Z'),
          userId: 1024025,
          user: {
            id: 1024025,
            login: 'torvalds',
            avatarUrl: 'https://avatars.githubusercontent.com/u/1024025',
            repositories: [],
          },
        },
      ];

      queryBuilder.getMany.mockResolvedValue(expectedRepos as Repository[]);

      // Act
      const result = await service.searchRepositories(keywords);

      // Assert
      expect(result).toEqual(expectedRepos);
      expect(queryBuilder.orWhere).toHaveBeenCalledWith('LOWER(user.login) LIKE LOWER(:search)', {
        search: '%torvalds%',
      });
    });

    it('should handle special characters in search', async () => {
      // Arrange
      const keywords = 'test-api';
      queryBuilder.getMany.mockResolvedValue([]);

      // Act
      const result = await service.searchRepositories(keywords);

      // Assert
      expect(result).toEqual([]);
      expect(queryBuilder.where).toHaveBeenCalledWith('LOWER(repository.name) LIKE LOWER(:search)', {
        search: '%test-api%',
      });
    });
  });
});
