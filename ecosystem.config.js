module.exports = {
  apps: [
    {
      name: 'flow4network',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
