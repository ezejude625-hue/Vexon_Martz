// ============================================================
// AUTH UTILITY — src/lib/auth.js
// ============================================================
// JWT-based stateless auth with HttpOnly cookies.
// ============================================================

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const COOKIE_NAME    = 'vexon_auth'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7   // 7 days in seconds

// Encode the JWT secret string as Uint8Array (required by jose)
function getSecret() {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET env var is not set')
  return new TextEncoder().encode(s)
}

/* ─── signToken ──────────────────────────────────────────── */
// Sign a new JWT with the user payload.
// Called after successful login or registration.
export async function signToken(payload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

/* ─── verifyToken ────────────────────────────────────────── */
// Decode and verify a JWT string.
// Returns the payload object, or null if invalid/expired.
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload
  } catch {
    return null
  }
}

/* ─── setAuthCookie ──────────────────────────────────────── */
// Attach the auth token as a secure HttpOnly cookie to a response.
export function setAuthCookie(response, token) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,                                        // Not readable by JS
    secure:   process.env.NODE_ENV === 'production',      // HTTPS only in prod
    sameSite: 'lax',
    maxAge:   COOKIE_MAX_AGE,
    path:     '/',
  })
  return response
}

/* ─── clearAuthCookie ────────────────────────────────────── */
// Expire the auth cookie immediately (called on logout).
export function clearAuthCookie(response) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   0,    // Expire right away
    path:     '/',
  })
  return response
}

/* ─── getAuthUser ────────────────────────────────────────── */
// Extract and verify the caller from a Next.js API Request.
// Checks HttpOnly cookie first, then falls back to Bearer header.
// Returns the token payload, or null if unauthenticated.
export async function getAuthUser(req) {
  const cookieToken = req.cookies.get(COOKIE_NAME)?.value

  const authHeader  = req.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  const token = cookieToken ?? bearerToken
  if (!token) return null

  return verifyToken(token)
}

/* ─── getCurrentUser ─────────────────────────────────────── */
// Read the current user inside a Server Component.
export async function getCurrentUser() {
  const cookieStore = cookies()
  const token       = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

/* ─── requireAuth ────────────────────────────────────────── */
// Route guard for API handlers.
// Pass allowedRoles array to restrict access by role.
// Returns the user payload, or a 401/403 NextResponse.
//
// Usage:
//   const user = await requireAuth(req, ['admin'])
//   if (user instanceof NextResponse) return user  // early return
export async function requireAuth(req, allowedRoles = []) {
  const user = await getAuthUser(req)

  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 })
  }

  return user
}
