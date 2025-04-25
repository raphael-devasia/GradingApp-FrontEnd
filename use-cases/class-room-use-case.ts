import { ClassRoomRepository } from "@/repositories/classRoom-repository"
import { Classroom } from "@/types/classRoom"

interface ApiResponse<T> {
    success: boolean
    data: T
}

export class ClassRoomUseCases {
    constructor(private classRoomRepository: ClassRoomRepository) {}

    async getClassRooms(): Promise<ApiResponse<Classroom[]>> {
        return this.classRoomRepository.getClassRooms()
    }

    async addStudent(
        classroomId: string,
        name: string,
        email: string
    ): Promise<ApiResponse<{ id: string; name: string; email: string }>> {
        return this.classRoomRepository.addStudent(classroomId, name, email)
    }

    async addCoTeacher(
        classroomId: string | undefined,
        name: string,
        email: string
    ): Promise<ApiResponse<{ id: string; name: string; email: string }>> {
        return this.classRoomRepository.addCoTeacher(classroomId, name, email)
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
        return this.classRoomRepository.getStudents(classroomId)
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
        return this.classRoomRepository.getCoTeachers(classroomId)
    }
}
