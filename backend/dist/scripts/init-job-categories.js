"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const typeorm_1 = require("typeorm");
async function initJobCategories() {
    console.log('Starting job categories initialization...');
    const connection = await (0, typeorm_1.createConnection)({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: 5432,
        username: process.env.DB_USERNAME || 'huntlink',
        password: process.env.DB_PASSWORD || 'HuntLink2026!dev',
        database: 'huntlink',
    });
    console.log('Database connection successful');
    const rulesPath = path.join(__dirname, '../../resume-classification-rules/rules/classification_rules.json');
    if (!fs.existsSync(rulesPath)) {
        console.error('Rules file not found:', rulesPath);
        await connection.close();
        return;
    }
    const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));
    console.log('Rules file loaded');
    console.log('Inserting industry data...');
    for (const industry of rules.industries.data) {
        await connection.query(`
      INSERT INTO job_categories (id, code, level, name, keywords, is_active)
      VALUES (gen_random_uuid(), $1, 1, $2, $3, TRUE)
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, keywords = EXCLUDED.keywords
    `, [industry.code, industry.name, JSON.stringify(industry.keywords)]);
    }
    console.log(`Industry data inserted (${rules.industries.data.length} rows)`);
    console.log('Inserting function data...');
    for (const func of rules.functions.data) {
        await connection.query(`
      INSERT INTO job_categories (id, code, level, name, keywords, positions, is_active)
      VALUES (gen_random_uuid(), $1, 2, $2, $3, $4, TRUE)
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, keywords = EXCLUDED.keywords, positions = EXCLUDED.positions
    `, [func.code, func.name, JSON.stringify(func.keywords), JSON.stringify(func.positions || [])]);
    }
    console.log(`Function data inserted (${rules.functions.data.length} rows)`);
    const industryCount = await connection.query('SELECT COUNT(*) as count FROM job_categories WHERE level = 1');
    const functionCount = await connection.query('SELECT COUNT(*) as count FROM job_categories WHERE level = 2');
    console.log('Statistics:');
    console.log(`   - Industries: ${industryCount[0].count}`);
    console.log(`   - Functions: ${functionCount[0].count}`);
    console.log('Job categories initialization complete');
    await connection.close();
}
initJobCategories().catch(err => {
    console.error('Initialization failed:', err);
    process.exit(1);
});
//# sourceMappingURL=init-job-categories.js.map