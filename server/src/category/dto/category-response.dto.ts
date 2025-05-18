import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '../schemas/category.schema';

export class CategoryResponseDto {
  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: CategoryType })
  type: CategoryType;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}