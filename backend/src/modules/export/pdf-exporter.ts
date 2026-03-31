import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PdfExporter {
  /**
   * 导出简历为 PDF 文件
   * @param resumes 简历数据数组
   * @param userId 用户 ID
   * @returns 文件路径
   */
  async export(resumes: any[], userId: string): Promise<string> {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `resumes_${Date.now()}.pdf`;
    const filePath = path.join('uploads', 'exports', userId, fileName);
    const fullPath = path.join(process.cwd(), filePath);

    // 创建目录
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 写入文件
    const stream = fs.createWriteStream(fullPath);
    doc.pipe(stream);

    // 生成 PDF 内容
    resumes.forEach((resume, index) => {
      if (index > 0) doc.addPage();

      // 标题 - 姓名
      doc.fontSize(24).font('Helvetica-Bold').text(resume.basicInfo?.name || '未命名简历', { align: 'center' });
      doc.moveDown(0.5);

      // 基本信息
      doc.fontSize(12).font('Helvetica');
      const info = resume.basicInfo;
      if (info) {
        const infoLines = [];
        if (info.phone) infoLines.push(`电话：${info.phone}`);
        if (info.email) infoLines.push(`邮箱：${info.email}`);
        if (info.location) infoLines.push(`地点：${info.location}`);
        if (info.gender) infoLines.push(`性别：${info.gender}`);
        if (info.age) infoLines.push(`年龄：${info.age}`);
        if (infoLines.length > 0) {
          doc.text(infoLines.join(' | '), { align: 'center' });
        }
      }

      doc.moveDown(1);

      // 求职意向
      if (resume.jobIntention) {
        doc.fontSize(16).font('Helvetica-Bold').text('求职意向', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica');
        const intention = resume.jobIntention;
        if (intention.expectedPosition) doc.text(`期望职位：${intention.expectedPosition}`);
        if (intention.expectedSalary) doc.text(`期望薪资：${intention.expectedSalary}`);
        if (intention.expectedLocation) doc.text(`期望地点：${intention.expectedLocation}`);
        doc.moveDown(0.5);
      }

      // 工作经历
      if (resume.workExperience && resume.workExperience.length > 0) {
        doc.fontSize(16).font('Helvetica-Bold').text('工作经历', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica');
        resume.workExperience.forEach((exp: any) => {
          doc.fontSize(12).font('Helvetica-Bold').text(`${exp.position} | ${exp.company}`);
          doc.fontSize(10).font('Helvetica').text(`${exp.startDate} - ${exp.endDate}`);
          if (exp.description) {
            doc.text(exp.description, { indent: 20 });
          }
          doc.moveDown(0.5);
        });
      }

      // 教育经历
      if (resume.education && resume.education.length > 0) {
        doc.fontSize(16).font('Helvetica-Bold').text('教育经历', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica');
        resume.education.forEach((edu: any) => {
          doc.fontSize(12).font('Helvetica-Bold').text(`${edu.school} - ${edu.major} (${edu.degree})`);
          doc.fontSize(10).font('Helvetica').text(`${edu.startDate} - ${edu.endDate}`);
          doc.moveDown(0.3);
        });
      }

      // 技能
      if (resume.skills && resume.skills.length > 0) {
        doc.fontSize(16).font('Helvetica-Bold').text('专业技能', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica');
        doc.text(resume.skills.join(', '));
      }

      // 项目经验
      if (resume.projects && resume.projects.length > 0) {
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold').text('项目经验', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica');
        resume.projects.forEach((proj: any, idx: number) => {
          doc.fontSize(12).font('Helvetica-Bold').text(`${idx + 1}. ${proj.name} - ${proj.role}`);
          doc.fontSize(10).font('Helvetica').text(`${proj.startDate} - ${proj.endDate}`);
          if (proj.description) {
            doc.text(proj.description, { indent: 20 });
          }
          doc.moveDown(0.5);
        });
      }
    });

    doc.end();

    // 等待写入完成
    await new Promise<void>((resolve, reject) => {
      stream.on('finish', () => resolve());
      stream.on('error', reject);
    });

    return filePath;
  }
}
