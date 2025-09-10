import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, Length, IsEmail, IsUrl } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @Length(2, 30)
  username?: string;
  @IsOptional()
  @IsEmail()
  email?: string;
  @IsOptional()
  @IsString()
  @Length(6, 20)
  password?: string;
  @IsOptional()
  @IsString()
  @Length(0, 200)
  about?: string;
  @IsOptional()
  @IsUrl()
  avatar?: string;
}
