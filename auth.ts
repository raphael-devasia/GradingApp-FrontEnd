import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Microsoft from "next-auth/providers/azure-ad"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google,
        Microsoft({
            clientId: process.env.MICROSOFT_CLIENT_ID,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        }),
    ],
})
