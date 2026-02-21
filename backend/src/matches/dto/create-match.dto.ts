import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ArrayMinSize,
  IsArray,
} from 'class-validator';

export enum Modality {
  SINGLE = 'SINGLE',
  DOUBLES = 'DOUBLES',
  TRIPLES = 'TRIPLES',
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
  @IsString({ each: true })
  @ArrayMinSize(1)
  playersA: string[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  playersB: string[];
}
