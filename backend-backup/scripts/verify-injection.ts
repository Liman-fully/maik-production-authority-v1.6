/**
 * 数据注入验证脚本
 * 验证注入的数据是否完整和正确
 */

import { createConnection } from 'typeorm';
import { Resume } from '../src/modules/resume/resume.entity';
import { Talent } from '../src/modules/talent/talent.entity';
import { User } from '../src/modules/user/user.entity';

async function verifyData() {
  console.log('🔍 开始验证注入数据...\n');
  
  const connection = await createConnection({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 15432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'huntlink_safe_2026',
    database: process.env.DB_NAME || 'huntlink',
    entities: [Resume, Talent, User]
  });
  
  try {
    // 查找测试用户
    const testUser = await connection.getRepository(User).findOne({ 
      where: { phone: '10000000000' } 
    });
    
    if (!testUser) {
      console.log('❌ 测试用户不存在');
      return;
    }
    
    console.log(`✅ 测试用户: ${testUser.name} (ID: ${testUser.id})\n`);
    
    // 验证简历数据
    console.log('📊 简历数据验证:');
    const resumeCount = await connection.getRepository(Resume).count({ 
      where: { userId: testUser.id } 
    });
    console.log(`   总数: ${resumeCount} 条`);
    
    // 等级分布
    const tierStats = await connection.query(`
      SELECT tier, COUNT(*) as count, 
             ROUND(AVG(score), 2) as avg_score
      FROM resumes 
      WHERE user_id = $1 
      GROUP BY tier 
      ORDER BY tier
    `, [testUser.id]);
    
    console.log('\n   等级分布:');
    tierStats.forEach((stat: any) => {
      console.log(`   - ${stat.tier}级: ${stat.count}人 (平均分: ${stat.avg_score})`);
    });
    
    // 学历分布
    const eduStats = await connection.query(`
      SELECT education->0->>'degree' as degree, COUNT(*) as count
      FROM resumes 
      WHERE user_id = $1 
      GROUP BY education->0->>'degree'
      ORDER BY count DESC
    `, [testUser.id]);
    
    console.log('\n   学历分布:');
    eduStats.forEach((stat: any) => {
      console.log(`   - ${stat.degree}: ${stat.count}人`);
    });
    
    // 工作年限分布
    const expStats = await connection.query(`
      SELECT 
        CASE 
          WHEN work_experience::int <= 0 THEN '应届生'
          WHEN work_experience::int <= 3 THEN '1-3年'
          WHEN work_experience::int <= 5 THEN '3-5年'
          WHEN work_experience::int <= 10 THEN '5-10年'
          ELSE '10年以上'
        END as exp_range,
        COUNT(*) as count
      FROM (
        SELECT 
          jsonb_array_length(work_experience) as work_count,
          (EXTRACT(YEAR FROM NOW()) - (work_experience->0->>'startDate')::int) as work_experience
        FROM resumes 
        WHERE user_id = $1
      ) sub
      GROUP BY exp_range
      ORDER BY exp_range
    `, [testUser.id]);
    
    console.log('\n   工作年限分布:');
    expStats.forEach((stat: any) => {
      console.log(`   - ${stat.exp_range}: ${stat.count}人`);
    });
    
    // 验证人才数据
    console.log('\n\n📊 人才数据验证:');
    const talentCount = await connection.getRepository(Talent).count({ 
      where: { userId: testUser.id } 
    });
    console.log(`   总数: ${talentCount} 条`);
    
    // 验证关联关系
    console.log('\n\n🔗 关联关系验证:');
    const orphanResumes = await connection.query(`
      SELECT COUNT(*) as count
      FROM resumes r
      LEFT JOIN talents t ON r.talent_id = t.id
      WHERE r.user_id = $1 AND t.id IS NULL
    `, [testUser.id]);
    
    console.log(`   孤立简历（无关联人才）: ${orphanResumes[0].count} 条`);
    
    // 验证数据完整性
    console.log('\n\n✅ 数据完整性验证:');
    
    const missingFields = await connection.query(`
      SELECT COUNT(*) as count
      FROM resumes
      WHERE user_id = $1 AND (
        basic_info->>'name' IS NULL OR
        basic_info->>'phone' IS NULL OR
        basic_info->>'email' IS NULL OR
        score IS NULL OR
        tier IS NULL
      )
    `, [testUser.id]);
    
    console.log(`   缺少必填字段的简历: ${missingFields[0].count} 条`);
    
    // 验证手机号和邮箱唯一性
    const duplicatePhones = await connection.query(`
      SELECT COUNT(*) as count
      FROM (
        SELECT basic_info->>'phone' as phone
        FROM resumes
        WHERE user_id = $1
        GROUP BY basic_info->>'phone'
        HAVING COUNT(*) > 1
      ) dup
    `, [testUser.id]);
    
    const duplicateEmails = await connection.query(`
      SELECT COUNT(*) as count
      FROM (
        SELECT basic_info->>'email' as email
        FROM resumes
        WHERE user_id = $1
        GROUP BY basic_info->>'email'
        HAVING COUNT(*) > 1
      ) dup
    `, [testUser.id]);
    
    console.log(`   重复手机号: ${duplicatePhones[0].count} 个`);
    console.log(`   重复邮箱: ${duplicateEmails[0].count} 个`);
    
    // 验证技能分布
    console.log('\n\n📊 技能统计:');
    const skillStats = await connection.query(`
      SELECT 
        jsonb_array_elements_text(skills) as skill,
        COUNT(*) as count
      FROM resumes
      WHERE user_id = $1
      GROUP BY skill
      ORDER BY count DESC
      LIMIT 10
    `, [testUser.id]);
    
    console.log('   Top 10 技能:');
    skillStats.forEach((stat: any, index: number) => {
      console.log(`   ${index + 1}. ${stat.skill}: ${stat.count}人`);
    });
    
    // 验证城市分布
    console.log('\n\n📊 城市分布:');
    const cityStats = await connection.query(`
      SELECT basic_info->>'location' as city, COUNT(*) as count
      FROM resumes
      WHERE user_id = $1
      GROUP BY basic_info->>'location'
      ORDER BY count DESC
      LIMIT 10
    `, [testUser.id]);
    
    console.log('   Top 10 城市:');
    cityStats.forEach((stat: any, index: number) => {
      console.log(`   ${index + 1}. ${stat.city}: ${stat.count}人`);
    });
    
    // 总结
    console.log('\n\n📝 验证总结:');
    console.log(`✅ 简历总数: ${resumeCount} 条`);
    console.log(`✅ 人才总数: ${talentCount} 条`);
    console.log(`✅ 关联完整: ${orphanResumes[0].count === 0 ? '是' : '否'}`);
    console.log(`✅ 数据完整: ${missingFields[0].count === 0 ? '是' : '否'}`);
    console.log(`✅ 唯一性: ${duplicatePhones[0].count === 0 && duplicateEmails[0].count === 0 ? '是' : '否'}`);
    
    if (resumeCount >= 1000 && 
        talentCount >= 1000 && 
        orphanResumes[0].count === 0 && 
        missingFields[0].count === 0 &&
        duplicatePhones[0].count === 0 &&
        duplicateEmails[0].count === 0) {
      console.log('\n🎉 数据验证通过！所有检查项均正常。');
    } else {
      console.log('\n⚠️  数据验证存在问题，请检查上述报告。');
    }
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    console.error(error.stack);
  } finally {
    await connection.close();
  }
}

verifyData();
