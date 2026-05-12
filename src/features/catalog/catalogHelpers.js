import { api } from '@/services/api.js'

export async function catalogFetchJson(url, config) {
  const { data } = await api.get(url, config)
  return data
}

export function isArchivedCatalogRow(row) {
  return Boolean(row?.deletedAt)
}
