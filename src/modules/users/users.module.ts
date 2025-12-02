import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Repository } from '../repositories/entities/repository.entity';
import { GitHubService } from '../../common/services/github.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Repository])],
  controllers: [UsersController],
  providers: [UsersService, GitHubService],
  exports: [UsersService],
})
export class UsersModule {}
