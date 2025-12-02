import { Controller, Post, Get, Param, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { HttpResponse } from '../../common/utils/http-response.util';

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
        return HttpResponse.ok(result.data);
      case 'NotFound':
        return HttpResponse.notFound('GitHub user not found');
      case 'Error':
        return HttpResponse.error(result.error);
      default:
        return HttpResponse.error('Internal Server Error');
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
        return HttpResponse.ok(result.data);
      case 'NotFound':
        return HttpResponse.notFound('User not found');
      default:
        return HttpResponse.error('Internal Server Error');
    }
  }
}
