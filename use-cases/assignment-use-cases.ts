

import HttpAssignmentRepository from "@/repositories/assignment-repository"
import { AssignmentInput, Assignment } from "@/types/assignment"
interface ApiResponse<T> {
    success: boolean
    data: T
}

export default class AssignmentUseCases {
    private repository: HttpAssignmentRepository

    constructor() {
        this.repository = new HttpAssignmentRepository()
    }

    async generateAssignmentContent(
        assignmentInput: AssignmentInput
    ): Promise<{ data: Partial<Assignment> }> {
        return this.repository.generateAssignmentContent(assignmentInput)
    }

    async createAssignment(
        assignmentInput: AssignmentInput
    ): Promise<{ data: Assignment }> {
        return this.repository.createAssignment(assignmentInput)
    }
    async getAssignments(
        
    ): Promise<ApiResponse<Assignment[]>> {
        return this.repository.getAssignments()
    }
}
