import { cors } from 'hono/cors'
import { allowedHttpMethods } from '../constants/http'
import { getAllEnv } from '../utils/env'

export const corsConfig = {
  origin: getAllEnv().FRONTEND_URLS,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: allowedHttpMethods,
}

export const corsMiddleware = cors(corsConfig)