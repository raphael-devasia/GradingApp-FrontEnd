import { fetchWithRefresh } from "@/lib/fetchWithRefresh"
import { Course, CourseInput } from "@/types/course"

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://www.junergypsy.online"

interface ApiResponse<T> {
    success: boolean
    data: T
}

export interface CourseRepository {
    createCourse(course: CourseInput): Promise<ApiResponse<Course>>
    getCourses(): Promise<ApiResponse<Course[]>>
}

export class HttpCourseRepository implements CourseRepository {
    private async getToken(): Promise<string> {
        const token = localStorage.getItem("token")
        if (!token) {
            throw new Error("No authentication token found")
        }
        return token
    }

    async createCourse(course: CourseInput): Promise<ApiResponse<Course>> {
        const token = await this.getToken()
        const response = await fetchWithRefresh(`${API_URL}/api/courses`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(course),
        })
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("token")
                window.location.href = "/login"
            }
            const error = await response.json()
            throw new Error(error.message || "Failed to create course")
        }
        return response.json()
    }

    async getCourses(): Promise<ApiResponse<Course[]>> {
        const token = await this.getToken()
        const response = await fetchWithRefresh(`${API_URL}/api/courses/all`, {
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
            throw new Error(error.message || "Failed to fetch courses")
        }
        return response.json()
    }
}
