import { api } from './client'

export async function downloadLeadsCsv(filename = 'leads-export.csv') {
  const res = await api.get<Blob>('/exports/leads.csv', {
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}
