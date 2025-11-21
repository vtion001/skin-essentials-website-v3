export async function getJson<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, method: 'GET', headers: withJson(init?.headers) })
  if (!res.ok) throw new Error(String(res.status))
  return res.json() as Promise<T>
}

export async function postJson<T = any>(url: string, body?: any, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, method: 'POST', headers: withJson(init?.headers, true), body: JSON.stringify(body ?? {}) })
  if (!res.ok) throw new Error(String(res.status))
  return res.json() as Promise<T>
}

export async function patchJson<T = any>(url: string, body?: any, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, method: 'PATCH', headers: withJson(init?.headers, true), body: JSON.stringify(body ?? {}) })
  if (!res.ok) throw new Error(String(res.status))
  return res.json() as Promise<T>
}

export async function del<T = any>(url: string, body?: any, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, method: 'DELETE', headers: withJson(init?.headers, true), body: body ? JSON.stringify(body) : undefined })
  if (!res.ok) throw new Error(String(res.status))
  return res.json() as Promise<T>
}

function withJson(headers?: HeadersInit, includeCsrf?: boolean): HeadersInit {
  const h = new Headers(headers || {})
  if (!h.get('Content-Type')) h.set('Content-Type', 'application/json')
  if (includeCsrf) {
    const csrf = typeof document !== 'undefined' ? (document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)?.[1] || '') : ''
    if (!h.get('x-csrf-token') && csrf) h.set('x-csrf-token', csrf)
  }
  return h
}