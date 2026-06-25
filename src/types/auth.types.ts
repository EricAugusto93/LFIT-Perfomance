export type UserRole = 'trainer' | 'student'

export interface JWTPayload {
  sub: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}
