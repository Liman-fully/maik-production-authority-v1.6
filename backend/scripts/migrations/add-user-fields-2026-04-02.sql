-- 2026-04-02: 扩展用户表字段，支持账号密码认证和用户引导
-- 此脚本需要在应用启动前执行

-- 1. 添加新字段
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS hash_password VARCHAR(255),
ADD COLUMN IF NOT EXISTS salt VARCHAR(32),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location VARCHAR(100),
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45),
ADD COLUMN IF NOT EXISTS is_onboarding_completed BOOLEAN DEFAULT FALSE;

-- 2. 为常用查询字段创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at DESC);

-- 3. 为新用户初始化积分触发器（如果不存在）
-- 注意：这个触发器应该已经存在，但我们检查一下
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'init_user_points'
    ) THEN
        EXECUTE '
            CREATE OR REPLACE FUNCTION init_user_points()
            RETURNS TRIGGER AS $$
            BEGIN
                INSERT INTO user_points (user_id, points, updated_at)
                VALUES (NEW.id, 100, NOW());
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER init_user_points
            AFTER INSERT ON users
            FOR EACH ROW
            EXECUTE FUNCTION init_user_points();
        ';
    END IF;
END $$;

-- 4. 更新现有用户的引导状态（默认为已完成，因为他们已经注册过）
UPDATE users SET is_onboarding_completed = TRUE WHERE is_onboarding_completed IS NULL;

COMMENT ON COLUMN users.email IS '用户邮箱，用于账号密码登录';
COMMENT ON COLUMN users.hash_password IS '密码哈希';
COMMENT ON COLUMN users.salt IS '密码盐值';
COMMENT ON COLUMN users.bio IS '个人简介';
COMMENT ON COLUMN users.location IS '所在地';
COMMENT ON COLUMN users.birthday IS '生日';
COMMENT ON COLUMN users.gender IS '性别';
COMMENT ON COLUMN users.last_login_at IS '最后登录时间';
COMMENT ON COLUMN users.last_login_ip IS '最后登录IP';
COMMENT ON COLUMN users.is_onboarding_completed IS '是否完成用户引导流程';

-- 输出迁移结果
SELECT '用户表字段扩展完成' AS migration_status;