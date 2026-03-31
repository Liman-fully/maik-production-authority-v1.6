import { IsOptional, IsNumber, IsString, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalculatePersonalScoreDto {
  @ApiProperty({ description: '简历ID' })
  @IsOptional()
  @IsString()
  resumeId?: string;

  @ApiProperty({ description: '人才ID' })
  @IsOptional()
  @IsString()
  talentId?: string;

  @ApiPropertyOptional({ description: '学历评分 0-100' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  education?: number;

  @ApiPropertyOptional({ description: '工作年限评分 0-100' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  experience?: number;

  @ApiPropertyOptional({ description: '技能评分 0-100' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  skills?: number;

  @ApiPropertyOptional({ description: '证书评分 0-100' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  certifications?: number;

  @ApiPropertyOptional({ description: '项目经验评分 0-100' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  projects?: number;

  @ApiPropertyOptional({ description: '稳定性评分 0-100' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  stability?: number;
}

export class CalculateMatchScoreDto {
  @ApiProperty({ description: '人才ID' })
  @IsString()
  talentId: string;

  @ApiPropertyOptional({ description: '职位ID' })
  @IsOptional()
  @IsString()
  jobId?: string;

  @ApiProperty({ description: '职位名称' })
  @IsString()
  jobTitle: string;

  @ApiPropertyOptional({ description: '职位要求' })
  @IsOptional()
  @IsString()
  jobRequirements?: string;

  @ApiPropertyOptional({ description: '要求技能列表' })
  @IsOptional()
  skills?: string[];

  @ApiPropertyOptional({ description: '薪资范围（最低）' })
  @IsOptional()
  @IsNumber()
  salaryMin?: number;

  @ApiPropertyOptional({ description: '薪资范围（最高）' })
  @IsOptional()
  @IsNumber()
  salaryMax?: number;

  @ApiPropertyOptional({ description: '工作地点' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '经验要求' })
  @IsOptional()
  @IsString()
  experienceRequired?: string;
}
