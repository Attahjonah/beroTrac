import "dotenv/config";

import { defineConfig } from "@prisma/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined.");
}

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