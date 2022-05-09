export default () => ({
  app: {
    port: parseInt(process.env.PORT, 10) || '5000',
    mail: {
      user: process.env.MAIL_USER,
      password: process.env.MAIL_PASSWORD,
    },
    baseUrl: process.env.BASE_URL || 'http://localhost:5000', // Match default port
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  },
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || 'not_so_secret',
      alg: 'HS512',
      expiration: 1, // 1 hour
    },
    salt_rounds: 10,
    email_verification_expiration: 24 * 60 * 60, // 24 hours
    refresh_token_expiration: 30 * 24 * 60 * 60, // 1 month
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  db: {
    uri: process.env.DB_URI || 'mongodb://localhost:27017/lorion',
  },
  queue: {
    email: 'email',
  },
});
