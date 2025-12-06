export const maskName = (name: string) => {
  if (!name) return ''
  const parts = name.split(' ')
  return parts.map(p => p[0] + '*'.repeat(Math.max(0, p.length - 1))).join(' ')
}

export const maskEmail = (email: string) => {
  if (!email) return ''
  const [local, domain] = email.split('@')
  return local[0] + '*'.repeat(Math.max(0, local.length - 1)) + '@' + domain
}

export const maskPhone = (phone: string) => {
  if (!phone) return ''
  return phone.slice(0, 4) + '****' + phone.slice(-2)
}

export const maskAddress = (a: string) => {
  const s = String(a || '').trim()
  if (!s) return ''
  return '•'.repeat(Math.min(s.length, 12))
}
