import dotenv from 'dotenv';
import app from './app';
import prisma from './config/prisma';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("✅ Database Connected");

    const count = await prisma.user.count();
    console.log("Users:", count);
  } catch (error: any) {
    console.warn('⚠️ Database connection failed, continuing without a live connection:', error.message);
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
}
startServer();
