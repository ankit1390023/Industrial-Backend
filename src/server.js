import dotenv from 'dotenv';
import connectDB from './db/connection.js';
dotenv.config({ path: './.env' });
import { app } from './app.js';

connectDB()
   .then(() => {
      app.listen(process.env.PORT || 3000, () => {
         console.log(`Server is running on the PORT : ${process.env.PORT}`);
      })
      console.log('Connected to MongoDB');
   })
   .catch((error) => {
      console.error('Error connecting to MongoDB:', error);
   })