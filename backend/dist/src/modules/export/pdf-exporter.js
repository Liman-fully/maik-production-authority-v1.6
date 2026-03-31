"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfExporter = void 0;
const common_1 = require("@nestjs/common");
const path = require("path");
const fs = require("fs");
let PdfExporter = class PdfExporter {
    async export(resumes, userId) {
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 50 });
        const fileName = `resumes_${Date.now()}.pdf`;
        const filePath = path.join('uploads', 'exports', userId, fileName);
        const fullPath = path.join(process.cwd(), filePath);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const stream = fs.createWriteStream(fullPath);
        doc.pipe(stream);
        resumes.forEach((resume, index) => {
            if (index > 0)
                doc.addPage();
            doc.fontSize(24).font('Helvetica-Bold').text(resume.basicInfo?.name || '未命名简历', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica');
            const info = resume.basicInfo;
            if (info) {
                const infoLines = [];
                if (info.phone)
                    infoLines.push(`电话：${info.phone}`);
                if (info.email)
                    infoLines.push(`邮箱：${info.email}`);
                if (info.location)
                    infoLines.push(`地点：${info.location}`);
                if (info.gender)
                    infoLines.push(`性别：${info.gender}`);
                if (info.age)
                    infoLines.push(`年龄：${info.age}`);
                if (infoLines.length > 0) {
                    doc.text(infoLines.join(' | '), { align: 'center' });
                }
            }
            doc.moveDown(1);
            if (resume.jobIntention) {
                doc.fontSize(16).font('Helvetica-Bold').text('求职意向', { underline: true });
                doc.moveDown(0.3);
                doc.fontSize(11).font('Helvetica');
                const intention = resume.jobIntention;
                if (intention.expectedPosition)
                    doc.text(`期望职位：${intention.expectedPosition}`);
                if (intention.expectedSalary)
                    doc.text(`期望薪资：${intention.expectedSalary}`);
                if (intention.expectedLocation)
                    doc.text(`期望地点：${intention.expectedLocation}`);
                doc.moveDown(0.5);
            }
            if (resume.workExperience && resume.workExperience.length > 0) {
                doc.fontSize(16).font('Helvetica-Bold').text('工作经历', { underline: true });
                doc.moveDown(0.3);
                doc.fontSize(11).font('Helvetica');
                resume.workExperience.forEach((exp) => {
                    doc.fontSize(12).font('Helvetica-Bold').text(`${exp.position} | ${exp.company}`);
                    doc.fontSize(10).font('Helvetica').text(`${exp.startDate} - ${exp.endDate}`);
                    if (exp.description) {
                        doc.text(exp.description, { indent: 20 });
                    }
                    doc.moveDown(0.5);
                });
            }
            if (resume.education && resume.education.length > 0) {
                doc.fontSize(16).font('Helvetica-Bold').text('教育经历', { underline: true });
                doc.moveDown(0.3);
                doc.fontSize(11).font('Helvetica');
                resume.education.forEach((edu) => {
                    doc.fontSize(12).font('Helvetica-Bold').text(`${edu.school} - ${edu.major} (${edu.degree})`);
                    doc.fontSize(10).font('Helvetica').text(`${edu.startDate} - ${edu.endDate}`);
                    doc.moveDown(0.3);
                });
            }
            if (resume.skills && resume.skills.length > 0) {
                doc.fontSize(16).font('Helvetica-Bold').text('专业技能', { underline: true });
                doc.moveDown(0.3);
                doc.fontSize(11).font('Helvetica');
                doc.text(resume.skills.join(', '));
            }
            if (resume.projects && resume.projects.length > 0) {
                doc.addPage();
                doc.fontSize(16).font('Helvetica-Bold').text('项目经验', { underline: true });
                doc.moveDown(0.3);
                doc.fontSize(11).font('Helvetica');
                resume.projects.forEach((proj, idx) => {
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
        await new Promise((resolve, reject) => {
            stream.on('finish', () => resolve());
            stream.on('error', reject);
        });
        return filePath;
    }
};
exports.PdfExporter = PdfExporter;
exports.PdfExporter = PdfExporter = __decorate([
    (0, common_1.Injectable)()
], PdfExporter);
//# sourceMappingURL=pdf-exporter.js.map