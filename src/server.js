import dotenv from 'dotenv';
import connectDB from './db/connection';
dotenv.config({ path: './.env' });
import app from './app.js';

connectDB()
    .app.listen(process.env.PORT || 3000, () => {
       console.log(`Server is running on port ${process.env.PORT}`); 
    })
    .catch((error) => {
       console.log('MONGOODB connection is failed !',error);
   })
