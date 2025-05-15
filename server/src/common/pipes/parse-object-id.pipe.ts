// src/common/pipes/parse-object-id.pipe.ts
import { 
  PipeTransform, 
  Injectable, 
  BadRequestException,
  ArgumentMetadata
} from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<any, Types.ObjectId> {
  transform(value: any, metadata: ArgumentMetadata): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`Invalid ObjectId for ${metadata.data}`);
    }
    return new Types.ObjectId(value);
  }
}