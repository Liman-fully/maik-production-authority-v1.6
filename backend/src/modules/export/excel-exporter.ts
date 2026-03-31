import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ExcelExporter {
  /**
   * 导出简历为 Excel 文件
   * @param resumes 简历数据数组
   * @param userId 用户 ID
   * @returns 文件路径
   */
  async export(resumes: any[], userId: string): Promise<string> {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('简历列表');

    // 设置表头样式
    worksheet.properties.defaultRowHeight = 20;
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFD700' },
    };
    worksheet.getRow(1).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    // 添加表头
    worksheet.columns = [
      { header: '姓名', key: 'name', width: 15 },
      { header: '电话', key: 'phone', width: 15 },
      { header: '邮箱', key: 'email', width: 25 },
      { header: '地点', key: 'location', width: 15 },
      { header: '期望职位', key: 'expectedPosition', width: 20 },
      { header: '期望薪资', key: 'expectedSalary', width: 15 },
      { header: '最近公司', key: 'latestCompany', width: 20 },
      { header: '最近职位', key: 'latestPosition', width: 20 },
      { header: '最高学历', key: 'highestDegree', width: 15 },
      { header: '毕业院校', key: 'school', width: 20 },
      { header: '专业技能', key: 'skills', width: 30 },
      { header: '工作年限', key: 'experience', width: 12 },
    ];

    // 添加数据
    resumes.forEach(resume => {
      const info = resume.basicInfo || {};
      const intention = resume.jobIntention || {};
      const workExp = resume.workExperience?.[0] || {};
      const edu = resume.education?.[0] || {};

      worksheet.addRow({
        name: info.name || 'N/A',
        phone: info.phone || 'N/A',
        email: info.email || 'N/A',
        location: info.location || 'N/A',
        expectedPosition: intention.expectedPosition || 'N/A',
        expectedSalary: intention.expectedSalary || 'N/A',
        latestCompany: workExp.company || 'N/A',
        latestPosition: workExp.position || 'N/A',
        highestDegree: edu.degree || 'N/A',
        school: edu.school || 'N/A',
        skills: resume.skills?.join(', ') || 'N/A',
        experience: this.calculateExperience(resume.workExperience),
      });
    });

    // 添加边框
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      }
    });

    // 保存文件
    const fileName = `resumes_${Date.now()}.xlsx`;
    const filePath = path.join('uploads', 'exports', userId, fileName);
    const fullPath = path.join(process.cwd(), filePath);

    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await workbook.xlsx.writeFile(fullPath);
    return filePath;
  }

  /**
   * 计算工作年限
   */
  private calculateExperience(workExperience?: any[]): string {
    if (!workExperience || workExperience.length === 0) return 'N/A';

    let totalMonths = 0;
    workExperience.forEach(exp => {
      if (exp.startDate && exp.endDate) {
        const start = new Date(exp.startDate);
        const end = exp.endDate.toLowerCase() === 'present' || exp.endDate === '至今'
          ? new Date()
          : new Date(exp.endDate);
        const months = (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth());
        totalMonths += Math.max(0, months);
      }
    });

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    return years > 0 ? `${years}年${months > 0 ? months + '个月' : ''}` : `${months}个月`;
  }
}
