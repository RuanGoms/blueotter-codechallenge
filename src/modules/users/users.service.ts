import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';
import { User } from './entities/user.entity';
import { Repository } from '../repositories/entities/repository.entity';
import { GitHubService } from '../../common/services/github.service';
import { ServiceResponse } from '../../common/types/http.types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: TypeOrmRepository<User>,
    @InjectRepository(Repository)
    private readonly repositoriesRepository: TypeOrmRepository<Repository>,
    private readonly githubService: GitHubService,
  ) {}

  async syncUserRepositories(
    username: string,
  ): Promise<ServiceResponse<{ message: string; count: number }>> {
    // Fetch user and repositories from GitHub
    const githubUserResponse = await this.githubService.fetchUser(username);

    if (githubUserResponse.kind !== 'OK') {
      return githubUserResponse;
    }

    const githubUser = githubUserResponse.data;
    const githubReposResponse = await this.githubService.fetchUserRepositories(
      username,
    );

    if (githubReposResponse.kind !== 'OK') {
      return githubReposResponse;
    }

    const githubRepos = githubReposResponse.data;

    // Check if user exists in database
    let user = await this.usersRepository.findOne({
      where: { id: githubUser.id },
    });

    if (user) {
      // Update existing user
      user.login = githubUser.login;
      user.avatarUrl = githubUser.avatar_url;
      await this.usersRepository.save(user);
    } else {
      // Create new user
      user = this.usersRepository.create({
        id: githubUser.id,
        login: githubUser.login,
        avatarUrl: githubUser.avatar_url,
      });
      await this.usersRepository.save(user);
    }

    // Delete existing repositories for this user
    await this.repositoriesRepository.delete({ userId: githubUser.id });

    // Create new repository records
    if (githubRepos.length > 0) {
      const repositories = githubRepos.map((repo) =>
        this.repositoriesRepository.create({
          id: repo.id,
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
          language: repo.language,
          createdAt: new Date(repo.created_at),
          userId: githubUser.id,
        }),
      );

      await this.repositoriesRepository.save(repositories);
    }

    return {
      kind: 'OK',
      data: {
        message: `Successfully synced ${githubRepos.length} repositories for user ${username}`,
        count: githubRepos.length,
      },
    };
  }

  async getUserRepositories(
    username: string,
  ): Promise<ServiceResponse<Repository[]>> {
    const user = await this.usersRepository.findOne({
      where: { login: username },
    });

    if (!user) {
      return { kind: 'NotFound' };
    }

    const repositories = await this.repositoriesRepository.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    });

    return { kind: 'OK', data: repositories };
  }
}
