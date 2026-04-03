import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TalentService } from './talent.service';
import { TalentFilterDto, JobStatus, SortBy, SortOrder } from './dto/talent-filter.dto';

@ApiTags('人才广场')
@Controller('talents')
// 修复: 人才广场接口公开访问，不需要登录即可查看
export class TalentController {
  constructor(private readonly talentService: TalentService) {}

  @Get()
  @ApiOperation({ summary: '获取人才列表' })
  @ApiQuery({ name: 'location', required: false, type: String, description: '工作地点' })
  @ApiQuery({ name: 'experience', required: false, type: String, description: '工作经验' })
  @ApiQuery({ name: 'education', required: false, type: String, description: '学历' })
  @ApiQuery({ name: 'skills', required: false, type: String, description: '技能标签（逗号分隔）' })
  @ApiQuery({ name: 'company', required: false, type: String, description: '公司名称' })
  @ApiQuery({ name: 'expectedSalary', required: false, type: String, description: '期望薪资' })
  @ApiQuery({ name: 'jobStatus', required: false, enum: JobStatus, description: '求职状态' })
  @ApiQuery({ name: 'age', required: false, type: String, description: '年龄范围：25-35' })
  @ApiQuery({ name: 'gender', required: false, enum: ['male', 'female'], description: '性别' })
  @ApiQuery({ name: 'industry', required: false, type: String, description: '行业' })
  @ApiQuery({ name: 'jobType', required: false, type: String, description: '工作类型' })
  @ApiQuery({ name: 'workExperience', required: false, type: String, description: '工作年限范围' })
  @ApiQuery({ name: 'educationYear', required: false, type: String, description: '毕业年份范围' })
  @ApiQuery({ name: 'skillsCount', required: false, type: String, description: '技能数量范围' })
  @ApiQuery({ name: 'lastActive', required: false, type: String, description: '最后活跃时间范围' })
  @ApiQuery({ name: 'matchScore', required: false, type: String, description: '匹配分数范围' })
  @ApiQuery({ name: 'resumeComplete', required: false, type: Boolean, description: '简历完整度' })
  @ApiQuery({ name: 'verified', required: false, type: Boolean, description: '已认证用户' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: '每页数量' })
  @ApiQuery({ name: 'sortBy', required: false, enum: SortBy, description: '排序字段' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder, description: '排序方式' })
  async getTalents(@Query() filter: TalentFilterDto) {
    return this.talentService.getTalents(filter);
  }
}
