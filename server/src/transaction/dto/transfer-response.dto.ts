import { ApiProperty } from "@nestjs/swagger";

// src/transactions/dto/transfer-response.dto.ts
export class TransferResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  newSourceBalance: number;

  @ApiProperty()
  newDestinationBalance: number;
}