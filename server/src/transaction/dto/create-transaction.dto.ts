import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsPositive, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ enum: ['income', 'expense'] })
  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense';

  @ApiProperty({ minimum: 0.01 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiProperty()
  @IsString()
  accountId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}