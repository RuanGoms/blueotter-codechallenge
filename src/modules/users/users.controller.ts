import { Controller, Post, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sync/:username')
  @ApiOperation({ summary: 'Sync user repositories from GitHub' })
  @ApiParam({ name: 'username', description: 'GitHub username' })
  @ApiResponse({
    status: 200,
    description: 'Repositories synced successfully',
  })
  @ApiResponse({ status: 404, description: 'GitHub user not found' })
  @ApiResponse({ status: 503, description: 'GitHub API unavailable' })
  async syncUserRepositories(@Param('username') username: string) {
    const result = await this.usersService.syncUserRepositories(username);

    switch (result.kind) {
      case 'OK':
        return result.data;
      case 'NotFound':
        throw new HttpException('GitHub user not found', HttpStatus.NOT_FOUND);
      case 'Error':
        throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
      default:
        throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('users/:username/repositories')
  @ApiOperation({ summary: 'Get user repositories from local database' })
  @ApiParam({ name: 'username', description: 'GitHub username' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of repositories',
  })
  async getUserRepositories(@Param('username') username: string) {
    const result = await this.usersService.getUserRepositories(username);

    switch (result.kind) {
      case 'OK':
        return result.data;
      case 'NotFound':
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      default:
        throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
