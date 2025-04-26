"use server"

import { verifyEmailWithReoon } from "@/app/actions/create-checkout-session"
import { revalidatePath } from "next/cache"
import {
    validateEmail,
    validateFullName,
    validatePassword,
} from "../validators"
const API_URL = process.env.API_URL || "https://gradingapp-render.onrender.com"

/**
 * Sends a password reset link to the provided email address
 */
export async function requestPasswordReset(email: string) {
    // In a real application, you would:
    // 1. Check if the email exists in your database
    // 2. Generate a secure token and store it with an expiration time
    // 3. Send an email with a link containing the token

    // For demo purposes, we'll just simulate a successful request
    console.log(`Password reset requested for: ${email}`)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return { success: true }
}

/**
 * Resets the user's password using the provided token
 */
export async function resetPassword(token: string, newPassword: string) {
    // In a real application, you would:
    // 1. Verify the token is valid and not expired
    // 2. Find the user associated with the token
    // 3. Hash the new password and update it in the database
    // 4. Invalidate the token

    // For demo purposes, we'll just simulate a successful reset
    console.log(`Password reset with token: ${token}`)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Revalidate the login page to ensure fresh data
    revalidatePath("/login")

    return { success: true }
}

export const login = async (email: string, password: string) => {
    console.log(API_URL)
    // Validate inputs
    const emailError = validateEmail(email)
    if (emailError) throw new Error(emailError)
    const passwordError = validatePassword(password)
    if (passwordError) throw new Error(passwordError)

    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Login failed")
    console.log(data)

    return data // { user, token }
}

export const signup = async (
    fullName: string,
    email: string,
    password: string
) => {
    // Validate inputs
    const fullNameError = validateFullName(fullName)
    if (fullNameError) throw new Error(fullNameError)
    const emailError = validateEmail(email)
    if (emailError) throw new Error(emailError)
    const passwordError = validatePassword(password)
    if (passwordError) throw new Error(passwordError)

    // Verify work/.edu email for signup
    const isEmailVerified = await verifyEmailWithReoon(email)
    if (!isEmailVerified) {
        throw new Error("Please use a valid work or .edu email")
    }

    const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Signup failed")
    return data // { user, token }
}
