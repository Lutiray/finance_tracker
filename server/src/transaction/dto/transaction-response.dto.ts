import { ApiProperty } from '@nestjs/swagger';

export class TransactionSummaryDto {
  @ApiProperty({ description: 'Total balance' })
  balance: number;

  @ApiProperty({ description: 'Monthly income' })
  monthlyIncome: number;

  @ApiProperty({ description: 'Monthly expenses' })
  monthlyExpenses: number;
}

export class BalanceHistoryItem {
  @ApiProperty({ type: Date })
  date: Date;

  @ApiProperty()
  balance: number;
}