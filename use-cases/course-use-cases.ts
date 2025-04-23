import { Course, CourseInput } from "@/types/course"
import { CourseRepository } from "@/repositories/course-repository"

interface ApiResponse<T> {
    success: boolean
    data: T
}

export class CourseUseCases {
    constructor(private courseRepository: CourseRepository) {}

    async createCourse(course: CourseInput): Promise<ApiResponse<Course>> {
        return this.courseRepository.createCourse(course)
    }

    async getCourses(): Promise<ApiResponse<Course[]>> {
        return this.courseRepository.getCourses()
    }
}
