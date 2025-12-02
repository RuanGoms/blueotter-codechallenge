import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @ApiOperation({ summary: 'Get repository statistics' })
  @ApiQuery({
    name: 'user',
    description: 'GitHub username for user-specific statistics',
    required: false,
  })
  @ApiQuery({
    name: 'topN',
    description: 'Number of top results to return (default: 5, max: 20)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns statistics',
  })
  async getStatistics(
    @Query('user') username?: string,
    @Query('topN') topN?: string,
  ) {
    const topNValue = topN ? Math.min(parseInt(topN, 10), 20) : 5;
    const result = await this.statisticsService.getStatistics(username, topNValue);

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
