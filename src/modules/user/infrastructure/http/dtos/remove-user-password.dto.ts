import { IsString } from 'class-validator';

export class RemoveUserPasswordDto {
  @IsString()
  currentPassword: string;
}
