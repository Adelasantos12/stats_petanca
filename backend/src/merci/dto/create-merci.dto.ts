import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateMerciDto {
  @IsOptional()
  @IsString()
  notes?: string;

  // { "1.1": 5, "1.2": 4, ... } — se valida pregunta a pregunta en el servicio.
  @IsObject()
  scores: Record<string, number>;
}
