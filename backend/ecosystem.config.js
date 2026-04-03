/**
 * PM2 生产环境配置 - 猎脉 HuntLink
 *
 * 使用方式：
 *   开发环境：pm2 start ecosystem.config.js
 *   生产环境：pm2 start ecosystem.config.js --env production
 *
 * 注意事项：
 *   - 2G 内存严禁开启 cluster 模式，只能跑 1 个实例
 *   - 生产环境严禁开启 watch，极其耗内存
 *   - max_memory_restart 限制为 1500M，防止撑爆系统
 */

module.exports = {
  apps: [
    {
      name: 'huntlink-backend',
      script: './dist/src/main.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1500M',
      env_production: {
        NODE_ENV: 'production',
        // 限制 V8 引擎内部内存，给系统留出 512MB 呼吸空间
        NODE_OPTIONS: '--max-old-space-size=1536',
      },
      env_development: {
        NODE_ENV: 'development',
        NODE_OPTIONS: '--max-old-space-size=1024',
      },
      // 优雅停机：给业务 30 秒处理完当前 SQL 事务再关闭
      kill_timeout: 30000,
      // 崩溃后延迟重启，防止 CPU 尖峰锁死服务器
      exp_backoff_restart_delay: 100,
      // 日志配置（50G 硬盘经不起无限日志）
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
      max_restarts: 10,
      restart_delay: 5000,
      autorestart: true,
    },
  ],
};
