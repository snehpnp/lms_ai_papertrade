module.exports = {
  apps: [
    {
      name: 'tradelearn-api',
      script: 'dist/index.js',
      instances: 'max', // Use all CPU cores for API
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      max_memory_restart: '1G'
    },
    {
      name: 'tradelearn-risk-engine',
      script: 'dist/worker.js',
      instances: 1, // Risk engine should be single instance to avoid duplicate triggers
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      max_memory_restart: '500M'
    }
  ]
};
