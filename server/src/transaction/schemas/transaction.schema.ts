import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ required: true })
  type: 'income' | 'expense';

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, type: Types.ObjectId })
  categoryId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  accountId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop()
  note?: string;

  @Prop({ required: true, type: Types.ObjectId })
  userId: Types.ObjectId;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
