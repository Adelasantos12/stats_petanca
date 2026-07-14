import { IsString } from 'class-validator';

export class GoogleDto {
  // ID token (credential) devuelto por Google Identity Services en el frontend.
  @IsString()
  credential: string;
}
