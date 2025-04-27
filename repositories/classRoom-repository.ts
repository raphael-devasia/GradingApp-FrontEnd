import { Classroom } from "@/types/classRoom"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"

interface ApiResponse<T> {
    success: boolean
    data: T
}

export interface ClassRoomRepository {
    getClassRooms(): Promise<ApiResponse<Classroom[]>>
    addStudent(
        classroomId?: string,
        selectedClass: string,
        name: string,
        email: string
    ): Promise<ApiResponse<{ id: string; name: string; email: string }>>
    addCoTeacher(
        classroomId?: string,
        selectedClass: string | undefined,
        name: string,
        email: string
    ): Promise<ApiResponse<{ id: string; name: string; email: string }>>
    getStudents(classroomId?: string): Promise<
        ApiResponse<
            {
                id: string
                name: string
                email: string
                classroomIds: string[]
                submissions: number
                lastActive: string
            }[]
        >
    >
    getCoTeachers(classroomId?: string): Promise<
        ApiResponse<
            {
                id: string
                name: string
                email: string
                role: string
                status: string
                classroomIds: string[]
            }[]
        >
    >
}

export class HttpClassRoomRepository implements ClassRoomRepository {
    private async getToken(): Promise<string> {
        const token = localStorage.getItem("token")
        if (!token) {
            throw new Error("No authentication token found")
        }
        return token
    }

    private async getClassroomId(): Promise<string | undefined> {
        return localStorage.getItem("classroomId") || undefined
    }

    async getClassRooms(): Promise<ApiResponse<Classroom[]>> {
        const token = await this.getToken()
        const response = await fetch(`${API_URL}/api/classrooms/all`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("token")
                localStorage.removeItem("classroomId") // Clear classroomId on logout
                window.location.href = "/login"
            }
            const error = await response.json()
            throw new Error(error.message || "Failed to fetch classRooms")
        }
        const result: ApiResponse<Classroom[]> = await response.json()
        // Save the first classroom ID to localStorage if available
        if (result.success && result.data.length > 0) {
            localStorage.setItem("classroomId", result.data[0].id)
        }
        return result
    }

    async addStudent(
        classroomId: string,
        name: string,
        email: string
    ): Promise<ApiResponse<{ id: string; name: string; email: string }>> {
        const token = await this.getToken()
        const storedClassroomId = await this.getClassroomId()
        // Use provided classroomId or fall back to stored one
        const effectiveClassroomId = classroomId || storedClassroomId
        if (!effectiveClassroomId) {
            throw new Error("No classroom ID provided or stored")
        }
        const response = await fetch(`${API_URL}/api/classrooms/students`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                classroomId: effectiveClassroomId,
                name,
                email,
            }),
        })
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("token")
                localStorage.removeItem("classroomId")
                window.location.href = "/login"
            }
            const error = await response.json()
            throw new Error(error.message || "Failed to add student")
        }
        return response.json()
    }

    async addCoTeacher(
        classroomId: string | undefined,
        name: string,
        email: string
    ): Promise<ApiResponse<{ id: string; name: string; email: string }>> {
        const token = await this.getToken()
        // Use provided classroomId or fall back to stored one (if provided is not explicitly undefined)
        const storedClassroomId = await this.getClassroomId()
        const effectiveClassroomId =
            classroomId !== undefined ? classroomId : storedClassroomId
        const response = await fetch(`${API_URL}/api/classrooms/co-teachers`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                classroomId: effectiveClassroomId,
                name,
                email,
            }),
        })
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("token")
                localStorage.removeItem("classroomId")
                window.location.href = "/login"
            }
            const error = await response.json()
            throw new Error(error.message || "Failed to add co-teacher")
        }
        return response.json()
    }

    async getStudents(classroomId?: string): Promise<
        ApiResponse<
            {
                id: string
                name: string
                email: string
                classroomIds: string[]
                submissions: number
                lastActive: string
            }[]
        >
    > {
        const token = await this.getToken()
        // Use provided classroomId or fall back to stored one
        const storedClassroomId = await this.getClassroomId()
        const effectiveClassroomId = classroomId || storedClassroomId
        const url = effectiveClassroomId
            ? `${API_URL}/api/classrooms/students?classroomId=${effectiveClassroomId}`
            : `${API_URL}/api/classrooms/students`
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("token")
                localStorage.removeItem("classroomId")
                window.location.href = "/login"
            }
            const error = await response.json()
            throw new Error(error.message || "Failed to fetch students")
        }
        return response.json()
    }

    async getCoTeachers(classroomId?: string): Promise<
        ApiResponse<
            {
                id: string
                name: string
                email: string
                role: string
                status: string
                classroomIds: string[]
            }[]
        >
    > {
        const token = await this.getToken()
        // Use provided classroomId or fall back to stored one
        const storedClassroomId = await this.getClassroomId()
        const effectiveClassroomId = classroomId || storedClassroomId
        const url = effectiveClassroomId
            ? `${API_URL}/api/classrooms/co-teachers?classroomId=${effectiveClassroomId}`
            : `${API_URL}/api/classrooms/co-teachers`
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("token")
                localStorage.removeItem("classroomId")
                window.location.href = "/login"
            }
            const error = await response.json()
            throw new Error(error.message || "Failed to fetch co-teachers")
        }
        return response.json()
    }
}
