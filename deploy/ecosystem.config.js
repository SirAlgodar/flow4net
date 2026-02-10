module.exports = {
  apps: [
    {
      name: 'flow4network',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max', // Utiliza todos os núcleos da CPU
      exec_mode: 'cluster', // Modo cluster para performance
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
