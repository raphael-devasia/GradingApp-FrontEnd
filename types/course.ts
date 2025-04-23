import { Syllabus } from "./syllabus"

export interface Course {
    id: string
    name: string
    description: string
    subject: string
    gradeLevel: string
    students: number
    assignments: number
    syllabus?: Syllabus
}

export interface CourseInput {
    name: string
    description: string
    subject: string
    gradeLevel: string
    syllabus?: Syllabus
}
