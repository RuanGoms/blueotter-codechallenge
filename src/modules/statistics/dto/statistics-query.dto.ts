import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class StatisticsQueryDto {
  @ApiProperty({
    description: 'GitHub username for user-specific statistics',
    required: false,
    example: 'torvalds',
  })
  @IsString()
  @IsOptional()
  user?: string;

  @ApiProperty({
    description: 'Number of top results to return',
    required: false,
    default: 5,
    minimum: 1,
    maximum: 20,
    example: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  topN?: number;
}
