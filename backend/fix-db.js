const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 15432,
  user: 'postgres',
  password: 'huntlink_safe_2026',
  database: 'huntlink'
});

async function addMissingColumn() {
  try {
    await client.connect();
    console.log('✅ 数据库连接成功');
    
    // 检查referrer_id列是否存在
    const check = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'referrer_id'
    `);
    
    if (check.rows.length === 0) {
      console.log('referrer_id列不存在，正在添加...');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN referrer_id UUID
      `);
      console.log('✅ referrer_id列添加成功');
    } else {
      console.log('✅ referrer_id列已存在');
    }
    
    // 显示表结构
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n=== users表结构 ===');
    columns.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
    });
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await client.end();
  }
}

addMissingColumn();
