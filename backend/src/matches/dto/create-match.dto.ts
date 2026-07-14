import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum Modality {
  SINGLE = 'SINGLE',
  DOUBLES = 'DOUBLES',
  TRIPLES = 'TRIPLES',
}

/**
 * Un jugador de la partida puede venir del roster (por `id`) o como nombre
 * suelto (`name`), p.ej. un invitado del parque. Debe traer al menos uno.
 */
export class PlayerInputDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class CreateMatchDto {
  @IsEnum(Modality)
  modality: Modality;

  @IsInt()
  @IsOptional()
  targetPoints?: number = 13;

  @IsString()
  teamAName: string;

  @IsString()
  teamBName: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PlayerInputDto)
  playersA: PlayerInputDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PlayerInputDto)
  playersB: PlayerInputDto[];
}
