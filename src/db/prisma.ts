import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client.js';
import { env } from '../config/env.js';

 const adapter = new PrismaMariaDb({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    connectionLimit: 10,
});

export const prisma = new PrismaClient({adapter});
