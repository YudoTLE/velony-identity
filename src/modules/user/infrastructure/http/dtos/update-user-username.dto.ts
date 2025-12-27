import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateUserUsernameDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[A-Za-z0-9_]+$/)
  username: string;
}
