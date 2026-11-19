import mysql, { type Pool } from 'mysql2/promise';
import { env } from '../config/env.js';

let pool: Pool | undefined;

export function getPool(): Pool {
    if (!env.db.database) {
        throw new Error('Database is reqired for database operations');
    }

    if (!pool) {
        pool = mysql.createPool({
            host: env.db.host,
            port: env.db.port,
            user: env.db.user,
            password: env.db.password,
            database: env.db.database,
            waitForConnections: true,
            connectionLimit: 10,
        })
    }

    return pool;
}