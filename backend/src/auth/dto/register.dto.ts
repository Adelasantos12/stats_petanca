import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  // Solo lo respeta un SUPER_ADMIN; en el alta inicial se ignora.
  @IsOptional()
  @IsIn(['COACH', 'SUPER_ADMIN'])
  role?: 'COACH' | 'SUPER_ADMIN';
}
