
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { StructuredOutputParser } from "@langchain/core/output_parsers"
import { z } from "zod"
import { Syllabus } from "@/types/syllabus"

// Enhanced mock LLM for syllabus generation
async function mockLLMCall(
    
    prompt: string,
    courseDetails: any,
    fileContent?: string
): Promise<any> {
    console.log('mock is called and itis working');
    
    // Simulate API latency (1-3 seconds)
    const latency = Math.random() * 2000 + 1000
    await new Promise((resolve) => setTimeout(resolve, latency))

    // Determine response type (normal, off-topic, incomplete, incorrect)
    const responseType = Math.random()
    const isOffTopic = responseType < 0.1 // 10% chance
    const isIncomplete = responseType >= 0.1 && responseType < 0.2 // 10% chance
    const isIncorrect = responseType >= 0.2 && responseType < 0.3 // 10% chance

    // Base syllabus
    let syllabus: Syllabus = {
        courseTitle: courseDetails.name,
        instructor: prompt.includes("instructor")
            ? "Dr. " + courseDetails.name.split(" ")[0]
            : "Professor Mock",
        term: "Fall 2025",
        courseDescription: courseDetails.description,
        learningObjectives: [
            `Master key concepts in ${courseDetails.subject}`,
            `Apply ${courseDetails.subject} to real-world problems`,
            "Develop critical thinking skills",
        ],
        requiredMaterials: [
            {
                title: `${courseDetails.subject} Textbook`,
                author: "Author Name",
                publisher: "Academic Press",
                year: "2023",
                required: true,
            },
        ],
        gradingPolicy: {
            assignments: { percentage: 40, description: "Weekly assignments" },
            exams: { percentage: 50, description: "Midterm and final exams" },
            participation: {
                percentage: 10,
                description: "Class participation",
            },
        },
        weeklySchedule: Array.from({ length: 12 }, (_, i) => ({
            week: i + 1,
            topic: `Week ${i + 1}: ${courseDetails.subject} Topic ${i + 1}`,
            readings: `Chapter ${i + 1}`,
            assignments: i % 4 === 0 ? "Project Milestone" : "Homework",
        })),
        policies: {
            attendance: "Attendance is mandatory.",
            lateWork: "Late submissions incur a 10% penalty per day.",
        },
    }

    // Incorporate file content (mock processing)
    if (fileContent) {
        syllabus.courseDescription += ` (Based on uploaded content: ${fileContent.slice(
            0,
            50
        )}...)`
        syllabus.requiredMaterials.push({
            title: "Uploaded Resource",
            author: "N/A",
            publisher: "N/A",
            year: "2025",
            required: false,
        })
    }

    // Simulate edge cases
    if (isOffTopic) {
        syllabus.courseTitle = "Unrelated Topic"
        syllabus.courseDescription =
            "This syllabus is about an unrelated subject."
        syllabus.learningObjectives = ["Learn unrelated concepts"]
    }
    if (isIncomplete) {
        syllabus.gradingPolicy = undefined as any // Workaround to satisfy TypeScript
        syllabus.learningObjectives = []
    }
    if (isIncorrect) {
        syllabus.gradingPolicy = {
            assignments: { percentage: 50, description: "Assignments" },
            exams: { percentage: 60, description: "Exams" }, // Sums to 110%
        }
    }

    // Basic relevance check (standout feature: AI relevance filter)
    const isRelevant =
        prompt.toLowerCase().includes(courseDetails.subject.toLowerCase()) ||
        courseDetails.description
            .toLowerCase()
            .includes(courseDetails.subject.toLowerCase())
    if (!isRelevant && !isOffTopic) {
        throw new Error("Prompt is not relevant to the course subject.")
    }

    return syllabus
}

const syllabusSchema = z.object({
    courseTitle: z.string(),
    instructor: z.string(),
    term: z.string(),
    courseDescription: z.string(),
    learningObjectives: z.array(z.string()).min(1),
    requiredMaterials: z.array(
        z.object({
            title: z.string(),
            author: z.string(),
            publisher: z.string(),
            year: z.string(),
            required: z.boolean(),
        })
    ),
    gradingPolicy: z.record(
        z.object({
            percentage: z.number().min(0).max(100),
            description: z.string(),
        })
    ),
    weeklySchedule: z
        .array(
            z.object({
                week: z.number().min(1),
                topic: z.string(),
                readings: z.string(),
                assignments: z.string(),
            })
        )
        .min(1),
    policies: z.record(z.string()),
})

export class SyllabusGenerationUseCase {
    async generateSyllabus(
        prompt: string,
        courseDetails: any,
        fileContent?: string
    ): Promise<Syllabus> {
        try {
            // Define prompts (used for structure, even with mock)
            const generationPrompt = ChatPromptTemplate.fromMessages([
                [
                    "system",
                    "Generate a detailed course syllabus in JSON format.",
                ],
                [
                    "user",
                    "Course: {courseName}\nSubject: {subject}\nGrade Level: {gradeLevel}\nDescription: {description}\nPrompt: {prompt}\nFile Content: {fileContent}",
                ],
            ])

            const validationPrompt = ChatPromptTemplate.fromMessages([
                [
                    "system",
                    'Validate the syllabus. Return { isValid: boolean, errors: string[] }. Relevance: Aligns with subject "{subject}". Completeness: All fields present. Correctness: Grading sums to 100%.',
                ],
                ["user", "Syllabus: {syllabus}\nSubject: {subject}"],
            ])

            const formattingPrompt = ChatPromptTemplate.fromMessages([
                ["system", "Format the syllabus to match the JSON schema."],
                ["user", "Syllabus: {syllabus}"],
            ])

            // Output parsers
            const syllabusParser =
                StructuredOutputParser.fromZodSchema(syllabusSchema)
            const validationParser = StructuredOutputParser.fromZodSchema(
                z.object({
                    isValid: z.boolean(),
                    errors: z.array(z.string()),
                })
            )

            // Mock chain (simulates LangChain's RunnableSequence)
            const fullChain = RunnableSequence.from([
                async () => {
                    const draft = await mockLLMCall(
                        prompt,
                        courseDetails,
                        fileContent
                    )
                    return { draft, subject: courseDetails.subject }
                },
                async ({ draft, subject }) => {
                    // Mock validation
                    const errors: string[] = []
                    if (!draft.learningObjectives?.length) {
                        errors.push("Missing learning objectives")
                    }
                    if (!draft.gradingPolicy) {
                        errors.push("Missing grading policy")
                    } else {
                        const totalPercentage = Object.values(
                            draft.gradingPolicy
                        ).reduce(
                            (sum: number, item: any) => sum + item.percentage,
                            0
                        )
                        if (totalPercentage !== 100) {
                            errors.push(
                                `Grading percentages sum to ${totalPercentage}% (must be 100%)`
                            )
                        }
                    }
                    if (draft.courseTitle.toLowerCase().includes("unrelated")) {
                        errors.push("Syllabus is off-topic")
                    }
                    if (errors.length) {
                        throw new Error(
                            `Validation failed: ${errors.join(", ")}`
                        )
                    }
                    return draft
                },
                async (draft) => {
                    // Mock formatting (ensure schema compliance)
                    return syllabusParser.parse(JSON.stringify(draft))
                },
            ])

            return await fullChain.invoke({})
        } catch (error: any) {
            throw new Error(`Syllabus generation failed: ${error.message}`)
        }
    }
}
