import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsNotEmpty()
  @IsString()
  id: string;
}
