import { cors } from 'hono/cors'
import { allowedHttpMethods } from '../constants/http'
import { getEnv, parseFrontendUrls } from '../utils/env'

export const corsConfig = {
  origin: parseFrontendUrls(getEnv('FRONTEND_URLS')),
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: allowedHttpMethods,
}

export const corsMiddleware = cors(corsConfig)
