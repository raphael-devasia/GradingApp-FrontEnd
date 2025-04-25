// import NextAuth, { NextAuthConfig, User, Session } from "next-auth"
// import { JWT } from "next-auth/jwt"
// import GoogleProvider from "next-auth/providers/google"
// import AzureADProvider from "next-auth/providers/azure-ad"
// import CredentialsProvider from "next-auth/providers/credentials"
// import { cookies } from "next/headers"

// // Extend User type to include action
// declare module "next-auth" {
//     interface User {
//         action?: string
//     }
// }

// // Extended token and session types
// interface ExtendedToken extends JWT {
//     accessToken?: string
//     provider?: string
//     appToken?: string
//     classroomId?: string
//     id?: string
//     email?: string
//     name?: string
//     error?: string
//     action?: string
// }

// interface ExtendedSession extends Session {
//     accessToken?: string
//     provider?: string
//     appToken?: string
//     classroomId?: string
//     error?: string
//     user: {
//         id?: string
//         name?: string
//         email?: string
//         image?: string
//     }
// }

// // Validate environment variables
// const requiredEnvVars = [
//     "GOOGLE_CLIENT_ID",
//     "GOOGLE_CLIENT_SECRET",
//     "MICROSOFT_CLIENT_ID",
//     "MICROSOFT_CLIENT_SECRET",
//     "NEXTAUTH_SECRET",
//     "NEXTAUTH_URL",
//     "BACKEND_URL",
// ]
// for (const envVar of requiredEnvVars) {
//     if (!process.env[envVar]) {
//         console.error(`Missing environment variable: ${envVar}`)
//         throw new Error(`Missing environment variable: ${envVar}`)
//     }
// }

// export const authConfig: NextAuthConfig = {
//     providers: [
//         GoogleProvider({
//             clientId: process.env.GOOGLE_CLIENT_ID as string,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//         }),
//         AzureADProvider({
//             clientId: process.env.MICROSOFT_CLIENT_ID as string,
//             clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
//             tenantId: "common",
//         }),
//         CredentialsProvider({
//             name: "Credentials",
//             credentials: {
//                 email: { label: "Email", type: "email" },
//                 password: { label: "Password", type: "password" },
//             },
//             async authorize(credentials) {
//                 if (!credentials?.email || !credentials?.password) {
//                     throw new Error("Email and password are required")
//                 }

//                 try {
//                     const response = await fetch(
//                         `${process.env.BACKEND_URL}/api/auth/signin`,
//                         {
//                             method: "POST",
//                             headers: { "Content-Type": "application/json" },
//                             body: JSON.stringify({
//                                 email: credentials.email,
//                                 password: credentials.password,
//                             }),
//                         }
//                     )
//                     const data = await response.json()
//                     console.log("Credentials response:", data)

//                     if (!data.success) {
//                         throw new Error(data.message || "Invalid credentials")
//                     }

//                     return {
//                         id: data.data.userId,
//                         email: data.data.email,
//                         name: `${data.data.firstName} ${data.data.lastName}`,
//                         appToken: data.data.token,
//                         classroomId: data.data.classroomId,
//                     }
//                 } catch (error: any) {
//                     console.error("Credentials error:", error.message)
//                     throw new Error(error.message || "Failed to authenticate")
//                 }
//             },
//         }),
//     ],
//     callbacks: {
//         async signIn({ user, account }) {
//             console.log("signIn callback:", { user, account })
//             if (
//                 account?.provider === "google" ||
//                 account?.provider === "azure-ad"
//             ) {
//                 const cookieStore = await cookies() // Await cookies()
//                 const action = cookieStore.get("auth_action")?.value
//                 user.action = action === "signup" ? "signup" : ""
//                 console.log("signIn action set:", user.action)
//                 // Clear cookie after use
//                 cookieStore.set("auth_action", "", { maxAge: 0, path: "/" })
//             }
//             return true
//         },
//         async jwt({ token, account, user, trigger }) {
//             console.log("JWT callback:", {
//                 tokenKeys: token ? Object.keys(token) : "no token",
//                 accountKeys: account ? Object.keys(account) : "no account",
//                 userKeys: user ? Object.keys(user) : "no user",
//                 trigger,
//             })

//             if (account && user) {
//                 try {
//                     token.accessToken = account.access_token
//                     token.provider = account.provider
//                     token.action = user.action || ""

//                     console.log("Final action used:", token.action)

//                     let providerId
//                     if (account.provider === "google") {
//                         providerId = account.providerAccountId || user.id
//                     } else if (account.provider === "azure-ad") {
//                         providerId =
//                             account.providerAccountId ||
//                             account.provider_account_id
//                     } else {
//                         providerId = user.id || account.providerAccountId
//                     }

//                     if (providerId && user.email) {
//                         const oauthUrl = `${
//                             process.env.BACKEND_URL
//                         }/api/auth/oauth${
//                             token.action ? `?action=${token.action}` : ""
//                         }`
//                         console.log("OAuth URL:", oauthUrl)

