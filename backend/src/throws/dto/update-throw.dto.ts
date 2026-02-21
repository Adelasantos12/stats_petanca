import { PartialType } from '@nestjs/mapped-types';
import { CreateThrowDto } from './create-throw.dto';

export class UpdateThrowDto extends PartialType(CreateThrowDto) {}
