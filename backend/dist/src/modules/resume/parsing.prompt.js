"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESUME_PARSING_PROMPT = void 0;
exports.RESUME_PARSING_PROMPT = `
你是一个专业的简历解析助手。请根据提供的简历文本内容，提取出结构化的信息并以 JSON 格式返回。

要求：
1. 语言一致性：如果简历是中文，请用中文填充内容；如果是英文，请用英文。
2. 字段映射：
   - basicInfo: { name, gender, age, phone, email, location, currentCompany, currentTitle, experienceYears, educationLevel, summary }
   - education: Array<{ school, major, degree, startDate, endDate, description }>
   - workExperience: Array<{ company, title, startDate, endDate, description, achievements }>
   - projects: Array<{ name, role, startDate, endDate, description, technologyStack }>
   - skills: Array<string>
   - certifications: Array<string>
   - jobIntention: { expectedPosition, expectedSalary, expectedLocation, status }

3. 准确性：不要伪造信息，如果某个字段在简历中没提到，请设为 null 或空。
4. 格式：只返回 JSON，不要有任何 Markdown 包裹或其他解释文字。

简历文本内容如下：
{{resumeText}}
`;
//# sourceMappingURL=parsing.prompt.js.map