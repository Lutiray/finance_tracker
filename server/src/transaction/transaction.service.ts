import { Injectable, BadRequestException, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction } from './schemas/transaction.schema';
import { Account } from '../account/schemas/account.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionSummaryDto } from './dto/transaction-summary.dto';
import { TransferDto } from './dto/transfer.dto';
import { TransferResponseDto } from './dto/transfer-response.dto';
import { TRANSFER_CATEGORY_ID } from 'common/constants';
import { Category } from 'src/category/schemas/category.schema';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
  ) { }

  private calculateAmount(type: 'income' | 'expense', amount: number): number {
    return type === 'income' ? amount : -amount;
  }

  async create(dto: CreateTransactionDto, userId: Types.ObjectId) {
    const session = await this.transactionModel.db.startSession();
    session.startTransaction();

    try {
      const [transaction] = await this.transactionModel.create(
        [{
          ...dto,
          categoryId: new Types.ObjectId(dto.categoryId),
          accountId: new Types.ObjectId(dto.accountId),
          userId,
          date: dto.date ? new Date(dto.date) : new Date(),
        }],
        { session }
      );

      await this.accountModel.findByIdAndUpdate(
        dto.accountId,
        { $inc: { balance: this.calculateAmount(dto.type, dto.amount) } },
        { session, new: true }
      );

      await session.commitTransaction();
      return transaction;
    } catch (err) {
      await session.abortTransaction();
      this.logger.error(`Transaction failed: ${err.message}`, err.stack);
      throw new BadRequestException('Transaction creation failed');
    } finally {
      session.endSession();
    }
  }

  async deleteTransaction(id: string, userId: Types.ObjectId) {
    const session = await this.transactionModel.db.startSession();
    session.startTransaction();

    try {
      const transaction = await this.transactionModel.findOneAndDelete(
        { _id: id, userId },
        { session }
      ).exec();

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      await this.accountModel.findByIdAndUpdate(
        transaction.accountId,
        { $inc: { balance: this.calculateAmount(transaction.type, transaction.amount) * -1 } },
        { session, new: true }
      );

      await session.commitTransaction();
      return transaction;
    } catch (err) {
      await session.abortTransaction();
      this.logger.error(`Delete transaction failed: ${err.message}`);
      throw err;
    } finally {
      session.endSession();
    }
  }

  async findAll(userId: Types.ObjectId, filters?: {
    type?: 'income' | 'expense';
    categoryId?: string;
    from?: string;
    to?: string;
  }) {
    const query: any = { userId };

    if (filters?.type) query.type = filters.type;
    if (filters?.categoryId) query.categoryId = new Types.ObjectId(filters.categoryId);

    if (filters?.from || filters?.to) {
      query.date = {};
      if (filters.from) query.date.$gte = new Date(filters.from);
      if (filters.to) query.date.$lte = new Date(filters.to);
    }

    return this.transactionModel.find(query)
      .sort({ date: -1 })
      .populate('categoryId', 'name')
      .populate('accountId', 'name balance currency')
      .exec();
  }

  async getSummary(
    userId: Types.ObjectId,
    filters: { from?: string; to?: string } = {}
  ): Promise<TransactionSummaryDto> {
    const match: any = { userId };

    if (filters.from || filters.to) {
      match.date = {};
      if (filters.from) match.date.$gte = new Date(filters.from);
      if (filters.to) match.date.$lte = new Date(filters.to);
    }

    const result = await this.transactionModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          balance: {
            $sum: {
              $cond: [
                { $eq: ["$type", "income"] },
                "$amount",
                { $multiply: ["$amount", -1] }
              ]
            }
          },
          monthlyIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
            }
          },
          monthlyExpenses: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
            }
          },
          incomeTrend: { $avg: "$amount" }, // Пример расчета тренда
          expensesTrend: { $avg: "$amount" } // Пример расчета тренда
        }
      },
      {
        $project: {
          _id: 0,
          balance: 1,
          monthlyIncome: 1,
          monthlyExpenses: 1,
          incomeTrend: 1,
          expensesTrend: 1,
          balanceTrend: { $subtract: ["$incomeTrend", "$expensesTrend"] }
        }
      }
    ]);

    return result[0] || {
      balance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      incomeTrend: 0,
      expensesTrend: 0,
      balanceTrend: 0
    };
  }

  async getBalanceHistory(
    userId: Types.ObjectId,
    period: 'week' | 'month' | 'year' = 'month'
  ) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }

    const transactions = await this.transactionModel.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate }
        }
      },
      { $sort: { date: 1 } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          dailyBalance: {
            $sum: {
              $cond: [
                { $eq: ["$type", "income"] },
                "$amount",
                { $multiply: ["$amount", -1] }
              ]
            }
          },
          date: { $first: "$date" }
        }
      },
      {
        $project: {
          _id: 0,
          date: 1,
          dailyBalance: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Рассчитываем нарастающий баланс
    let balance = 0;
    return transactions.map(item => {
      balance += item.dailyBalance;
      return {
        date: item.date,
        balance
      };
    });
  }

  async getRecentTransactions(userId: Types.ObjectId, limit: number = 5) {
    const recentTransactions = await this.transactionModel
      .find({ userId })
      .sort({ date: -1 })
      .limit(limit)
      .populate('categoryId', 'name')
      .exec();

    return recentTransactions.map(tx => ({
      id: tx._id,
      category: (tx.categoryId as Category)?.name || 'Uncategorized',
      date: tx.date.toISOString().split('T')[0],
      amount: tx.amount,
      type: tx.type,
    }));
  }

  async transferFunds(
    userId: Types.ObjectId,
    dto: TransferDto
  ): Promise<TransferResponseDto> {
    const session = await this.transactionModel.db.startSession();
    session.startTransaction();

    try {
      // Checking accounts
      const [fromAccount, toAccount] = await Promise.all([
        this.accountModel.findById(dto.fromAccountId).session(session),
        this.accountModel.findById(dto.toAccountId).session(session)
      ]);

      if (!fromAccount || !toAccount) {
        throw new NotFoundException('One or both accounts not found');
      }

      if (fromAccount.userId.toString() !== userId.toString()) {
        throw new ForbiddenException('Source account belongs to another user');
      }

      // 2. Checking balance
      if (fromAccount.balance < dto.amount) {
        throw new BadRequestException('Insufficient funds');
      }

      // Balance update 
      await Promise.all([
        this.accountModel.findByIdAndUpdate(
          dto.fromAccountId,
          { $inc: { balance: -dto.amount } },
          { session }
        ),
        this.accountModel.findByIdAndUpdate(
          dto.toAccountId,
          { $inc: { balance: dto.amount } },
          { session }
        )
      ]);

      // Creating transaction
      const transferDate = new Date();
      const [outgoingTx, incomingTx] = await Promise.all([
        this.transactionModel.create([{
          type: 'expense',
          amount: dto.amount,
          accountId: dto.fromAccountId,
          categoryId: TRANSFER_CATEGORY_ID,
          userId,
          date: transferDate,
          note: `Transfer to ${toAccount.name}`
        }], { session }),

        this.transactionModel.create([{
          type: 'income',
          amount: dto.amount,
          accountId: dto.toAccountId,
          categoryId: TRANSFER_CATEGORY_ID,
          userId: toAccount.userId,
          date: transferDate,
          note: `Transfer from ${fromAccount.name}`
        }], { session })
      ]);

      await session.commitTransaction();

      return {
        success: true,
        newSourceBalance: fromAccount.balance - dto.amount,
        newDestinationBalance: toAccount.balance + dto.amount
      };

    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}