export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  database: {
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'postgres',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    username: process.env.POSTGRES_USER || 'student',
    password: process.env.POSTGRES_PASSWORD || 'student',
    database: process.env.POSTGRES_DB || 'kupipodariday',
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: process.env.DB_SYNC === 'true' || true,
    retryAttempts: 5,
    retryDelay: 3000,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
});
