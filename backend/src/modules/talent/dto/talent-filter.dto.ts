import { IsOptional, IsString, IsArray, IsEnum, IsInt, Min, IsBoolean, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum JobStatus {
  ACTIVELY_LOOKING = 'actively_looking',
  OPEN_TO_OFFERS = 'open_to_offers',
  NOT_LOOKING = 'not_looking',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum SortBy {
  LATEST = 'latest',
  ACTIVE = 'active',
  SCORE = 'score',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class TalentFilterDto {
  @ApiPropertyOptional({ description: '工作地点' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '工作经验' })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiPropertyOptional({ description: '学历' })
  @IsOptional()
  @IsString()
  education?: string;

  @ApiPropertyOptional({ description: '技能标签（逗号分隔）' })
  @IsOptional()
  @IsString()
  skills?: string;

  @ApiPropertyOptional({ description: '公司名称' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: '期望薪资' })
  @IsOptional()
  @IsString()
  expectedSalary?: string;

  @ApiPropertyOptional({ description: '求职状态', enum: JobStatus })
  @IsOptional()
  @IsEnum(JobStatus)
  jobStatus?: JobStatus;

  @ApiPropertyOptional({ description: '年龄范围（25-35）' })
  @IsOptional()
  @IsString()
  age?: string;

  @ApiPropertyOptional({ description: '性别', enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: '行业' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: '工作类型' })
  @IsOptional()
  @IsString()
  jobType?: string;

  @ApiPropertyOptional({ description: '工作年限范围（3-8）' })
  @IsOptional()
  @IsString()
  workExperience?: string;

  @ApiPropertyOptional({ description: '毕业年份范围（2015-2020）' })
  @IsOptional()
  @IsString()
  educationYear?: string;

  @ApiPropertyOptional({ description: '技能数量范围（5-20）' })
  @IsOptional()
  @IsString()
  skillsCount?: string;

  @ApiPropertyOptional({ description: '最后活跃时间范围（7 天，30 天）' })
  @IsOptional()
  @IsString()
  lastActive?: string;

  @ApiPropertyOptional({ description: '匹配分数范围（80-100）' })
  @IsOptional()
  @IsString()
  matchScore?: string;

  @ApiPropertyOptional({ description: '简历完整度' })
  @IsOptional()
  @IsBoolean()
  resumeComplete?: boolean;

  @ApiPropertyOptional({ description: '已认证用户' })
  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: '排序字段', enum: SortBy, default: 'latest' })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.LATEST;

  @ApiPropertyOptional({ description: '排序方式', enum: SortOrder, default: 'desc' })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
