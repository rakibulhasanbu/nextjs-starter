"use server"

import { config } from "@/config"
import { AuthResponse, User } from "@/features/auth/types"
import {
  clearAuthCookies,
  getAccessTokenCookie,
  setAuthCookies,
} from "@/lib/auth-cookies"

const AUTH_ENDPOINTS = {
  signIn: "/auth/signin",
  signUp: "/auth/signup",
  verifySignupToken: "/auth/verify-signup-token",
  resendSignupOtp: "/auth/resend-signup-otp",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  googleLogin: "/auth/google-login",
} as const

type AuthEndpoint = (typeof AUTH_ENDPOINTS)[keyof typeof AUTH_ENDPOINTS]

type AuthActionResult<T> = { status: "success"; data: T } | { status: "error"; error: string }

type AuthPayload = Partial<AuthResponse> & { user?: User }

/**
 * Single point where auth requests are made: hits `endpoint`, and if the
 * response carries tokens/user, persists them via the cookie layer. Every
 * auth server action below is just this call with a different endpoint/body.
 */
const authRequest = async <T extends AuthPayload>(
  endpoint: AuthEndpoint,
  body: unknown,
  extraHeaders?: Record<string, string>
): Promise<AuthActionResult<T>> => {
  try {
    const response = await fetch(`${config.serverUrl}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        ...extraHeaders,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return { status: "error", error: data.message || "Something went wrong" }
    }

    const result = data.data as T
    await setAuthCookies({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    })

    return { status: "success", data: result }
  } catch (error) {
    console.error(error)
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Something went wrong",
    }
  }
}

export const loginAction = async (email: string, password: string) =>
  authRequest(AUTH_ENDPOINTS.signIn, { email, password })

interface RegisterActionProps {
  name: string
  email: string
  password: string
}
export const registerAction = async ({ name, email, password }: RegisterActionProps) =>
  authRequest(AUTH_ENDPOINTS.signUp, { name, email, password })

export const verifyEmailAction = async (email: string, token: number) => {
  const accessToken = await getAccessTokenCookie()
  return authRequest(
    AUTH_ENDPOINTS.verifySignupToken,
    { email, token },
    { Authorization: `${accessToken}` }
  )
}

export const resendVerificationOtpAction = async (email: string) => {
  const accessToken = await getAccessTokenCookie()
  return authRequest(
    AUTH_ENDPOINTS.resendSignupOtp,
    { email },
    { Authorization: `${accessToken}` }
  )
}

export const forgotPasswordAction = async (email: string) =>
  authRequest(AUTH_ENDPOINTS.forgotPassword, { email })

interface ResetPasswordActionProps {
  email: string
  otp: string
  newPassword: string
}
export const resetPasswordAction = async ({ email, otp, newPassword }: ResetPasswordActionProps) =>
  authRequest(AUTH_ENDPOINTS.resetPassword, { email, otp, newPassword })

export const loginWithGoogleAction = async (body: {
  credential?: string
  code?: string
  access_token?: string
}) => authRequest(AUTH_ENDPOINTS.googleLogin, body)

export const logoutAction = async () => {
  await clearAuthCookies()
}

export const revalidateTokensAction = async (accessToken: string, refreshToken: string) => {
  await setAuthCookies({ accessToken, refreshToken })
}

export const getAccessTokenFromCookies = getAccessTokenCookie
