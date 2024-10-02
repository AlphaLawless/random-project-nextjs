'use server'
import { neon } from '@neondatabase/serverless'
import { env } from './env'

type Primitive = string | number | boolean | undefined | null

interface QueryResultRow {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [column: string]: any
}

type InferQueryResult<T> = T extends QueryResultRow ? T[] : unknown[]

export const sql = neon(env.DATABASE_URL)

export function executeQuery<T extends QueryResultRow = QueryResultRow>(query: string): Promise<T[]>
export function executeQuery<T extends QueryResultRow = QueryResultRow>(
  query: string,
  param: Primitive[]
): Promise<T[]>
export async function executeQuery<T extends QueryResultRow = QueryResultRow>(
  query: string,
  param?: Primitive[]
): Promise<InferQueryResult<T>> {
  const result = await sql(query, param)
  return result as InferQueryResult<T>
}
