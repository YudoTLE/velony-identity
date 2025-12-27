import { IsString } from 'class-validator';

export class UpdateUserAvatarPathDto {
  @IsString()
  avatarPath: string;
}
