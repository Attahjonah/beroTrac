import "dotenv/config";

import { defineConfig } from "@prisma/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:password@postgres:5432/berotrac";

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

export default defineConfig({
  datasource: {
    adapter,
    url: connectionString,
  },
});