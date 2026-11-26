import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import bcrypt from 'bcrypt';
import { prisma } from './db/prisma.js';

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
    const { name, email, password, role:role } = req.body ?? {};

    if (
        !isNonBlankString(name) ||
        !isNonBlankString(email) || 
        !isNonBlankString(password)||
        !role) {
        res.status(400).json({ message: 'Email, password and role are required'});
        return;
    }
   
        
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.users.create({ data:{
                  name: name.trim(),
                  email: email.trim().toLowerCase(),
                  password: hashedPassword,
                  role: role }});

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
    const {  email, password, role } = req.body ?? {};

    if (
        !isNonBlankString(email) || 
        !isNonBlankString(password)||
        !role) {
        res.status(400).json({ message: 'Email, password and role are required'});
        return;
    }
   
        
        try {
           const user = await prisma.users.findUnique({ where:{email: email.trim().toLowerCase()}});

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


app.get('/api/users', async (_req, res) =>{
    const users = await prisma.users.findMany({omit: {password: true}})
    res.status(200).json({ users});
})


app.get('/api/users/:email', async (req, res) =>{
    const { email } = req.params;
    const user = await prisma.users.findUnique({where:{email: email}, omit: {password: true}})
    res.status(200).json({ user });
})

app.delete('/api/users/:email', async (req, res) =>{
    const { email } = req.params;
    const user = await prisma.users.delete({where:{email: email}, omit: {password: true}})
    res.status(200).json({ user, message:"user deleted" });
})

app.patch('/api/users/:email', async (req, res) =>{
    const { email } = req.params;
    const { password, role } = req.body;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
// need to add hashed password
    const user = await prisma.users.update({where:{email: email.trim().toLowerCase()}, data:{password:password, role:role}})
    
    res.status(200).json({ message:"user updated" });
})