import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PaginatedDto {
  @IsNotEmpty()
  @IsString()
  page: string;

  @IsNotEmpty()
  @IsString()
  size: string;

  @IsOptional()
  @IsString()
  search?: string;
}
