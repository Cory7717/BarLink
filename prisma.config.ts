// Prisma 7 configuration
// See: https://pris.ly/d/config-datasource
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from '@prisma/config'

export default defineConfig({
  schema: './prisma/schema-fixed.prisma',
  datasource: {
    // Provider is read from the schema; URL comes from env
    url: process.env.DATABASE_URL,
  },
})
