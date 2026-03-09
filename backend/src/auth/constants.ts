export const jwtConstants = {
    secret: process.env.JWT_SECRET || 'SECRET_KEY_FOR_LOCAL_DEV',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'REFRESH_SECRET_KEY_FOR_LOCAL_DEV',
};
