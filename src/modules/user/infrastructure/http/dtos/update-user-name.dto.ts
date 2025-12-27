import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserNameDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;
}
