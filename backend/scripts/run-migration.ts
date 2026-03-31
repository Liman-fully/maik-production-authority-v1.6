import { createConnection } from 'typeorm';

async function runMigration() {
  console.log('Starting database migration...');

  const connection = await createConnection({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: 5432,
    username: process.env.DB_USERNAME || 'huntlink',
    password: process.env.DB_PASSWORD || 'HuntLink2026!dev',
    database: 'huntlink',
  });

  console.log('Database connection successful');

  // 创建职位分类表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS job_categories (
      id VARCHAR(36) PRIMARY KEY,
      code VARCHAR(10) NOT NULL UNIQUE,
      level INT NOT NULL,
      parent_code VARCHAR(10),
      name VARCHAR(100) NOT NULL,
      keywords TEXT,
      positions TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_level (level),
      INDEX idx_parent (parent_code),
      INDEX idx_code (code)
    )
  `);
  console.log('job_categories table created');

  // 扩展 talents 表
  const talentColumns = [
    { col: 'category_code', type: 'VARCHAR(10)', comment: '职位分类编码' },
    { col: 'industry_code', type: 'VARCHAR(10)', comment: '行业编码' },
    { col: 'job_level', type: 'VARCHAR(10)', comment: '职级（P5/P6/P7）' },
    { col: 'position_name', type: 'VARCHAR(100)', comment: '标准化职位名称' },
  ];

  for (const { col, type } of talentColumns) {
    try {
      await connection.query(`ALTER TABLE talents ADD COLUMN ${col} ${type}`);
      console.log(`Added ${col} column`);
    } catch (e) {
      console.log(`${col} column already exists`);
    }
  }

  // 创建索引
  const indexes = [
    { name: 'idx_category', col: 'category_code' },
    { name: 'idx_industry', col: 'industry_code' },
    { name: 'idx_job_level', col: 'job_level' },
  ];

  for (const { name, col } of indexes) {
    try {
      await connection.query(`CREATE INDEX IF NOT EXISTS ${name} ON talents (${col})`);
      console.log(`Created ${name} index`);
    } catch (e) {
      console.log(`${name} index already exists`);
    }
  }

  // 创建分类日志表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS classification_logs (
      id VARCHAR(36) PRIMARY KEY,
      input_text TEXT NOT NULL,
      result_category_code VARCHAR(10),
      result_category_name VARCHAR(100),
      result_industry_code VARCHAR(10),
      result_industry_name VARCHAR(100),
      confidence DECIMAL(3,2),
      match_type VARCHAR(20),
      matched_keywords TEXT,
      is_manual_override BOOLEAN DEFAULT FALSE,
      manual_result_category_code VARCHAR(10),
      error_type VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('classification_logs table created');

  console.log('Database migration complete');
  await connection.close();
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
