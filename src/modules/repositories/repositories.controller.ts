import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { RepositoriesService } from './repositories.service';

@ApiTags('repositories')
@Controller('repositories')
export class RepositoriesController {
  constructor(private readonly repositoriesService: RepositoriesService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search repositories by keywords' })
  @ApiQuery({
    name: 'q',
    description: 'Search keywords (name, language, or username)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns matching repositories',
  })
  async searchRepositories(@Query('q') keywords: string) {
    const result = await this.repositoriesService.searchRepositories(keywords);

    switch (result.kind) {
      case 'OK':
        return result.data;
      default:
        throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
