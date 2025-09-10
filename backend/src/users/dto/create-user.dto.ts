import { IsString, IsEmail, Length, IsUrl, IsOptional } from 'class-validator';
export class CreateUserDto {
  @IsString()
  @Length(2, 30)
  username: string;
  @IsEmail()
  email: string;
  @IsString()
  @Length(6, 20)
  password: string;
  @IsOptional()
  @IsString()
  @Length(0, 200)
  about?: string;
  @IsOptional()
  @IsUrl()
  avatar?: string;
}
