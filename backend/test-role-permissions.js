const { sign } = require('jsonwebtoken');
const axios = require('axios');

console.log('=== HR vs SEEKER 权限对比测试 ===\n');

async function testHRvsSeeker() {
  // 测试HR用户 (13800138001 - HR张三)
  console.log('--- 👔 HR用户测试 (13800138001) ---');
  const hrToken = sign(
    { userId: 'hr-user-id', phone: '13800138001', role: 'hr', tier: 'paid' },
    'huntlink_jwt_secret_2026_production',
    { expiresIn: '7d' }
  );
  
  const hrHeaders = { Authorization: `Bearer ${hrToken}` };
  
  try {
    // 1. 访问用户信息
    const hrUser = await axios.get('http://localhost:3000/api/user/me', { headers: hrHeaders });
    console.log('1. 用户信息 ✅');
    console.log('   - 姓名:', hrUser.data.name);
    console.log('   - 角色:', hrUser.data.role);
    console.log('   - 等级:', hrUser.data.tier);
    console.log('   - 积分:', hrUser.data.points?.total || 0);
    console.log('   - 会员:', hrUser.data.membership?.level || '无');
    
    // 2. HR发布职位
    console.log('\n2. 发布职位测试...');
    const jobData = {
      title: '高级前端工程师-' + Date.now(),
      description: '5年以上经验，熟悉React/Vue',
      requirements: '本科以上学历',
      salary: '20-35K',
      location: '深圳',
      experience: '5-10年',
      education: '本科',
      category: '技术'
    };
    
    try {
      const newJob = await axios.post('http://localhost:3000/api/jobs', jobData, { headers: hrHeaders });
      console.log('   ✅ 职位发布成功');
      console.log('   - 职位ID:', newJob.data.id);
      console.log('   - 职位名称:', newJob.data.title);
    } catch (e) {
      console.log('   ⚠️  职位发布:', e.response?.data?.message || e.message);
    }
    
    // 3. HR查看所有简历
    console.log('\n3. 查看简历库...');
    const resumes = await axios.get('http://localhost:3000/api/talents?page=1&pageSize=10', { headers: hrHeaders });
    console.log('   ✅ 成功查看', resumes.data.data?.length || 0, '份简历');
    
  } catch (error) {
    console.log('   ❌ 错误:', error.message);
  }
  
  console.log('\n--- 👤 SEEKER用户测试 (13800138003) ---');
  const seekerToken = sign(
    { userId: 'seeker-user-id', phone: '13800138003', role: 'seeker', tier: 'free' },
    'huntlink_jwt_secret_2026_production',
    { expiresIn: '7d' }
  );
  
  const seekerHeaders = { Authorization: `Bearer ${seekerToken}` };
  
  try {
    // 1. 访问用户信息
    const seekerUser = await axios.get('http://localhost:3000/api/user/me', { headers: seekerHeaders });
    console.log('1. 用户信息 ✅');
    console.log('   - 姓名:', seekerUser.data.name);
    console.log('   - 角色:', seekerUser.data.role);
    console.log('   - 等级:', seekerUser.data.tier);
    
    // 2. SEEKER尝试发布职位（应该被拒绝）
    console.log('\n2. 尝试发布职位...');
    try {
      const jobData = {
        title: '测试职位-' + Date.now(),
        description: '求职者不应该能发布'
      };
      const newJob = await axios.post('http://localhost:3000/api/jobs', jobData, { headers: seekerHeaders });
      console.log('   ❌ 不应该成功!');
    } catch (e) {
      console.log('   ✅ 正确拒绝访问');
      console.log('   - 状态码:', e.response?.status);
      console.log('   - 错误:', e.response?.data?.message);
    }
    
    // 3. SEEKER查看职位列表
    console.log('\n3. 查看职位列表...');
    const jobs = await axios.get('http://localhost:3000/api/jobs', { headers: seekerHeaders });
    console.log('   ✅ 可查看职位', jobs.data.data?.length || 0, '个');
    
    // 4. 免费用户限制
    if (seekerUser.data.tier === 'free') {
      console.log('\n4. 免费用户权益:');
      console.log('   ⚠️  限制: 只能查看简历基本信息');
      console.log('   ⚠️  限制: 每天最多联系5个候选人');
      console.log('   ⚠️  限制: 不能使用高级筛选');
    }
    
  } catch (error) {
    console.log('   ❌ 错误:', error.message);
  }
  
  console.log('\n=== 等级权益对比 ===\n');
  
  const tiers = [
    { name: 'FREE (免费)', limits: ['查看基本信息', '每天5次联系', '无优先推荐'] },
    { name: 'PAID (付费)', limits: ['查看完整简历', '无限联系', '智能推荐'] },
    { name: 'ENTERPRISE (企业)', limits: ['所有付费功能', '团队协作', '数据分析', '专属客服'] }
  ];
  
  tiers.forEach((tier, i) => {
    console.log(`${i + 1}. ${tier.name}:`);
    tier.limits.forEach(limit => console.log(`   - ${limit}`));
    console.log('');
  });
}

testHRvsSeeker().catch(console.error);
