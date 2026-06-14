import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    env: {
      DATABASE_URL: "postgresql://party_admin:party_password123@localhost:5433/gloo_db",
      NEXT_PUBLIC_SUPABASE_URL: "https://dummy.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "dummy-key"
    }
  },
})