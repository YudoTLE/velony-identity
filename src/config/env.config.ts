import { isTimeString } from '@velony/utils';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  Validate,
  ValidatorConstraint,
} from 'class-validator';
import { type ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isTimeString', async: false })
export class IsTimeString implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    return isTimeString(value);
  }
}

export class EnvironmentVariables {
  @IsOptional()
  @IsString()
  NODE_ENV: 'test' | 'development' | 'production' = 'development';

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 5001;

  @IsOptional()
  @IsString()
  FRONTEND_ORIGIN: string = 'http://localhost:3000';

  @IsString()
  DB_URL: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  DB_MAX_CONNECTIONS: number = 20;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1000)
  DB_IDLE_TIMEOUT: number = 30000;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1000)
  DB_CONNECTION_TIMEOUT: number = 2000;

  @IsOptional()
  @IsString()
  REDIS_HOST: string = 'localhost';

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(65535)
  REDIS_PORT: number = 6379;

  @IsString()
  REDIS_PASSWORD: string;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsOptional()
  @IsString()
  @Validate(IsTimeString)
  JWT_ACCESS_EXPIRATION: string = '15m';

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsOptional()
  @IsString()
  @Validate(IsTimeString)
  JWT_REFRESH_EXPIRATION: string = '7d';

  @IsUrl()
  S3_ENDPOINT: string;

  @IsString()
  S3_REGION: string;

  @IsString()
  S3_BUCKET: string;

  @IsString()
  S3_ACCESS_KEY_ID: string;

  @IsString()
  S3_SECRET_ACCESS_KEY: string;

  @IsString()
  RESEND_API_KEY: string;

  @IsEmail()
  EMAIL_FROM: string;

  @IsOptional()
  @IsString()
  @Validate(IsTimeString)
  EMAIL_TOKEN_EXPIRATION: string = '5m';

  @Transform(({ value }) => value.split(',').map((v: string) => v.trim()))
  @IsString({ each: true })
  KAFKA_BROKERS: string[];

  @IsString()
  KAFKA_USERNAME: string;

  @IsString()
  KAFKA_PASSWORD: string;

  @IsString()
  KAFKA_CA_PATH: string;
}
