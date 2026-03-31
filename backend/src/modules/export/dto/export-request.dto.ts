import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
}

export class ExportRequestDto {
  @ApiProperty({ description: '简历 ID 列表', isArray: true })
  @IsArray()
  @IsNotEmpty({ each: true })
  resumeIds: string[];

  @ApiProperty({ description: '导出格式', enum: ExportFormat })
  @IsEnum(ExportFormat)
  format: ExportFormat;
}
