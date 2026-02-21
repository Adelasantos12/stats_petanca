import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum TeamSide {
  A = 'A',
  B = 'B',
}

export enum ThrowType {
  POINT = 'POINT',
  TIR = 'TIR',
}

export class CreateThrowDto {
  @IsInt()
  handNumber: number;

  @IsEnum(TeamSide)
  teamSide: TeamSide;

  @IsString()
  playerId: string;

  @IsEnum(ThrowType)
  throwType: ThrowType;

  @IsInt()
  @Min(-2)
  @Max(2)
  effectivenessScore: number;

  @IsNumber()
  @IsOptional()
  distanceD?: number;

  @IsString()
  @IsOptional()
  note?: string;
}
