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
  @ApiProperty({ description: 'Total balance' })
  balance: number;

  @ApiProperty({ description: 'Total income' })
  monthlyIncome: number;

  @ApiProperty({ description: 'Total expenses' })
  monthlyExpenses: number;

  @ApiProperty({ description: 'Income trend' })
  incomeTrend: number;

  @ApiProperty({ description: 'Expenses trend' })
  expensesTrend: number;

  @ApiProperty({ description: 'Balance trend' })
  balanceTrend: number;
}