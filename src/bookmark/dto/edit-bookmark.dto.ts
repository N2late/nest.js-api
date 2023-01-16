import { IsOptional, IsString } from 'class-validator';

// class EditBookmarkDto equal to create-bookmark.dto but every property is optional
export class EditBookmarkDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  link?: string;
}
