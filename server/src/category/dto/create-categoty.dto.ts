import { IsString, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '../schemas/category.schema';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Transport',
    maxLength: 50
  })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    enum: CategoryType,
    example: CategoryType.EXPENSE
  })
  @IsEnum(CategoryType)
  type: CategoryType;
}

// Response DTO
export class CategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: CategoryType })
  type: CategoryType;

  @ApiProperty()
  createdAt: Date;
}