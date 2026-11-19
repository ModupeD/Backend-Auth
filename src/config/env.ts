import 'dotenv/config';

function requireEnv(envValue: string) : string {
    const value = process.env[envValue];

    if (!value) {
        throw new Error(`${envValue} is reqired`)
    }
    return value;
}

function parsePort(value: string | undefined): number {
    const port = Number(value ?? 4000);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('PORT must be an integert between 1 and 65535');
    }
    return port;
}

export const env = {
    port: parsePort(process.env.PORT),
    webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
    db: {
        host: process.env.DB_HOST!,
        port: Number(process.env.DB_PORT)!,
        user: requireEnv('DB_USER'),
        password: requireEnv('DB_PASSWORD'),
        database: requireEnv('DB_DATABASE') 
    }
};