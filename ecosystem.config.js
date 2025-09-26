module.exports = {
  apps: [{
    name: "pm.acme.cn",
    script: "npm",
    args: "start",
    cwd: "./",
    instances: 1,
    exec_mode: "fork",

    env: {
      NODE_ENV: "production",
      PORT: 3080,
    },

    error_file: "./logs/error.log",
    out_file: "./logs/out.log",
    log_file: "./logs/combined.log",
    time: true,
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",

    // Memory and performance
    max_memory_restart: "1G",
    node_args: "--max_old_space_size=1024",

    // Monitoring and restart
    watch: false,
    ignore_watch: [
      "node_modules",
      "logs",
      ".git",
      "uploads",
      ".next",
      "logs/*",
    ],
    max_restarts: 10,
    min_uptime: "10s",
    kill_timeout: 5000,
    autorestart: true,
    restart_delay: 4000,

    // Health monitoring
    health_check_http: {
      path: "/api/health",
      port: 3080,
      timeout: 5000,
      interval: 30000,
      max_failures: 3,
    },

    // Environment specific settings
    env_file: ".env",
    merge_logs: true,

    // Advanced PM2 features
    instance_var: "INSTANCE_ID",
    combine_logs: true,

    // Graceful shutdown
    listen_timeout: 10000,
    shutdown_with_message: true,

    // Source map support for better error tracking
    source_map_support: true,

    // Custom environment variables for different deployments
    env_development: {
      NODE_ENV: "development",
      PORT: 3000,
      DEBUG: "true",
    },
  }],
};
