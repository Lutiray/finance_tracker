import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNumber, Min } from "class-validator";

// src/transactions/dto/transfer.dto.ts
export class TransferDto {
  @ApiProperty()
  @IsMongoId()
  fromAccountId: string;

  @ApiProperty()
  @IsMongoId()
  toAccountId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;
}