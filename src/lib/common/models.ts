/** JSON numeric fields from the API may be serialized as strings. */
export type ApiNumber = number | string

export type ResProps<T = null> = {
  statusCode?: number
  message?: Array<string> | string
  data?: T
  error?: unknown
}

export type OffsetPaginationMeta = {
  offset: ApiNumber
  limit: ApiNumber
  total: ApiNumber
  totalPages: ApiNumber
  hasNext: boolean
  hasPrev: boolean
}

export type CursorPaginationMeta = {
  nextCursor: string
  hasNextPage: boolean
}

export type PaginationMeta = OffsetPaginationMeta | CursorPaginationMeta

export function isOffsetPaginationMeta(
  meta: PaginationMeta | null | undefined,
): meta is OffsetPaginationMeta {
  return meta != null && 'total' in meta
}

export function isCursorPaginationMeta(
  meta: PaginationMeta | null | undefined,
): meta is CursorPaginationMeta {
  return meta != null && 'nextCursor' in meta
}

export type PaginatedResProps<
  TData,
  TMeta extends PaginationMeta = PaginationMeta,
> = {
  data: Array<TData>
  meta: TMeta
}

export type PaginatedBaseQueryProps = {
  offset?: number
  limit?: number
}

export type CursorPaginationQueryProps = {
  cursor?: string
  limit?: number
}

export type User = {
  id: string
  username: string
  email: string
  timezone: string
  createdAt: string
  updatedAt: string
}
