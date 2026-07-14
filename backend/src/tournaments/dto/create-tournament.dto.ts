import { IsIn, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTournamentDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsIn(['ROUND_ROBIN', 'SINGLE_ELIM'])
  format: string;

  @IsOptional()
  @IsIn(['SINGLE', 'DOUBLES', 'TRIPLES'])
  modality?: string;

  @IsOptional()
  @IsInt()
  targetPoints?: number;
}
