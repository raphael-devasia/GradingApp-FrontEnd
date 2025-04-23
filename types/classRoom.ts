export interface Classroom {
    id: string
    name: string
    code: string
    teacherId: string
    coTeacherIds: string[]
    studentIds: string[]
}

export interface CoTeacher {
    id: string
    name: string
    email: string
    role: "teacher"
    status: "active" | "pending" | "inactive"
    classroomIds: string[]
}

export interface CoTeachersListProps {
    classrooms: Classroom[]
}
