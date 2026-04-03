-- 积分初始化触发器
-- 执行时间: 2026-04-01
-- 目的: 新用户注册时自动初始化积分为100分

-- 创建触发器函数
CREATE OR REPLACE FUNCTION initialize_user_points()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO points (id, user_id, points, total_earned, reason, related_type, related_id, created_at)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    100,
    100,
    '新用户注册赠送',
    'register',
    NEW.id,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 删除已存在的触发器（如果有）
DROP TRIGGER IF EXISTS user_points_init_trigger ON users;

-- 创建触发器
CREATE TRIGGER user_points_init_trigger
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION initialize_user_points();

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_points_user_id ON points(user_id);
CREATE INDEX IF NOT EXISTS idx_points_created_at ON points(created_at);

-- 验证触发器是否创建成功
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'user_points_init_trigger'
  ) THEN
    RAISE EXCEPTION '触发器创建失败';
  END IF;
  RAISE NOTICE '积分初始化触发器创建成功';
END $$;