//                         const response = await fetch(oauthUrl, {
//                             method: "POST",
//                             headers: { "Content-Type": "application/json" },
//                             body: JSON.stringify({
//                                 provider: account.provider,
//                                 providerId: providerId,
//                                 email: user.email,
//                                 name: user.name,
//                             }),
//                         })

//                         const data = await response.json()
//                         console.log("OAuth backend response:", data)

//                         if (response.status === 401) {
//                             token.error =
//                                 data.message ||
//                                 "User not registered. Please sign up first."
//                             return token
//                         }

//                         if (!response.ok) {
//                             throw new Error(
//                                 `Backend API error: ${response.status} - ${
//                                     data.message || "Unknown error"
//                                 }`
//                             )
//                         }

//                         if (data.success && data.data) {
//                             if (data.data.token)
//                                 token.appToken = data.data.token
//                             if (data.data.classroomId)
//                                 token.classroomId = data.data.classroomId

//                             if (data.data.user) {
//                                 if (data.data.user._id)
//                                     token.id = data.data.user._id
//                                 if (data.data.user.email)
//                                     token.email = data.data.user.email
//                                 if (
//                                     data.data.user.firstName &&
//                                     data.data.user.lastName
//                                 ) {
//                                     token.name = `${data.data.user.firstName} ${data.data.lastName}`
//                                 } else if (data.data.user.name) {
//                                     token.name = data.data.user.name
//                                 }
//                             }
//                         } else {
//                             token.error =
//                                 data.message || "Failed to process OAuth"
//                             console.error(
//                                 "OAuth error from backend:",
//                                 data.message
//                             )
//                         }
//                     }
//                 } catch (error: any) {
//                     console.error("JWT callback error:", error.message)
//                     token.error = error.message || "Failed to process JWT"
//                 }
//             }

//             return token
//         },
//         async session(params: {
//             session: Session
//             token: JWT
//             user?: any
//             newSession?: any
//             trigger?: "update"
//         }) {
//             const { session, token } = params
//             console.log("Session callback:", {
//                 sessionKeys: session ? Object.keys(session) : "no session",
//                 tokenKeys: token ? Object.keys(token) : "no token",
//             })

//             const extendedSession = session as ExtendedSession
//             const extendedToken = token as ExtendedToken

//             if (!extendedSession.user) {
//                 extendedSession.user = {
//                     id: undefined,
//                     name: undefined,
//                     email: undefined,
//                     image: undefined,
//                 }
//             }

//             extendedSession.accessToken = extendedToken.accessToken
//             extendedSession.provider = extendedToken.provider
//             extendedSession.appToken = extendedToken.appToken
//             extendedSession.classroomId = extendedToken.classroomId
//             extendedSession.error = extendedToken.error

//             if (extendedToken.id) extendedSession.user.id = extendedToken.id
//             if (extendedToken.name)
//                 extendedSession.user.name = extendedToken.name
//             if (extendedToken.email)
//                 extendedSession.user.email = extendedToken.email

//             return extendedSession
//         },
//         async redirect({ url, baseUrl }) {
//             console.log("Redirect callback:", { url, baseUrl })

//             if (url.includes("/api/auth/callback")) {
//                 console.log("Handling OAuth callback:", { url })
//                 const callbackUrl = new URL(url, baseUrl)
//                 const error = callbackUrl.searchParams.get("error")

//                 if (error) {
//                     return `${baseUrl}/login?error=${encodeURIComponent(
//                         decodeURIComponent(error)
//                     )}`
//                 }

//                 const response = await fetch(`${baseUrl}/api/auth/session`, {
//                     headers: {
//                         cookie: `next-auth.session-token=${
//                             callbackUrl.searchParams.get("session_token") || ""
//                         }`,
//                     },
//                 })
//                 const session = await response.json()

//                 if (session.error) {
//                     return `${baseUrl}/login?error=${encodeURIComponent(
//                         session.error
//                     )}`
//                 }

//                 if (
//                     session.classroomId &&
//                     !session.appToken?.includes("sub_active")
//                 ) {
//                     return `${baseUrl}/signup?token=${session.appToken}&classroomId=${session.classroomId}`
//                 }

//                 return `${baseUrl}/dashboard/assignments`
//             }

//             return url.startsWith(baseUrl) ? url : baseUrl
//         },
//     },
//     pages: {
//         signIn: "/login",
//     },
//     session: {
//         strategy: "jwt",
//     },
//     secret: process.env.NEXTAUTH_SECRET,
//     debug: process.env.NODE_ENV === "development",
// }

// export const { handlers, signIn, signOut, auth } = NextAuth(authConfig)

import NextAuth, { NextAuthConfig, User, Session, Auth } from "next-auth"
import { JWT } from "next-auth/jwt"
import GoogleProvider from "next-auth/providers/google"
import AzureADProvider from "next-auth/providers/azure-ad"
import CredentialsProvider from "next-auth/providers/credentials"
import { cookies } from "next/headers"

