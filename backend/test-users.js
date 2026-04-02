const { Client } = require('pg');
const crypto = require('crypto');

console.log('=== 创建测试用户数据 ===');

const client = new Client({
  host: 'localhost',
  port: 15432,
  user: 'postgres',
  password: 'huntlink_safe_2026',
  database: 'huntlink'
});

async function createTestUsers() {
  try {
    await client.connect();
    console.log('✅ 数据库连接成功');
    
    // 生成6位验证码（测试用）
    const generateCode = () => crypto.randomInt(100000, 999999).toString();
    
    // 测试用户数据
    const testUsers = [
      {
        phone: '13800138001',
        name: 'HR张三',
        idCard: '110101199001011234',
        role: 'hr',
        tier: 'paid',
        company: '腾讯科技'
      },
      {
        phone: '13800138002',
        name: 'HR李四',
        idCard: '110101199002022345',
        role: 'hr',
        tier: 'enterprise',
        company: '阿里巴巴'
      },
      {
        phone: '13800138003',
        name: '求职者王五',
        idCard: '110101199503033456',
        role: 'seeker',
        tier: 'free',
        company: null
      },
      {
        phone: '13800138004',
        name: '求职者赵六',
        idCard: '110101199604044567',
        role: 'seeker',
        tier: 'paid',
        company: '百度'
      },
      {
        phone: '13800138005',
        name: '测试管理员',
        idCard: '110101199505055678',
        role: 'hr',
        tier: 'enterprise',
        company: '猎脉平台'
      }
    ];
    
    console.log('开始插入测试用户...');
    
    for (const user of testUsers) {
      try {
        // 检查用户是否已存在
        const existing = await client.query(
          'SELECT id FROM users WHERE phone = $1',
          [user.phone]
        );
        
        if (existing.rows.length > 0) {
          console.log(`ℹ️  用户已存在: ${user.phone} (${user.name})`);
          continue;
        }
        
        // 插入新用户
        const result = await client.query(`
          INSERT INTO users (phone, name, id_card, role, tier, company, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, true)
          RETURNING id, phone, name, role, tier
        `, [
          user.phone,
          user.name,
          user.idCard,
          user.role,
          user.tier,
          user.company
        ]);
        
        console.log(`✅ 创建用户: ${result.rows[0].phone} | ${result.rows[0].name} | ${result.rows[0].role} | ${result.rows[0].tier}`);
        
        // 插入验证码记录（模拟）
        const code = generateCode();
        await client.query(`
          INSERT INTO sms_codes (phone, code, type, created_at, expires_at, used)
          VALUES ($1, $2, 'login', NOW(), NOW() + INTERVAL '10 minutes', false)
        `, [user.phone, code]);
        
        console.log(`   验证码: ${code} (10分钟有效)`);
        
      } catch (err) {
        console.error(`❌ 创建用户失败 ${user.phone}:`, err.message);
      }
    }
    
    // 查询所有用户
    console.log('\n=== 当前用户列表 ===');
    const allUsers = await client.query(`
      SELECT phone, name, role, tier, company, is_active,
             TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
      FROM users
      ORDER BY created_at DESC
    `);
    
    allUsers.rows.forEach((user, index) => {
      console.log(`${index + 1}. [${user.role.toUpperCase()}] ${user.name} | ${user.phone} | ${user.tier} | ${user.company || '无公司'} | ${user.is_active ? '活跃' : '禁用'}`);
    });
    
    console.log(`\n✅ 共 ${allUsers.rows.length} 个用户`);
    
  } catch (error) {
    console.error('❌ 数据库错误:', error.message);
  } finally {
    await client.end();
  }
}

createTestUsers();
