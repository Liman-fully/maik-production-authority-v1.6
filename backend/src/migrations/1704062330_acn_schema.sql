-- ACN (Human Capital Network) 分账数据库Schema
-- 创建时间: 2026-04-02
-- 用途: 实现40/60分成 (平台40%, 贡献池60%)

-- 1. 简历贡献日志表
CREATE TABLE IF NOT EXISTS resume_contribution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL,
    downloader_id UUID NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    platform_amount DECIMAL(10, 2) NOT NULL,
    pool_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'disputed')),
    transaction_id VARCHAR(100),
    resume_title VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP
);

CREATE INDEX idx_contribution_resume ON resume_contribution_logs(resume_id);
CREATE INDEX idx_contribution_downloader ON resume_contribution_logs(downloader_id);
CREATE INDEX idx_contribution_status ON resume_contribution_logs(status);

-- 2. ACN角色贡献明细表
CREATE TABLE IF NOT EXISTS acn_role_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contribution_log_id UUID NOT NULL REFERENCES resume_contribution_logs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('sower', 'key_holder', 'maintainer', 'promoter', 'reviewer')),
    amount DECIMAL(10, 2) NOT NULL,
    weight INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'disputed')),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_role_contribution_log ON acn_role_contributions(contribution_log_id);
CREATE INDEX idx_role_user ON acn_role_contributions(user_id);
CREATE INDEX idx_role_status ON acn_role_contributions(status);

-- 3. ACN角色权重配置表
CREATE TABLE IF NOT EXISTS acn_role_weights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(20) UNIQUE NOT NULL CHECK (role IN ('sower', 'key_holder', 'maintainer', 'promoter', 'reviewer')),
    weight DECIMAL(5, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 4. 初始化默认权重配置 (总和60%)
INSERT INTO acn_role_weights (role, weight, is_active) VALUES
    ('sower', 15.00, true),
    ('key_holder', 30.00, true),
    ('maintainer', 10.00, true),
    ('promoter', 35.00, true),
    ('reviewer', 10.00, true)
ON CONFLICT (role) DO NOTHING;

-- 验证权重总和
SELECT '权重总和验证:' as info, 
       CASE WHEN SUM(weight) = 60 THEN '✅ 通过 (60%)' ELSE '❌ 失败' END as result
FROM acn_role_weights WHERE is_active = true;

-- 验证表创建
SELECT '表创建验证:' as info,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'resume_contribution_logs') as logs_count,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'acn_role_contributions') as roles_count,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'acn_role_weights') as weights_count;