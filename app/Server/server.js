import express from 'express'
import http from 'http'
import winston from 'winston'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 2001