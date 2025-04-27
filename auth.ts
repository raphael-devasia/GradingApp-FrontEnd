import NextAuth, { NextAuthConfig, User, Session, Auth } from "next-auth"
import { JWT } from "next-auth/jwt"
import GoogleProvider from "next-auth/providers/google"
import AzureADProvider from "next-auth/providers/azure-ad"
import CredentialsProvider from "next-auth/providers/credentials"
import { cookies } from "next/headers"

declare module "next-auth" {
    interface User {
        action?: string
    }
}

interface ExtendedToken extends JWT {
    accessToken?: string
    refreshToken?: string // Add refresh token
    provider?: string
    appToken?: string
    classroomId?: string
    id?: string
    email?: string
    name?: string
    error?: string
    action?: string
    tokenType?: "signup" | "login"
}

interface ExtendedSession extends Session {
    accessToken?: string
    refreshToken?: string // Add refresh token
    provider?: string
    appToken?: string
    classroomId?: string
    error?: string
    action?: string
    tokenType?: "signup" | "login"
    user: {
        id?: string
        name?: string
        email?: string
        image?: string
    }
}

const requiredEnvVars = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "MICROSOFT_CLIENT_ID",
    "MICROSOFT_CLIENT_SECRET",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
    "BACKEND_URL",
]
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing environment variable: ${envVar}`)
    }
}

export const authConfig: NextAuthConfig = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        AzureADProvider({
            clientId: process.env.MICROSOFT_CLIENT_ID as string,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
            tenantId: "common",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!process.env.BACKEND_URL) {
                    throw new Error("BACKEND_URL is not defined")
                }
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required")
                }

                try {
                    const response = await fetch(
                        `${process.env.BACKEND_URL}/api/auth/signin`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                email: credentials.email,
                                password: credentials.password,
                            }),
                        }
                    )
                    const data = await response.json()
                    console.log("Credentials response:", data)

                    if (!data.success) {
                        throw new Error(data.message || "Invalid credentials")
                    }

                    return {
                        id: data.data.userId,
                        email: data.data.email,
                        name: data.data.name,
                        appToken: data.data.token,
                        refreshToken: data.data.refreshToken, // Add refresh token
                        classroomId: data.data.classroomId,
                    }
                } catch (error: any) {
                    console.error("Credentials error:", error.message)
                    throw new Error(error.message || "Failed to authenticate")
                }
            },
        }),
    ],
    events: {
        async signOut({ token }) {
            console.log("User signed out", token)
            if (typeof window !== "undefined") {
                localStorage.removeItem("token")
                localStorage.removeItem("classroomId")
            }
            // Clear refresh token cookie
            const response = await fetch("/api/auth/clear-refresh-token", {
                method: "POST",
            })
            console.log("Clear refresh token response:", await response.json())
        },
    },
    callbacks: {
        async signIn({ user, account }) {
            console.log("signIn callback:", { user, account })
            if (
                account?.provider === "google" ||
                account?.provider === "azure-ad"
            ) {
                const cookieStore = await cookies()
                const action = cookieStore.get("auth_action")?.value
                user.action = action === "signup" ? "signup" : ""
                console.log("signIn action set:", user.action)
                cookieStore.set("auth_action", "", { maxAge: 0, path: "/" })
            }
            return true
        },

        async jwt({
            token,
            account,
            user,
            trigger,
        }: {
            token: JWT
            user?: User
            account?: Account | null
            trigger?: "signIn" | "signUp" | "update" | "signOut"
        }) {
            if (trigger === "signOut") {
                return {}
            }
            if (account && user) {
                try {
                    token.accessToken = account.access_token
                    token.provider = account.provider
                    token.action = user.action || ""
                    token.refreshToken = user.refreshToken // Add refresh token

                    let providerId
                    if (account.provider === "google") {
                        providerId = account.providerAccountId || user.id
                    } else if (account.provider === "azure-ad") {
                        providerId =
                            account.providerAccountId ||
                            account.provider_account_id
                    } else {
                        providerId = user.id || account.providerAccountId
                    }

                    if (providerId && user.email) {
                        const oauthUrl = `${
                            process.env.BACKEND_URL
                        }/api/auth/oauth${
                            token.action ? `?action=${token.action}` : ""
                        }`
                        console.log("OAuth URL:", oauthUrl)

                        const response = await fetch(oauthUrl, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                provider: account.provider,
                                providerId: providerId,
                                email: user.email,
                                name: user.name,
                            }),
                        })

                        const data = await response.json()
                        console.log("OAuth backend response:", data)

                        if (response.status === 401) {
                            token.error =
                                data.message ||
                                "User not registered. Please sign up first."
                            return token
                        }

                        if (!response.ok) {
                            throw new Error(
                                `Backend API error: ${response.status} - ${
                                    data.message || "Unknown error"
                                }`
                            )
                        }

                        if (data.success && data.data) {
                            if (data.data.token)
                                token.appToken = data.data.token
                            token.refreshToken = data.data.refreshToken // Add refresh token
                            token.tokenType = data.data.tokenType || "login"
                            if (data.data.classroomId)
                                token.classroomId = data.data.classroomId

                            if (data.data.user) {
                                if (data.data.user._id)
                                    token.id = data.data.user._id
                                if (data.data.user.email)
                                    token.email = data.data.user.email
                                if (data.data.user.name) {
                                    token.name = data.data.user.name
                                }
                            }
                        } else {
                            token.error =
                                data.message || "Failed to process OAuth"
                            console.error(
                                "OAuth error from backend:",
                                data.message
                            )
                        }
                    }
                } catch (error: any) {
                    console.error("JWT callback error:", error.message)
                    token.error = error.message || "Failed to process JWT"
                }
            } else if (token.appToken) {
                // Check if access token is expired
                try {
                    const decoded = jwt.decode(token.appToken) as {
                        exp?: number
                    }
                    if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
                        console.log(
                            "Access token expired, attempting to refresh"
                        )
                        const refreshResponse = await fetch(
                            `${process.env.BACKEND_URL}/api/auth/refresh`,
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    refreshToken: token.refreshToken,
                                }),
                            }
                        )

                        if (!refreshResponse.ok) {
                            token.error = "Failed to refresh token"
                            return token
                        }

                        const { data } = await refreshResponse.json()
                        token.appToken = data.token
                        token.refreshToken = data.refreshToken
                        token.classroomId = data.classroomId
                        token.id = data.userId
                        token.email = data.email
                        token.name = data.name
                        token.error = undefined
                    }
                } catch (error: any) {
                    console.error("Token refresh error:", error.message)
                    token.error = error.message || "Failed to refresh token"
                }
            }

            console.log("JWT token after processing:", token)
            return token
        },

        async session(params: {
            session: Session
            token: JWT
            user?: User
            newSession?: any
            trigger?: "update"
        }): Promise<ExtendedSession> {
            const { session, token } = params

            console.log("Session callback invoked with:", {
                session: session ? Object.keys(session) : "no session",
                token: token ? Object.keys(token) : "no token",
                trigger: params.trigger,
            })

            const extendedSession: ExtendedSession = {
                ...session,
                user: {
                    ...session.user,
                    id: undefined,
                    name: undefined,
                    email: undefined,
                    image: undefined,
                },
                accessToken: undefined,
                refreshToken: undefined, // Add refresh token
                provider: undefined,
                appToken: undefined,
                classroomId: undefined,
                error: undefined,
                action: undefined,
            }

            const extendedToken = token as ExtendedToken

            extendedSession.accessToken = extendedToken.accessToken
            extendedSession.refreshToken = extendedToken.refreshToken // Add refresh token
            extendedSession.provider = extendedToken.provider
            extendedSession.appToken = extendedToken.appToken
            extendedSession.classroomId = extendedToken.classroomId
            extendedSession.error = extendedToken.error
            extendedSession.action = extendedToken.action
            if ("tokenType" in extendedToken) {
                extendedSession.tokenType = extendedToken.tokenType
            }

            if (extendedToken.id) extendedSession.user.id = extendedToken.id
            if (extendedToken.name)
                extendedSession.user.name = extendedToken.name
            if (extendedToken.email)
                extendedSession.user.email = extendedToken.email
            if (extendedToken.image)
                extendedSession.user.image = extendedToken.image

            console.log("Processed session object:", {
                user: {
                    id: extendedSession.user.id,
                    name: extendedSession.user.name,
                    email: extendedSession.user.email,
                },
                accessToken: extendedSession.accessToken
                    ? "***redacted***"
                    : undefined,
                refreshToken: extendedSession.refreshToken
                    ? "***redacted***"
                    : undefined,
                provider: extendedSession.provider,
                appToken: extendedSession.appToken
                    ? "***redacted***"
                    : undefined,
                classroomId: extendedSession.classroomId,
                error: extendedSession.error,
                action: extendedSession.action,
                tokenType: extendedSession.tokenType,
            })

            return extendedSession
        },

        async redirect({ url, baseUrl }) {
            console.log("Redirect callback:", { url, baseUrl, rawUrl: url })

            const cookieStore = await cookies()
            console.log("All cookies in redirect:", cookieStore.getAll())

            const sessionTokenCookie = cookieStore.get(
                "next-auth.session-token"
            )
            const callbackUrlCookie = cookieStore.get(
                "authjs.callback-url"
            )?.value

            if (
                sessionTokenCookie ||
                url.includes("/api/auth/callback") ||
                url.includes("code=") ||
                (callbackUrlCookie &&
                    callbackUrlCookie.includes("/api/auth/callback"))
            ) {
                console.log("Detected OAuth callback or session:", {
                    url,
                    callbackUrlCookie,
                    hasSessionToken: !!sessionTokenCookie,
                })

                if (callbackUrlCookie) {
                    cookieStore.set("authjs.callback-url", "", {
                        maxAge: 0,
                        path: "/",
                    })
                    console.log("Cleared authjs.callback-url cookie")
                }

                const effectiveUrl =
                    url.includes("/api/auth/callback") || url.includes("code=")
                        ? url
                        : callbackUrlCookie || url
                const parsedUrl = new URL(effectiveUrl, baseUrl)
                console.log(
                    "Parsed URL params:",
                    Object.fromEntries(parsedUrl.searchParams)
                )

                const error = parsedUrl.searchParams.get("error")
                if (error) {
                    console.log("OAuth error detected:", error)
                    return `${baseUrl}/login?error=${encodeURIComponent(
                        decodeURIComponent(error)
                    )}`
                }

                let session: ExtendedSession | null = null
                for (let attempt = 1; attempt <= 3; attempt++) {
                    console.log(`Fetching session, attempt ${attempt}...`)
                    const authResult = await auth()
                    session = authResult as ExtendedSession | null
                    if (session) break
                    console.log(
                        `Session not found on attempt ${attempt}, retrying...`
                    )
                    await new Promise((resolve) => setTimeout(resolve, 100))
                }

                console.log("Fetched session in redirect:", {
                    session: session
                        ? {
                              user: session.user,
                              appToken: session.appToken,
                              classroomId: session.classroomId,
                              subActive:
                                  session.appToken?.includes("sub_active"),
                              action: session.action,
                              error: session.error,
                          }
                        : "no session",
                })

                if (!session) {
                    console.log(
                        "No session found after retries, redirecting to login with error"
                    )
                    return `${baseUrl}/login?error=${encodeURIComponent(
                        "Authentication session not found"
                    )}`
                }

                if (session.error) {
                    console.log("Session error:", session.error)
                    return `${baseUrl}/login?error=${encodeURIComponent(
                        session.error
                    )}`
                }

                if (
                    session.action === "signup" &&
                    session.classroomId &&
                    !session.appToken?.includes("sub_active")
                ) {
                    console.log(
                        "Redirecting to signup with token and classroomId"
                    )
                    return `${baseUrl}/signup?token=${session.appToken}&classroomId=${session.classroomId}`
                }

                if (session.appToken?.includes("sub_active")) {
                    console.log(
                        "Redirecting to dashboard (active subscription)"
                    )
                    return `${baseUrl}/dashboard/assignments`
                }

                console.log("Redirecting to signup (no active subscription)")
                return `${baseUrl}/signup?subscription_error=true`
            }

            console.log(
                "Default redirect:",
                url.startsWith(baseUrl) ? url : `${baseUrl}/login`
            )
            return url.startsWith(baseUrl) ? url : `${baseUrl}/login`
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
}

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig)
