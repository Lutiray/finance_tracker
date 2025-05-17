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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-categoty.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly service: CategoryService) { }

  @Post()
  @ApiOperation({ summary: 'Create new category' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CategoryResponseDto
  })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Req() req,
    @Body() dto: CreateCategoryDto
  ): Promise<CategoryResponseDto> {
    return this.service.create(dto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get user categories' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [CategoryResponseDto]
  })
  findAll(@Req() req): Promise<CategoryResponseDto[]> {
    return this.service.findAll(req.user.userId);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete category by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Category ID in query parameter', required: true
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Category not found or access denied'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invalid ID format'
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Query('id', ParseObjectIdPipe) id: string,
    @Req() req,
  ): Promise<void> {
    await this.service.delete(id, req.user.userId);
  }
}