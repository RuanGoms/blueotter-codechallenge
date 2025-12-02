import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchQueryDto {
  @ApiProperty({
    description: 'Search keywords for repository name, language, or username',
    example: 'typescript',
  })
  @IsString()
  @IsNotEmpty()
  q: string;
}
