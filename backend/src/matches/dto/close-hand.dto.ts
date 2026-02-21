import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { TeamSide } from '../../throws/dto/create-throw.dto';

export class CloseHandDto {
  @IsEnum(TeamSide)
  @IsOptional()
  pointsTeam?: TeamSide;

  @IsInt()
  @IsOptional()
  pointsValue?: number;
}
