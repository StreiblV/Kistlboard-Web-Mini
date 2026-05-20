export interface AuthUser {
  id: number | string

  email: string

  role: 'admin' | 'editor' | 'client'

  boards?: unknown[]
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  exp?: number
  token?: string
  user: AuthUser
}