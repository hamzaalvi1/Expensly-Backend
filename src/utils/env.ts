export const getEnv = (name: string) => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is not set`);
    }
    return value;

}
export const getAllEnv = () => {
    return {
        PORT: getEnv('PORT'),
        NODE_ENV: getEnv('NODE_ENV'),
        FRONTEND_URLS: parseFrontendUrls(getEnv('FRONTEND_URLS')),
        DATABASE_URL: getEnv('DATABASE_URL'),
        JWT_SECRET: getEnv('JWT_SECRET'),
    }
}

export const parseFrontendUrls = (frontendUrls: string) => {
    return frontendUrls.split(',').map(url => url.trim()).filter(Boolean);
}
