import { NextResponse } from "next/server"

export async function POST() {
    try {
        const response = NextResponse.json({ success: true })
        response.cookies.set("refreshToken", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 0,
        })
        return response
    } catch (error: any) {
        console.error("Clear refresh token error:", error.message)
        return NextResponse.json(
            { success: false, message: "Failed to clear refresh token" },
            { status: 500 }
        )
    }
}
