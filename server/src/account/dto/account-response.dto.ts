import { ApiProperty } from '@nestjs/swagger';
import { CurrencyValues } from 'common/enums/currency.enum';

export class AccountResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Unique account ID' })
  id: string;

  @ApiProperty({ example: 'Main Savings', description: 'Account name' })
  name: string;

  @ApiProperty({ example: 1000.50, description: 'Current balance' })
  balance: number;

  @ApiProperty({
    enum: CurrencyValues,
    example: 'USD',
    description: 'Account currency'
  })
  currency: string;

  @ApiProperty({ type: Date, description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'Last update timestamp' })
  updatedAt: Date;
}