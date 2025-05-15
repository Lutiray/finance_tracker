import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '../schemas/category.schema';

export class CategoryResponseDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Unique identifier of the category'
  })
  id: string;

  @ApiProperty({
    example: 'Food',
    description: 'Name of the category'
  })
  name: string;

  @ApiProperty({
    enum: CategoryType,
    example: CategoryType.EXPENSE,
    description: 'Type of the category (income/expense)'
  })
  type: CategoryType;

  @ApiProperty({
    example: '2023-05-20T14:30:00.000Z',
    description: 'Creation timestamp'
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-20T14:30:00.000Z',
    description: 'Last update timestamp'
  })
  updatedAt: Date;
} 