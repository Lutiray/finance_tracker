import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      delete ret.userId;
      ret.id = doc._id.toString();
    }
  }
})
export class Category {
  @ApiProperty({ example: 'Food', description: 'Category name' })
  @Prop({
    required: true,
    trim: true,
    maxlength: 50
  })
  name: string;

  @ApiProperty({
    enum: CategoryType,
    example: CategoryType.EXPENSE,
    description: 'Type of category'
  })
  @Prop({
    required: true,
    enum: CategoryType,
    type: String
  })
  type: CategoryType;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export type CategoryDocument = Category & Document & {
  _id: Types.ObjectId;
};

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ userId: 1, name: 1 }, { unique: true });