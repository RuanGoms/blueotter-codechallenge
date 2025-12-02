import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';
import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';
import { Repository } from '../../repositories/entities/repository.entity';
import { GitHubService } from '../../../common/services/github.service';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<TypeOrmRepository<User>>;
  let repositoriesRepository: jest.Mocked<TypeOrmRepository<Repository>>;
  let githubService: jest.Mocked<GitHubService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Repository),
          useValue: {
            delete: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: GitHubService,
          useValue: {
            fetchUser: jest.fn(),
            fetchUserRepositories: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(User));
    repositoriesRepository = module.get(getRepositoryToken(Repository));
    githubService = module.get(GitHubService);
  });

  describe('syncUserRepositories', () => {
    it('should sync repositories for a new user successfully', async () => {
      // Arrange
      const username = 'torvalds';
      const githubUser = {
        id: 1024025,
        login: 'torvalds',
        avatar_url: 'https://avatars.githubusercontent.com/u/1024025',
      };

      const githubRepos = [
        {
          id: 2325298,
          name: 'linux',
          description: 'Linux kernel source tree',
          html_url: 'https://github.com/torvalds/linux',
          language: 'C',
          created_at: '2011-09-04T22:48:12Z',
          owner: githubUser,
        },
      ];

      const createdUser = {
        id: githubUser.id,
        login: githubUser.login,
        avatarUrl: githubUser.avatar_url,
        repositories: [],
      };

      githubService.fetchUser.mockResolvedValue(githubUser);
      githubService.fetchUserRepositories.mockResolvedValue(githubRepos);
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.create.mockReturnValue(createdUser as User);
      usersRepository.save.mockResolvedValue(createdUser as User);
      repositoriesRepository.delete.mockResolvedValue({ affected: 0, raw: {} });
      repositoriesRepository.create.mockImplementation((data) => data as Repository);
      (repositoriesRepository.save as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await service.syncUserRepositories(username);

      // Assert
      expect(result.message).toBe('Successfully synced 1 repositories for user torvalds');
      expect(result.count).toBe(1);
      expect(githubService.fetchUser).toHaveBeenCalledWith(username);
      expect(githubService.fetchUserRepositories).toHaveBeenCalledWith(username);
      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: githubUser.id } });
      expect(usersRepository.create).toHaveBeenCalled();
      expect(usersRepository.save).toHaveBeenCalled();
      expect(repositoriesRepository.delete).toHaveBeenCalledWith({ userId: githubUser.id });
      expect(repositoriesRepository.save).toHaveBeenCalled();
    });

    it('should update repositories for an existing user', async () => {
      // Arrange
      const username = 'torvalds';
      const existingUser = {
        id: 1024025,
        login: 'torvalds',
        avatarUrl: 'https://avatars.githubusercontent.com/u/1024025',
        repositories: [],
      };

      const githubUser = {
        id: 1024025,
        login: 'torvalds',
        avatar_url: 'https://avatars.githubusercontent.com/u/1024025?v=4',
      };

      const githubRepos = [
        {
          id: 2325298,
          name: 'linux',
          description: 'Linux kernel source tree',
          html_url: 'https://github.com/torvalds/linux',
          language: 'C',
          created_at: '2011-09-04T22:48:12Z',
          owner: githubUser,
        },
      ];

      githubService.fetchUser.mockResolvedValue(githubUser);
      githubService.fetchUserRepositories.mockResolvedValue(githubRepos);
      usersRepository.findOne.mockResolvedValue(existingUser as User);
      usersRepository.save.mockResolvedValue(existingUser as User);
      repositoriesRepository.delete.mockResolvedValue({ affected: 1, raw: {} });
      repositoriesRepository.create.mockImplementation((data) => data as Repository);
      (repositoriesRepository.save as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await service.syncUserRepositories(username);

      // Assert
      expect(result.count).toBe(1);
      expect(usersRepository.create).not.toHaveBeenCalled();
      expect(usersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          login: githubUser.login,
          avatarUrl: githubUser.avatar_url,
        }),
      );
      expect(repositoriesRepository.delete).toHaveBeenCalledWith({ userId: githubUser.id });
    });

    it('should handle empty repository list', async () => {
      // Arrange
      const username = 'emptyuser';
      const githubUser = {
        id: 999999,
        login: 'emptyuser',
        avatar_url: 'https://avatars.githubusercontent.com/u/999999',
      };

      githubService.fetchUser.mockResolvedValue(githubUser);
      githubService.fetchUserRepositories.mockResolvedValue([]);
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.create.mockReturnValue({
        id: githubUser.id,
        login: githubUser.login,
        avatarUrl: githubUser.avatar_url,
        repositories: [],
      } as User);
      usersRepository.save.mockResolvedValue({} as User);
      repositoriesRepository.delete.mockResolvedValue({ affected: 0, raw: {} });

      // Act
      const result = await service.syncUserRepositories(username);

      // Assert
      expect(result.count).toBe(0);
      expect(result.message).toBe('Successfully synced 0 repositories for user emptyuser');
      expect(repositoriesRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getUserRepositories', () => {
    it('should return repositories for an existing user', async () => {
      // Arrange
      const username = 'torvalds';
      const user = {
        id: 1024025,
        login: 'torvalds',
        avatarUrl: 'https://avatars.githubusercontent.com/u/1024025',
        repositories: [],
      };

      const repositories = [
        {
          id: 2325298,
          name: 'linux',
          description: 'Linux kernel source tree',
          url: 'https://github.com/torvalds/linux',
          language: 'C',
          createdAt: new Date('2011-09-04T22:48:12Z'),
          userId: 1024025,
        },
      ];

      usersRepository.findOne.mockResolvedValue(user as User);
      repositoriesRepository.find.mockResolvedValue(repositories as Repository[]);

      // Act
      const result = await service.getUserRepositories(username);

      // Assert
      expect(result).toEqual(repositories);
      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { login: username } });
      expect(repositoriesRepository.find).toHaveBeenCalledWith({
        where: { userId: user.id },
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array for non-existent user', async () => {
      // Arrange
      const username = 'nonexistent';
      usersRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.getUserRepositories(username);

      // Assert
      expect(result).toEqual([]);
      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { login: username } });
      expect(repositoriesRepository.find).not.toHaveBeenCalled();
    });
  });
});
