// Prisma 7 configuration
// See: https://pris.ly/d/config-datasource
import { defineConfig } from '@prisma/config'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

export default defineConfig({
  schema: './prisma/schema-fixed.prisma',
  datasource: {
    // Provider is read from the schema; URL comes from env
    url: process.env.DATABASE_URL,
  },
})
