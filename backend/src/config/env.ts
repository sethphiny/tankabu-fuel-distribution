export const envConfig = () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL,
  },
  api: {
    key: process.env.BACKEND_API_KEY || '',
  },
});
