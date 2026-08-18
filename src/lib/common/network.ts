import {
  deleteReq,
  fetcher,
  fetcherWithParams,
  paginatedFetcher,
  paginatedFetcherWithParams,
  patch,
  post,
} from './fetcher'

export const network = {
  get: fetcher,
  delete: deleteReq,
  post,
  patch,
  paginatedFetcher,
  paginatedFetcherWithParams,
  fetcherWithParams,
}
