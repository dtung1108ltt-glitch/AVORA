/// <reference types="vite/client" />

interface ImportMetaEnv {
<<<<<<< HEAD
readonly VITE_API_URL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
=======
  readonly VITE_API_URL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
>>>>>>> 45c78db24843bc6566defa000846d447db931d77
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
