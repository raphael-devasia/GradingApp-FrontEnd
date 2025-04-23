export interface Syllabus {
    courseTitle: string
    instructor: string
    term: string
    courseDescription: string
    learningObjectives: string[]
    requiredMaterials: {
        title: string
        author: string
        publisher: string
        year: string
        required: boolean
    }[]
    gradingPolicy: {
        [key: string]: {
            percentage: number
            description: string
        }
    }
    weeklySchedule: {
        week: number
        topic: string
        readings: string
        assignments: string
    }[]
    policies: {
        [key: string]: string
    }
}
