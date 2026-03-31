import { IsString, IsOptional, IsEnum } from 'class-validator';
import { JobStatus } from '../job.entity';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsEnum(['draft', 'published', 'closed'])
  status?: JobStatus;
}

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsEnum(['draft', 'published', 'closed'])
  status?: JobStatus;
}
