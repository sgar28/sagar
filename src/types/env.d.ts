/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_RAZORPAY_KEY_ID: string;
  readonly VITE_RAZORPAY_KEY_SECRET: string;
  readonly VITE_EMAIL_USER: string;
  readonly VITE_EMAIL_PASSWORD: string;
  readonly VITE_SMS_ACCOUNT_SID: string;
  readonly VITE_SMS_AUTH_TOKEN: string;
  readonly VITE_SMS_FROM_NUMBER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 