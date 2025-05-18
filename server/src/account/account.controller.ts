import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccountService } from './account.service';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { AccountResponseDto } from './dto/account-response.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { Currency, CurrencyValues } from 'common/enums/currency.enum';

@ApiTags('Account')
@ApiBearerAuth()
@Controller('account')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) { }

  @Post()
  @ApiOperation({ summary: 'Create new account' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Account created',
    type: AccountResponseDto
  })
  @HttpCode(HttpStatus.CREATED)
  async createAccount(
    @Req() req,
    @Body() createAccountDto: CreateAccountDto
  ): Promise<AccountResponseDto> {
    return this.accountService.createAccount(
      req.user.userId,
      createAccountDto
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all user accounts' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of accounts',
    type: [AccountResponseDto]
  })
  async getUserAccounts(
    @Req() req
  ): Promise<AccountResponseDto[]> {
    return this.accountService.getUserAccounts(req.user.userId);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete account' })
  @ApiParam({ name: 'id', type: String, description: 'Account ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Account deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Account not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(
    @Query('id', ParseObjectIdPipe) id: string,
    @Req() req,
  ): Promise<void> {
    await this.accountService.deleteAccount(req.user.userId, id);
  }

  @Get('currencies')
  @ApiOperation({ summary: 'Get available currencies' })
  @ApiResponse({
    status: 200,
    description: 'List of available currencies',
    type: [String]
  })
  getCurrencies() {
    return {
      currencies: CurrencyValues,
      defaultCurrency: Currency.CZK
    };
  }
}