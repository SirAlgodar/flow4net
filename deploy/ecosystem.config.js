module.exports = {
  apps: [
    {
      name: 'flow4network',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1, // Alterado para 1 para evitar conflito de porta (EADDRINUSE) com o Next.js
      exec_mode: 'fork', // Modo fork é mais estável para Next.js standalone nesta configuração
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3100 // Porta padrão 3100, ajustável via .env
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
