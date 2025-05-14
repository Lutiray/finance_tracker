import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Transaction extends Document {
  @ApiProperty({ enum: ['income', 'expense'] })
  @Prop({
    required: true,
    enum: ['income', 'expense'],
    type: String,
  })
  type: 'income' | 'expense';

  @ApiProperty({ minimum: 0.01 })
  @Prop({
    required: true,
    min: 0.01,
    validate: {
      validator: (v: number) => v > 0,
      message: 'Amount must be positive',
    },
  })
  amount: number;

  @ApiProperty({ type: String })
  @Prop({ required: true, type: Types.ObjectId, ref: 'Category' })
  categoryId: Types.ObjectId;

  @ApiProperty({ type: String })
  @Prop({ required: true, type: Types.ObjectId, ref: 'Account' })
  accountId: Types.ObjectId;

  @ApiProperty()
  @Prop({ default: Date.now })
  date: Date;

  @ApiProperty({ required: false })
  @Prop()
  note?: string;

  @ApiProperty({ type: String })
  @Prop({ required: true, type: Types.ObjectId, index: true })
  userId: Types.ObjectId;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);