declare module "bun" {
  interface Env {
    PORT: string;
    FRONTEND_URLS: string;
    DATABASE_URL: string;
  }
}
