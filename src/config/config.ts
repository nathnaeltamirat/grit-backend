import { configDotenv } from "dotenv";
import z from "zod";

configDotenv();

const envSchema = z.object({
    NODE_ENV: z.string(),
    PORT: z.string(),
    DATABASE_URL:z.string(),
    JWT_SECRET:z.string()

})

const envConfig = envSchema.parse(process.env);
export default envConfig;