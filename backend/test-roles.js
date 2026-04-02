const { sign } = require('jsonwebtoken');
const { Client } = require('pg');
const axios = require('axios');

console.log('=== 角色权限测试 ===\n');

const client = new Client({
  host: 'localhost',
  port: 15432,
  user: 'postgres',
  password: 'huntlink_safe_2026',
  database: 'huntlink'
});

async function testRolePermissions() {
  try {
    await client.connect();
    
    // 获取测试用户
    const users = await client.query("\n      SELECT id, phone, name, role, tier, company FROM users \n      ORDER BY role, tier\n    ");
    
    console.log('测试用户:');
    users.rows.forEach(u => {
      console.log("  - [" + u.role.toUpperCase() + "] " + u.name + " (" + u.tier + ")");
    });
    
    console.log('\n=== 测试角色权限差异 ===\n');
    
    for (const user of users.rows) {
      console.log(`--- 测试用户: ${user.name} [${user.role.toUpperCase()} | ${user.tier}] ---`);
      
      // 生成JWT token（绕过短信验证）
      const token = sign(
        { 
          userId: user.id, 
          phone: user.phone, 
          role: user.role,
          tier: user.tier 
        },
        'huntlink_jwt_secret_2026_production',
        { expiresIn: '7d' }
      );
      
      const headers = { Authorization: `Bearer ${token}` };
      
      try {
        // 1. 测试访问talents列表
        console.log('1. 访问人才列表 /api/talents...');
        const talents = await axios.get('http://localhost:3000/api/talents', { headers });
        console.log('   ✅ 成功，数量:', talents.data.data?.length || talents.data.length || 0);
        
        // 2. 测试访问jobs列表
        console.log('2. 访问职位列表 /api/jobs...');
        const jobs = await axios.get('http://localhost:3000/api/jobs', { headers });
        console.log('   ✅ 成功，数量:', jobs.data.data?.length || jobs.data.length || 0);
        
        // 3. 测试访问用户自身信息
        console.log('3. 访问用户信息 /api/users/me...');
        const userInfo = await axios.get('http://localhost:3000/api/users/me', { headers });
        console.log('   ✅ 成功，角色:', userInfo.data.role, '等级:', userInfo.data.tier);
        
        // 4. 角色特定测试
        if (user.role === 'hr') {
          // HR可以发布职位
          console.log('4. HR测试: 发布职位...');
          try {
            const newJob = await axios.post('http://localhost:3000/api/jobs', {
              title: '测试职位-' + Date.now(),
              description: '这是一个测试职位',
              status: 'published'
            }, { headers });
            console.log('   ✅ 职位发布成功');
          } catch (e) {
            console.log('   ⚠️  职位发布:', e.response?.data?.message || e.message);
          }
        } else {
          // 求职者不能发布职位
          console.log('4. 求职者测试: 尝试发布职位...');
          try {
            const newJob = await axios.post('http://localhost:3000/api/jobs', {
              title: '测试职位-' + Date.now(),
              description: '求职者尝试发布'
            }, { headers });
            console.log('   ❌ 不应该成功!');
          } catch (e) {
            console.log('   ✅ 正确拒绝:', e.response?.status, e.response?.data?.message);
          }
        }
        
        // 5. 测试等级权益差异
        console.log('5. 测试等级权益:');
        if (user.tier === 'free') {
          console.log('   - 免费用户：限制查看完整简历');
        } else if (user.tier === 'paid') {
          console.log('   - 付费用户：可查看完整简历');
        } else if (user.tier === 'enterprise') {
          console.log('   - 企业用户：无限查看+优先推荐');
        }
        
        console.log('');
        
      } catch (error) {
        console.log('   ❌ 测试错误:', error.message);
        console.log('');
      }
    }
    
  } catch (error) {
    console.error('❌ 数据库错误:', error.message);
  } finally {
    await client.end();
  }
}

testRolePermissions();
