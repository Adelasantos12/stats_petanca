import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class PlayerRegisterDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class PlayerLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class PlayerGoogleDto {
  @IsString()
  credential: string;
}
