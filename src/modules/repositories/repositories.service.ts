import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';
import { Repository } from './entities/repository.entity';
import { ServiceResponse } from '../../common/types/http.types';

@Injectable()
export class RepositoriesService {
  constructor(
    @InjectRepository(Repository)
    private readonly repositoriesRepository: TypeOrmRepository<Repository>,
  ) {}

  async searchRepositories(
    keywords: string,
  ): Promise<ServiceResponse<Repository[]>> {
    const queryBuilder = this.repositoriesRepository
      .createQueryBuilder('repository')
      .leftJoinAndSelect('repository.user', 'user')
      .where('LOWER(repository.name) LIKE LOWER(:search)', {
        search: `%${keywords}%`,
      })
      .orWhere('LOWER(repository.language) LIKE LOWER(:search)', {
        search: `%${keywords}%`,
      })
      .orWhere('LOWER(user.login) LIKE LOWER(:search)', {
        search: `%${keywords}%`,
      })
      .orderBy('repository.createdAt', 'DESC');

    const repositories = await queryBuilder.getMany();
    return { kind: 'OK', data: repositories };
  }
}
