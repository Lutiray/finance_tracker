import {
    Injectable,
    NotFoundException,
    ConflictException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-categoty.dto';
import { CategoryResponseDto } from './dto/category-response.dto';

@Injectable()
export class CategoryService {
    constructor(
        @InjectModel(Category.name)
        private categoryModel: Model<CategoryDocument>
    ) { }

    private toDto(doc: CategoryDocument): CategoryResponseDto {
        return {
            id: doc._id.toString(),
            name: doc.name,
            type: doc.type,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        };
    }

    async create(
        dto: CreateCategoryDto,
        userId: string
    ): Promise<CategoryResponseDto> {
        try {
            const created = await this.categoryModel.create({
                ...dto,
                userId: new Types.ObjectId(userId)
            });
            return this.toDto(created);
        } catch (err) {
            if (err.code === 11000) {
                throw new ConflictException('Category with this name already exists');
            }
            throw err;
        }
    }

    async findAll(userId: string): Promise<CategoryResponseDto[]> {
        const categories = await this.categoryModel
            .find({ userId: new Types.ObjectId(userId) })
            .sort({ name: 1 })
            .exec();

        return categories.map(this.toDto);
    }

    async delete(id: string, userId: string): Promise<void> {
        const result = await this.categoryModel
            .deleteOne({
                _id: new Types.ObjectId(id),
                userId: new Types.ObjectId(userId)
            })
            .exec();

        if (result.deletedCount === 0) {
            throw new NotFoundException('Category not found');
        }
    }
}