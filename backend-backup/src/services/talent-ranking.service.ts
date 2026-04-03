/**
 * 🔱 Huntlink Elite Node Logic (V1.2)
 * 高端节点 (P8+/Verified) 10倍权重锁定版
 */
export class TalentRankingService {
  calculateRank(talent: any) {
    let multiplier = 1.0;
    
    // 职级权重：P8/P9 级及以上给予 10 倍权重
    if (talent.level >= 8 || talent.salary > 800000) multiplier *= 10.0;
    
    // 认证权重：大厂实名认证通过
    if (talent.is_verified && talent.is_big_tech) multiplier *= 2.0;
    
    // 关系权重：具象连接标签
    const baseScore = talent.active_score || 50;
    
    return (baseScore * multiplier).toFixed(1);
  }

  getMaskedTitle(talent: any) {
    // 即使掩码，也要突出高价值属性
    return talent.is_verified 
      ? `${talent.company} ${talent.title} · ${talent.nickname}`
      : "神秘职场精英";
  }
}
