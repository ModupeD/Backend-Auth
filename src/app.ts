import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import bcrypt from 'bcrypt';
import { getPool } from './db/pool.js'
import type { RowDataPacket } from 'mysql2';

export const app = express();

function isNonBlankString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}
app.use(helmet());
app.use(cors({ origin: env.webOrigin }))
app.use(express.json({ limit: '10kb'}));

app.get('/', (_req, res) => {
    res.status(200).json({ status: 'ok' });
})

app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'user-registration-api' });
})

app.post('/api/auth/register',async (req, res) => {
    const { name, email, password } = req.body ?? {};

    if (
        !isNonBlankString(name) ||
        !isNonBlankString(email) || 
        !isNonBlankString(password)) {
        res.status(400).json({ message: 'Email and password are required'});
        return;
    }
   
        
        try {
             const hashedPassword = await bcrypt.hash(password, 10);
            await getPool(). execute(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [
                    name.trim(),
                    email.trim().toLowerCase(),
                    hashedPassword
                ]
             );

            res.status(201).json({
                message: 'User registered successfully'
            });
        } catch (error){
            if (
                error instanceof Error && 
                'code' in error &&
                error.code === 'ER_DUP_ENTRY'
            ){
                res.status(409).json({
                    message: 'Email already registered'
                })
                return;
            }

            console.error('Registration failed:', error);

            res.status(500).json({
                message: 'Error registering user'
            });
        }
      
});

app.post('/api/auth/login',async (req, res) => {
    const { email, password } = req.body ?? {};

    if (
        !isNonBlankString(email) || 
        !isNonBlankString(password)) {
        res.status(400).json({ message: 'Email and password are required'});
        return;
    }
   
        
        try {
           const [rows] = await getPool().execute<RowDataPacket[]>(
            'SELECT password FROM users WHERE email = ?',
            [email.trim().toLowerCase()],
           );

           const user = rows[0];
           const passwordMatches = user
           ? await bcrypt.compare(password, user.password)
           : false;

           if (!passwordMatches) {
            res.status(401).json({ message: 'Invalid email or password.'});
            return;
           }

           res.status(200).json({ message: 'Password verified.'});

        } catch (error){
            console.error('Login failed:', error);

            res.status(500).json({message: 'Unable not found'});
        }
      
});
