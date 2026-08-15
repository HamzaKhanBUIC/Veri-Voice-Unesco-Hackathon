const { z } = require('zod');
const dotenv = require('dotenv');

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.string().default('info'),

  // Speech & LLM API Keys
  GROQ_API_KEY: z.string().default(''),
  OPENAI_API_KEY: z.string().default(''),
  SPEECHMATICS_API_KEY: z.string().default(''),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Environment validation error:', result.error.format());
    throw new Error('Invalid environment variables');
  }
  return result.data;
};

module.exports = {
  env: parseEnv(),
  envSchema,
};
