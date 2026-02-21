import { IsEnum } from 'class-validator';

export enum EndReason {
  TARGET_REACHED = 'TARGET_REACHED',
  TIME = 'TIME',
  MANUAL = 'MANUAL',
}

export class FinishMatchDto {
  @IsEnum(EndReason)
  endReason: EndReason;
}
