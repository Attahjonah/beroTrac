const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// 1. Set up your PostgreSQL connection pool using your environment variable
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Instantiate the Prisma PostgreSQL adapter
const adapter = new PrismaPg(pool);

// 3. Pass the adapter directly into the client constructor
const prisma = new PrismaClient({ adapter });

module.exports = prisma;