// Extend User type to include action
declare module "next-auth" {
    interface User {
        action?: string
    }
}

// Extended token and session types
interface ExtendedToken extends JWT {
    accessToken?: string
    provider?: string
    appToken?: string
    classroomId?: string
    id?: string
    email?: string
    name?: string
    error?: string
    action?: string
}

interface ExtendedSession extends Session {
    accessToken?: string
    provider?: string
    appToken?: string
    classroomId?: string
    error?: string
    user: {
        id?: string
        name?: string
        email?: string
        image?: string
    }
    action?: string
}

// Verify environment variables at startup
const requiredEnvVars = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "MICROSOFT_CLIENT_ID",
    "MICROSOFT_CLIENT_SECRET",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
    "BACKEND_URL",
]
console.log("Verifying environment variables...")
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing environment variable: ${envVar}`)
        throw new Error(`Missing environment variable: ${envVar}`)
    } else {
        console.log(`Environment variable ${envVar}: ${process.env[envVar]}`)
    }
}
// Additional validation for NEXTAUTH_URL
if (process.env.NEXTAUTH_URL !== "http://localhost:3000") {
    console.warn(
        `NEXTAUTH_URL is set to ${process.env.NEXTAUTH_URL}, expected http://localhost:3000. This may cause session issues.`
    )
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
                        name: `${data.data.firstName} ${data.data.lastName}`,
                        appToken: data.data.token,
                        classroomId: data.data.classroomId,
                    }
                } catch (error: any) {
                    console.error("Credentials error:", error.message)
                    throw new Error(error.message || "Failed to authenticate")
                }
            },
        }),
    ],
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
                console.log("Cookies in signIn:", cookieStore.getAll())
                cookieStore.set("auth_action", "", { maxAge: 0, path: "/" })
            }
            return true
        },
        async jwt({ token, account, user, trigger }) {
            console.log("JWT callback:", {
                tokenKeys: token ? Object.keys(token) : "no token",
                accountKeys: account ? Object.keys(account) : "no account",
                userKeys: user ? Object.keys(user) : "no user",
                trigger,
            })

            if (account && user) {
                try {
                    token.accessToken = account.access_token
                    token.provider = account.provider
                    token.action = user.action || ""

                    console.log("Final action used:", token.action)

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
                            if (data.data.classroomId)
                                token.classroomId = data.data.classroomId

                            if (data.data.user) {
                                if (data.data.user._id)
                                    token.id = data.data.user._id
                                if (data.data.user.email)
                                    token.email = data.data.user.email
                                if (
                                    data.data.user.firstName &&
                                    data.data.user.lastName
                                ) {
                                    token.name = `${data.data.user.firstName} ${data.data.lastName}`
                                } else if (data.data.user.name) {
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
            }

            console.log("JWT token after processing:", token)
            return token
        },
        async session(params: {
            session: Session
            token: JWT
            user?: any
            newSession?: any
            trigger?: "update"
        }) {
            const { session, token } = params
            console.log("Session callback:", {
                sessionKeys: session ? Object.keys(session) : "no session",
                tokenKeys: token ? Object.keys(token) : "no token",
            })

            const extendedSession = session as ExtendedSession
            const extendedToken = token as ExtendedToken

            if (!extendedSession.user) {
                extendedSession.user = {
                    id: undefined,
                    name: undefined,
                    email: undefined,
                    image: undefined,
                }
            }

            extendedSession.accessToken = extendedToken.accessToken
            extendedSession.provider = extendedToken.provider
            extendedSession.appToken = extendedToken.appToken
            extendedSession.classroomId = extendedToken.classroomId
            extendedSession.error = extendedToken.error
            extendedSession.action = extendedToken.action

            if (extendedToken.id) extendedSession.user.id = extendedToken.id
            if (extendedToken.name)
                extendedSession.user.name = extendedToken.name
            if (extendedToken.email)
                extendedSession.user.email = extendedToken.email

            console.log("Session after processing:", extendedSession)
            return extendedSession
        },
        async redirect({ url, baseUrl }) {
            console.log("Redirect callback:", { url, baseUrl, rawUrl: url })

            // Log all cookies for debugging
            const cookieStore = await cookies()
            console.log("All cookies in redirect:", cookieStore.getAll())

            // Check for session token to infer OAuth callback
            const sessionTokenCookie = cookieStore.get(
                "next-auth.session-token"
            )
            const callbackUrlCookie = cookieStore.get(
                "authjs.callback-url"
            )?.value
            console.log("Session token cookie:", {
                sessionToken: sessionTokenCookie
                    ? sessionTokenCookie.value
                    : "missing",
                callbackUrl: callbackUrlCookie || "none",
            })

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

                // Clear callback-url cookie to prevent interference
                if (callbackUrlCookie) {
                    cookieStore.set("authjs.callback-url", "", {
                        maxAge: 0,
                        path: "/",
                    })
                    console.log("Cleared authjs.callback-url cookie")
                }

                // Parse URL (use cookie if url is /login)
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

                // Retry auth() up to 3 times with delay
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
