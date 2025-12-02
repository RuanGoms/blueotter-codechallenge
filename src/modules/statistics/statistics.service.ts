import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';
import { Repository } from '../repositories/entities/repository.entity';
import { User } from '../users/entities/user.entity';
import { ServiceResponse } from '../../common/types/http.types';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Repository)
    private readonly repositoriesRepository: TypeOrmRepository<Repository>,
    @InjectRepository(User)
    private readonly usersRepository: TypeOrmRepository<User>,
  ) {}

  async getStatistics(username?: string, topN: number = 5): Promise<ServiceResponse<any>> {
    if (username) {
      return this.getUserStatistics(username, topN);
    }
    return this.getGlobalStatistics(topN);
  }

  private async getUserStatistics(username: string, topN: number): Promise<ServiceResponse<any>> {
    const user = await this.usersRepository.findOne({
      where: { login: username },
    });

    if (!user) {
      return { kind: 'NotFound' };
    }

    // Get total repos for user
    const totalRepos = await this.repositoriesRepository.count({
      where: { userId: user.id },
    });

    // Get top languages for user
    const languages = await this.repositoriesRepository
      .createQueryBuilder('repository')
      .select('repository.language', 'language')
      .addSelect('COUNT(*)', 'count')
      .where('repository.userId = :userId', { userId: user.id })
      .andWhere('repository.language IS NOT NULL')
      .groupBy('repository.language')
      .orderBy('count', 'DESC')
      .limit(topN)
      .getRawMany();

    // Get monthly timeline for user
    const timeline = await this.repositoriesRepository
      .createQueryBuilder('repository')
      .select("TO_CHAR(repository.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'count')
      .where('repository.userId = :userId', { userId: user.id })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      kind: 'OK',
      data: {
        summary: {
          total_repos: totalRepos,
        },
        languages: languages.map((lang) => ({
          language: lang.language,
          count: parseInt(lang.count, 10),
        })),
        timeline_created_monthly: timeline.map((t) => ({
          month: t.month,
          count: parseInt(t.count, 10),
        })),
      },
    };
  }

  private async getGlobalStatistics(topN: number): Promise<ServiceResponse<any>> {
    // Get total repos and users
    const totalRepos = await this.repositoriesRepository.count();
    const totalUsers = await this.usersRepository.count();

    // Get top languages globally
    const languages = await this.repositoriesRepository
      .createQueryBuilder('repository')
      .select('repository.language', 'language')
      .addSelect('COUNT(*)', 'count')
      .where('repository.language IS NOT NULL')
      .groupBy('repository.language')
      .orderBy('count', 'DESC')
      .limit(topN)
      .getRawMany();

    // Get top users by repo count
    const topUsers = await this.repositoriesRepository
      .createQueryBuilder('repository')
      .select('user.login', 'login')
      .addSelect('COUNT(*)', 'repo_count')
      .leftJoin('repository.user', 'user')
      .groupBy('user.login')
      .orderBy('repo_count', 'DESC')
      .limit(topN)
      .getRawMany();

    // Get monthly timeline globally
    const timeline = await this.repositoriesRepository
      .createQueryBuilder('repository')
      .select("TO_CHAR(repository.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'count')
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      kind: 'OK',
      data: {
        summary: {
          total_repos: totalRepos,
          total_users: totalUsers,
        },
        languages: languages.map((lang) => ({
          language: lang.language,
          count: parseInt(lang.count, 10),
        })),
        top_users_by_repos: topUsers.map((user) => ({
          login: user.login,
          repo_count: parseInt(user.repo_count, 10),
        })),
        timeline_created_monthly: timeline.map((t) => ({
          month: t.month,
          count: parseInt(t.count, 10),
        })),
      },
    };
  }
}
