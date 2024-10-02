import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string()
})

const result = envSchema.safeParse(process.env)

if (!result.success) {
  console.error(result.error.format())
  throw new Error('❌ Invalid environment variables.')
}

export const env = result.data
