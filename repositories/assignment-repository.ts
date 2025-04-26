import { AssignmentInput, Assignment } from "@/types/assignment"
interface ApiResponse<T> {
    success: boolean
    data: T
}

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://grading-app-five.vercel.app"

export default class HttpAssignmentRepository {
    private async getToken(): Promise<string> {
        // Replace with cookie-based token retrieval
        const token = localStorage.getItem("token")
        if (!token) {
            throw new Error("No authentication token found")
        }
        return token
    }

    async generateAssignmentContent(
        assignmentInput: AssignmentInput
    ): Promise<{ data: Partial<Assignment> }> {
        const token = await this.getToken()
        const response = await fetch(`${API_URL}/api/assignments/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(assignmentInput),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(
                error.message || "Failed to generate assignment content"
            )
        }

        return response.json()
    }

    async createAssignment(
        assignmentInput: AssignmentInput
    ): Promise<{ data: Assignment }> {
        const token = await this.getToken()
        const response = await fetch(`${API_URL}/api/assignments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(assignmentInput),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Failed to create assignment")
        }

        return response.json()
    }
    async getAssignments(): Promise<ApiResponse<Assignment[]>> {
        const token = await this.getToken()
        const response = await fetch(`${API_URL}/api/assignments/all`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("token")
                window.location.href = "/login"
            }
            const error = await response.json()
            throw new Error(error.message || "Failed to fetch assignments")
        }
        return response.json()
    }
}
