import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AcnService } from './acn.service';

class DistributeContributionDto {
  resumeId: string;
  downloaderId: string;
  amount: number;
  sower?: string;
  keyHolder?: string;
  maintainer?: string;
  promoter?: string;
  reviewer?: string;
}

class ConfirmPaymentDto {
  contributionLogId: string;
}

@ApiTags('ACN分账')
@Controller('acn')
export class AcnController {
  constructor(private readonly acnService: AcnService) {}

  @Post('distribute')
  @ApiOperation({ summary: '执行分账 (40/60分成)' })
  async distribute(@Body() dto: DistributeContributionDto) {
    const roleAssignments: Record<string, string> = {
      sower: dto.sower,
      key_holder: dto.keyHolder,
      maintainer: dto.maintainer,
      promoter: dto.promoter,
      reviewer: dto.reviewer,
    };

    const result = await this.acnService.distributeContribution(
      dto.resumeId,
      dto.downloaderId,
      dto.amount,
      roleAssignments,
    );

    return {
      success: true,
      data: result,
      message: '分账成功 (平台40%, 贡献池60%)',
    };
  }

  @Post('confirm')
  @ApiOperation({ summary: '确认支付并结算' })
  async confirmPayment(@Body() dto: ConfirmPaymentDto) {
    await this.acnService.confirmPayment(dto.contributionLogId);
    return { success: true, message: '支付已确认' };
  }

  @Get('weights')
  @ApiOperation({ summary: '获取当前分账权重配置' })
  async getWeights() {
    const weights = await this.acnService.getActiveWeights();
    return {
      success: true,
      data: {
        platform: 40,
        pool: 60,
        roles: weights,
      },
    };
  }

  @Get('earnings/:userId')
  @ApiOperation({ summary: '获取用户累计收益' })
  async getUserEarnings(@Param('userId') userId: string) {
    const total = await this.acnService.getUserTotalEarnings(userId);
    const pending = await this.acnService.getUserPendingEarnings(userId);

    return {
      success: true,
      data: {
        userId,
        totalEarnings: total,
        pendingEarnings: pending,
        availableEarnings: total - pending,
      },
    };
  }

  @Post('init-weights')
  @ApiOperation({ summary: '初始化默认权重配置' })
  async initWeights() {
    await this.acnService.initializeDefaultWeights();
    return { success: true, message: '默认权重配置已初始化' };
  }
}