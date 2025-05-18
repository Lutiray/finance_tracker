import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Account, AccountDocument } from './schemas/account.schema';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountResponseDto } from './dto/account-response.dto';
import { Currency, CurrencyUtils } from 'common/enums/currency.enum';


@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>
  ) { }

  async createAccount(
    userId: Types.ObjectId,
    createAccountDto: CreateAccountDto
  ): Promise<AccountResponseDto> {
    const createdAccount = await this.accountModel.create({
      ...createAccountDto,
      userId,
      balance: createAccountDto.balance || 0
    });

    return this.mapToDto(createdAccount);
  }

  async getUserAccounts(
    userId: Types.ObjectId
  ): Promise<AccountResponseDto[]> {
    const accounts = await this.accountModel
      .find({ userId })
      .lean()
      .exec();

    return accounts.map(this.mapToDto);
  }

  async deleteAccount(userId: string, accountId: string): Promise<void> {
    const result = await this.accountModel.deleteOne({
      _id: new Types.ObjectId(accountId),
      userId: userId
    })
      .exec();

    if (result.deletedCount === 0) {
      const accountExists = await this.accountModel.exists({
        _id: new Types.ObjectId(accountId)
      });

      throw new NotFoundException(
        accountExists ? 'Access denied: Account belongs to another user'
          : 'Account not found'
      );
    }
  }

  formatBalance(balance: number, currency: Currency): string {
    return CurrencyUtils.formatAmount(balance, currency);
  }

  private mapToDto(account: AccountDocument): AccountResponseDto {
    return {
      id: account._id.toString(),
      name: account.name,
      balance: account.balance,
      currency: account.currency as Currency,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };
  }
}