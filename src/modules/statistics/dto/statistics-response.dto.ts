import { ApiProperty } from '@nestjs/swagger';

class SummaryDto {
  @ApiProperty({ description: 'Total number of repositories', example: 150 })
  total_repos: number;

  @ApiProperty({
    description: 'Total number of users (global only)',
    example: 5,
    required: false,
  })
  total_users?: number;
}

class LanguageStatDto {
  @ApiProperty({ description: 'Programming language', example: 'TypeScript' })
  language: string;

  @ApiProperty({ description: 'Number of repositories', example: 45 })
  count: number;
}

class TopUserDto {
  @ApiProperty({ description: 'GitHub username', example: 'torvalds' })
  login: string;

  @ApiProperty({ description: 'Number of repositories', example: 42 })
  repo_count: number;
}

class TimelineDto {
  @ApiProperty({ description: 'Year-Month', example: '2023-01' })
  month: string;

  @ApiProperty({ description: 'Number of repositories created', example: 12 })
  count: number;
}

export class StatisticsResponseDto {
  @ApiProperty({ description: 'Summary statistics' })
  summary: SummaryDto;

  @ApiProperty({
    description: 'Top N languages by repository count',
    type: [LanguageStatDto],
  })
  languages: LanguageStatDto[];

  @ApiProperty({
    description: 'Top N users by repository count (global only)',
    type: [TopUserDto],
    required: false,
  })
  top_users_by_repos?: TopUserDto[];

  @ApiProperty({
    description: 'Monthly timeline of repository creation',
    type: [TimelineDto],
  })
  timeline_created_monthly: TimelineDto[];
}
