import fastify from 'fastify'
import pg from 'fastify-postgres'
import aws from '@fastify/aws-lambda'
import routes from './routes.cjs'

const app = fastify({ logger: true })
const user = process.env.POSTGRES_USER
const pswd = process.env.POSTGRES_PASSWORD
const srvc = process.env.POSTGRES_SERVICE
const port = process.env.POSTGRES_PORT
const db = process.env.POSTGRES_DB

app.register(pg, {
  connectionString: `postgres://${user}:${pswd}@${srvc}:${port}/${db}`
})

app.register(routes)

export let handler = aws(app)
