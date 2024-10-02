import bcrypt from 'bcrypt'
import { invoices, customers, revenue, users } from '../lib/placeholder-data'
import { executeQuery } from '@/app/lib/neon-serverless'

async function seedUsers() {
  await executeQuery('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `)

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10)
      return executeQuery(
        'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [user.id, user.name, user.email, hashedPassword]
      )
    })
  )

  console.log(`Seeded ${insertedUsers.length} users`)
}

async function seedInvoices() {
  await executeQuery('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    )
  `)

  const insertedInvoices = await Promise.all(
    invoices.map((invoice) =>
      executeQuery(
        'INSERT INTO invoices (customer_id, amount, status, date) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [invoice.customer_id, invoice.amount, invoice.status, invoice.date]
      )
    )
  )

  console.log(`Seeded ${insertedInvoices.length} invoices`)
}

async function seedCustomers() {
  await executeQuery('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    )
  `)

  const insertedCustomers = await Promise.all(
    customers.map((customer) =>
      executeQuery(
        'INSERT INTO customers (id, name, email, image_url) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [customer.id, customer.name, customer.email, customer.image_url]
      )
    )
  )

  console.log(`Seeded ${insertedCustomers.length} customers`)
}

async function seedRevenue() {
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    )
  `)

  const insertedRevenue = await Promise.all(
    revenue.map((rev) =>
      executeQuery(
        'INSERT INTO revenue (month, revenue) VALUES ($1, $2) ON CONFLICT (month) DO NOTHING',
        [rev.month, rev.revenue]
      )
    )
  )

  console.log(`Seeded ${insertedRevenue.length} revenue entries`)
}

export async function GET() {
  try {
    await executeQuery('BEGIN')
    await seedUsers()
    await seedCustomers()
    await seedInvoices()
    await seedRevenue()
    await executeQuery('COMMIT')

    return Response.json({ message: 'Database seeded successfully' })
  } catch (error) {
    await executeQuery('ROLLBACK')
    return Response.json({ error }, { status: 500 })
  }
}
