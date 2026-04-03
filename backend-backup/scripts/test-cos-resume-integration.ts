import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ResumeService } from '../src/modules/resume/resume.service';
import { CosService } from '../src/common/storage/cos.service';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 测试脚本：完整的简历上传/下载/删除流程
 * 
 * 使用方法：
 * npm run ts-node -- backend/scripts/test-cos-resume-integration.ts
 */

async function main() {
  const app = await NestFactory.create(AppModule);
  const resumeService = app.get(ResumeService);
  const cosService = app.get(CosService);

  console.log('🚀 开始测试 COS 集成...\n');

  try {
    // 1. 测试 COS 连接
    console.log('📡 测试 COS 连接...');
    const connected = await cosService.testConnection();
    if (!connected) {
      throw new Error('COS 连接失败，请检查配置');
    }
    console.log('✅ COS 连接成功\n');

    // 2. 创建测试文件
    console.log('📝 创建测试文件...');
    const testFileName = 'test-resume.txt';
    const testFilePath = path.join('/tmp', testFileName);
    const testContent = `
测试简历
========

基本信息
--------
姓名: 张三
电话: 13800138000
邮箱: zhangsan@example.com
年龄: 28
性别: 男
地点: 北京

工作经历
--------
1. 公司A (2020-2023)
   职位: 高级工程师
   描述: 负责后端系统开发

2. 公司B (2023-至今)
   职位: 技术负责人
   描述: 领导技术团队

技能
----
- Node.js
- TypeScript
- NestJS
- PostgreSQL
- Redis
    `;
    fs.writeFileSync(testFilePath, testContent);
    console.log(`✅ 测试文件创建成功: ${testFilePath}\n`);

    // 3. 测试上传
    console.log('📤 测试上传简历到 COS...');
    const userId = 'test-user-' + Date.now();
    const fileBuffer = fs.readFileSync(testFilePath);
    
    const uploadResult = await cosService.uploadResume(
      userId,
      fileBuffer,
      testFileName,
    );
    
    console.log(`✅ 上传成功`);
    console.log(`   URL: ${uploadResult.url}`);
    console.log(`   Key: ${uploadResult.key}\n`);

    // 4. 测试获取签名 URL
    console.log('🔗 测试获取签名 URL...');
    const signedUrl = await cosService.getSignedUrl(uploadResult.key, 3600);
    console.log(`✅ 签名 URL 获取成功`);
    console.log(`   URL: ${signedUrl}\n`);

    // 5. 测试下载
    console.log('📥 测试下载文件...');
    const downloadedBuffer = await cosService.downloadFile(uploadResult.url);
    const downloadedContent = downloadedBuffer.toString('utf-8');
    
    if (downloadedContent === testContent) {
      console.log('✅ 下载成功，文件内容一致\n');
    } else {
      throw new Error('下载的文件内容不一致');
    }

    // 6. 测试删除
    console.log('🗑️  测试删除文件...');
    await cosService.deleteFile(uploadResult.key);
    console.log('✅ 删除成功\n');

    // 7. 验证删除
    console.log('🔍 验证文件已删除...');
    try {
      await cosService.downloadFile(uploadResult.url);
      throw new Error('文件应该已被删除');
    } catch (error) {
      if (error.message === '文件应该已被删除') {
        throw error;
      }
      console.log('✅ 文件已确认删除\n');
    }

    // 8. 清理测试文件
    console.log('🧹 清理测试文件...');
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    console.log('✅ 清理完成\n');

    console.log('🎉 所有测试通过！COS 集成正常工作\n');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await app.close();
  }
}

main();
