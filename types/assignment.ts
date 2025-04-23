export interface Assignment {
    id: string
    title: string
    courseId: string
    courseName?: string
    type: string
    dueDate: string
    description: string
    learningObjectives: string
    instructions?: string
    rubric?: string
    questions?: string
    answerKey?: string
    checklist?: string
    participationCriteria?: string
    peerEvaluation?: string
    fileContent?: string
    status?: "Active" | "Draft" | "Archived"
    submissionCount?: number
    userId: string
    createdAt: string
    updatedAt: string
}

export interface AssignmentInput {
    title: string
    courseId: string
    type: string
    dueDate: string
    description: string
    learningObjectives: string
    instructions?: string
    rubric?: string
    questions?: string
    answerKey?: string
    checklist?: string
    participationCriteria?: string
    peerEvaluation?: string
    prompt?: string
    fileContent?: string
}
