import express from 'express';
const app = express();
import cookieParser from 'cookie-parser';
import cors from 'cors'
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, linit: "16kb" }));
app.use(cookieParser());
app.use(express.static('public'));

//routes import 
import userRouter from './routes/user.routes.js';
//routes declaration
app.use('/api/v1/users', userRouter); //  http://localhost:3000:/api/v1/users/register
export { app };

