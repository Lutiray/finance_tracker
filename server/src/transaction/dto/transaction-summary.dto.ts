import { ApiProperty } from '@nestjs/swagger';

class CategorySummary {
  @ApiProperty()
  categoryId: string;
  
  @ApiProperty()
  name: string;
  
  @ApiProperty()
  amount: number;
}

export class TransactionSummaryDto {
  @ApiProperty()
  totalIncome: number;
  
  @ApiProperty()
  totalExpenses: number;
  
  @ApiProperty()
  netSavings: number;
  
  @ApiProperty({ type: [CategorySummary] })
  byCategory: CategorySummary[];
}