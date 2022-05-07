export default () => ({
  app: {
    port: parseInt(process.env.PORT, 10) || '5000',
    mail: {
      user: process.env.MAIL_USER,
      password: process.env.MAIL_PASSWORD,
    },
    baseUrl: process.env.BASE_URL || 'http://localhost:5000', // Match default port
  },
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || 'not_so_secret',
    },
    salt_rounds: 10,
    email_verification_expiration: 24 * 60 * 60, // 24 hours
  },
});
