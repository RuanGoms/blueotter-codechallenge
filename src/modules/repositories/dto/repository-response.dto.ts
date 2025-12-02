import { ApiProperty } from '@nestjs/swagger';

export class RepositoryResponseDto {
  @ApiProperty({ description: 'Repository ID', example: 2325298 })
  id: number;

  @ApiProperty({ description: 'Repository name', example: 'linux' })
  name: string;

  @ApiProperty({
    description: 'Repository description',
    example: 'Linux kernel source tree',
    nullable: true,
  })
  description: string;

  @ApiProperty({
    description: 'Repository URL',
    example: 'https://github.com/torvalds/linux',
  })
  url: string;

  @ApiProperty({
    description: 'Primary programming language',
    example: 'C',
    nullable: true,
  })
  language: string;

  @ApiProperty({
    description: 'Repository creation date',
    example: '2011-09-04T22:48:12Z',
  })
  createdAt: Date;
}
