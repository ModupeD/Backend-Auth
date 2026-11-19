import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';

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

app.post('/api/auth/register', (req, res) => {
    const { email, password } = req.body ?? {};

    if (!isNonBlankString(email) || !isNonBlankString(password)) {
        res.status(400).json({ message: 'Email and password are required'});
        return;
    }
    return res.status(200).json({ status: 'success', service: 'user-registration-api' });
})
