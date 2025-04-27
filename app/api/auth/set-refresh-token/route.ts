import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const { refreshToken } = await request.json()
        if (!refreshToken) {
            return NextResponse.json(
                { success: false, message: "Refresh token is required" },
                { status: 400 }
            )
        }

        const response = NextResponse.json({ success: true })
        response.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days
        })

        return response
    } catch (error: any) {
        console.error("Set refresh token error:", error.message)
        return NextResponse.json(
            { success: false, message: "Failed to set refresh token" },
            { status: 500 }
        )
    }
}
