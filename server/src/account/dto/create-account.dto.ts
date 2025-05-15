import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  Min, 
  IsEnum,
  IsNotEmpty
} from 'class-validator';
import { 
  ApiProperty, 
  ApiPropertyOptional 
} from '@nestjs/swagger';
import { Currency, CurrencyValues } from '../../../common/enums/currency.enum';

export class CreateAccountDto {
  @ApiProperty({
    example: 'Main Savings Account',
    description: 'Account name'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Initial balance',
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;

  @ApiProperty({
    enum: CurrencyValues,
    default: Currency.RUB,
    description: 'Account currency code'
  })
  @IsEnum(Currency, { 
    message: `Invalid currency. Valid values: ${CurrencyValues.join(', ')}`
  })
  currency: Currency;
}