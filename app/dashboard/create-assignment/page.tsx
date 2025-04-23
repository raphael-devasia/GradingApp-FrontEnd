"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Download,
    Loader2,
    Save,
    Mail,
    Edit,
    Copy,
    Check,
    FileText,
    ListChecks,
    MessageSquare,
    FileQuestion,
    Presentation,
    Users,
    ArrowRight,
    ChevronRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { PDFPreviewDialog } from "@/components/pdf-preview-dialog"
import { EmailPreviewDialog } from "@/components/email-preview-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import sanitizeHtml from "sanitize-html"

import { AssignmentInput } from "@/types/assignment"
import { Course } from "@/types/course"
import AssignmentUseCases from "@/use-cases/assignment-use-cases"
import { CourseUseCases } from "@/use-cases/course-use-cases"
import { HttpCourseRepository } from "@/repositories/course-repository"

// Initialize assignmentUseCases
const courseRepository = new HttpCourseRepository()
const assignmentUseCases = new AssignmentUseCases()
const courseUseCases = new CourseUseCases(courseRepository)

// Assignment type definitions
const ASSIGNMENT_TYPES = {
    ESSAY: "essay",
    RESEARCH_PAPER: "research_paper",
    MULTIPLE_CHOICE: "multiple_choice",
    SHORT_ANSWER: "short_answer",
    PRESENTATION: "presentation",
    GROUP_PROJECT: "group_project",
    DISCUSSION: "discussion",
    LAB_REPORT: "lab_report",
    PORTFOLIO: "portfolio",
    CASE_STUDY: "case_study",
}

// Assignment type metadata
const ASSIGNMENT_TYPE_INFO = {
    [ASSIGNMENT_TYPES.ESSAY]: {
        title: "Essay",
        description: "A written composition on a particular subject",
        icon: FileText,
        outputs: ["instructions", "rubric"],
    },
    [ASSIGNMENT_TYPES.RESEARCH_PAPER]: {
        title: "Research Paper",
        description: "An in-depth analysis requiring research and citations",
        icon: FileText,
        outputs: ["instructions", "rubric"],
    },
    [ASSIGNMENT_TYPES.MULTIPLE_CHOICE]: {
        title: "Multiple Choice Quiz",
        description: "Questions with several possible answers to choose from",
        icon: FileQuestion,
        outputs: ["questions", "answer_key"],
    },
    [ASSIGNMENT_TYPES.SHORT_ANSWER]: {
        title: "Short Answer Test",
        description: "Questions requiring brief written responses",
        icon: FileQuestion,
        outputs: ["questions", "answer_key", "rubric"],
    },
    [ASSIGNMENT_TYPES.PRESENTATION]: {
        title: "Presentation",
        description: "Oral delivery of information or a project",
        icon: Presentation,
        outputs: ["instructions", "rubric"],
    },
    [ASSIGNMENT_TYPES.GROUP_PROJECT]: {
        title: "Group Project",
        description: "Collaborative work among multiple students",
        icon: Users,
        outputs: ["instructions", "rubric", "peer_evaluation"],
    },
    [ASSIGNMENT_TYPES.DISCUSSION]: {
        title: "Discussion",
        description: "Guided conversation on a specific topic",
        icon: MessageSquare,
        outputs: ["instructions", "participation_criteria"],
    },
    [ASSIGNMENT_TYPES.LAB_REPORT]: {
        title: "Lab Report",
        description: "Documentation of an experiment or investigation",
        icon: ListChecks,
        outputs: ["instructions", "rubric", "checklist"],
    },
    [ASSIGNMENT_TYPES.PORTFOLIO]: {
        title: "Portfolio",
        description: "Collection of work demonstrating skills and growth",
        icon: FileText,
        outputs: ["instructions", "rubric"],
    },
    [ASSIGNMENT_TYPES.CASE_STUDY]: {
        title: "Case Study",
        description: "Analysis of a specific instance or scenario",
        icon: FileText,
        outputs: ["instructions", "rubric"],
    },
}

export default function CreateAssignmentPage() {
    const { toast } = useToast()
    const searchParams = useSearchParams()
    const router = useRouter()

    // Step tracking
    const [currentStep, setCurrentStep] = useState<
        "type" | "details" | "generate"
    >("type")

    // Assignment type selection
    const [selectedType, setSelectedType] = useState<string>("")

    // Basic assignment info
    const [assignmentTitle, setAssignmentTitle] = useState("")
    const [selectedCourse, setSelectedCourse] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [description, setDescription] = useState("")
    const [learningObjectives, setLearningObjectives] = useState("")

    // File upload
    const [fileContent, setFileContent] = useState<string | undefined>(
        undefined
    )

    // Course fetching
    const [courses, setCourses] = useState<Course[]>([])
    const [isLoadingCourses, setIsLoadingCourses] = useState(false)
    const [courseError, setCourseError] = useState<string | null>(null)

    // Generation states
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [publishToLMS, setPublishToLMS] = useState<string[]>([])
    const [connectedLMS, setConnectedLMS] = useState<string[]>(["Canvas"])

    // Generated content
    const [generatedContent, setGeneratedContent] = useState<{
        instructions?: string
        rubric?: string
        questions?: string
        answer_key?: string
        checklist?: string
        participation_criteria?: string
        peer_evaluation?: string
    }>({})

    // Preview dialogs
    const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)
    const [emailPreviewOpen, setEmailPreviewOpen] = useState(false)

    // Copy state
    const [copied, setCopied] = useState<string | null>(null)

    // Fetch courses on mount
    useEffect(() => {
        const fetchCourses = async () => {
            setIsLoadingCourses(true)
            try {
                const response = await courseUseCases.getCourses()
                setCourses(response.data)
                
                
            } catch (error: any) {
                setCourseError("Failed to load courses")
                toast({
                    title: "Error",
                    description: "Failed to load courses. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsLoadingCourses(false)
            }
        }
        fetchCourses()
    }, [])

    // Handle query params for quick creation
    useEffect(() => {
        const type = searchParams.get("type")
        const topic = searchParams.get("topic")

        if (type && Object.values(ASSIGNMENT_TYPES).includes(type)) {
            setSelectedType(type)
            setCurrentStep("details")
        }

        if (topic) {
            setDescription(sanitizeHtml(topic))
        }
    }, [searchParams])

    // Handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            try {
                const text = await file.text()
                setFileContent(sanitizeHtml(text))
                toast({
                    title: "File Uploaded",
                    description: "File content has been uploaded successfully",
                })
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to read file content",
                    variant: "destructive",
                })
            }
        }
    }

    // Handle type selection and move to next step
    const handleTypeSelection = () => {

          
        if (!selectedType) {
            toast({
                title: "Please select an assignment type",
                description: "You must select an assignment type to continue",
                variant: "destructive",
            })
            return
        }

        setCurrentStep("details")
    }

    // Handle details submission and move to generation
    const handleDetailsSubmission = () => {
       
     
        if (!assignmentTitle) {
            toast({
                title: "Missing information",
                description: "Please enter an assignment title",
                variant: "destructive",
            })
            return
        }

        if (!selectedCourse) {
            toast({
                title: "Missing information",
                description: "Please select a course",
                variant: "destructive",
            })
            return
        }
console.log("generation started")
        setCurrentStep("generate")
        // Auto-generate content
        handleGenerateContent()
    }

    // Generate content by calling backend API
    const handleGenerateContent = async () => {
  
      
        setIsGenerating(true)

        try {
            const assignmentInput: AssignmentInput = {
                title: sanitizeHtml(assignmentTitle),
                courseId: selectedCourse,
                type: selectedType,
                dueDate,
                description: sanitizeHtml(description),
                learningObjectives: sanitizeHtml(learningObjectives),
                prompt: sanitizeHtml(
                    `Generate content for a ${
                        ASSIGNMENT_TYPE_INFO[selectedType].title
                    } assignment titled "${assignmentTitle}" for course "${
                        courses.find((c) => c.id === selectedCourse)?.name ||
                        selectedCourse
                    }". Description: ${description}. Learning Objectives: ${learningObjectives}. Include: ${ASSIGNMENT_TYPE_INFO[
                        selectedType
                    ].outputs.join(", ")}.`
                ),
                fileContent,
            }

            const response = await assignmentUseCases.generateAssignmentContent(
                assignmentInput
            )
            setGeneratedContent({
                instructions: response.data.instructions,
                rubric: response.data.rubric,
                questions: response.data.questions,
                answer_key: response.data.answerKey,
                checklist: response.data.checklist,
                participation_criteria: response.data.participationCriteria,
                peer_evaluation: response.data.peerEvaluation,
            })

            toast({
                title: "Content Generated",
                description:
                    "Your assignment content has been generated successfully",
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message.includes("Validation failed")
                    ? `Content generation failed: ${error.message}`
                    : "Failed to generate assignment content",
                variant: "destructive",
            })
        } finally {
            setIsGenerating(false)
        }
    }

    // Handle saving the assignment
    const handleSaveAssignment = async () => {
        setIsSaving(true)

        try {
            const assignmentInput: AssignmentInput = {
                title: sanitizeHtml(assignmentTitle),
                courseId: selectedCourse,
                type: selectedType,
                dueDate,
                description: sanitizeHtml(description),
                learningObjectives: sanitizeHtml(learningObjectives),
                instructions: generatedContent.instructions,
                rubric: generatedContent.rubric,
                questions: generatedContent.questions,
                answerKey: generatedContent.answer_key,
                checklist: generatedContent.checklist,
                participationCriteria: generatedContent.participation_criteria,
                peerEvaluation: generatedContent.peer_evaluation,
            }

            await assignmentUseCases.createAssignment(assignmentInput)
            toast({
                title: "Assignment Saved",
                description: "Your assignment has been saved successfully",
            })
            router.push("/dashboard/assignments")
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to save assignment",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }

    // Handle copying content to clipboard
    const handleCopyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text)
        setCopied(type)

        setTimeout(() => {
            setCopied(null)
        }, 2000)

        toast({
            title: "Copied to clipboard",
            description: `${type} has been copied to your clipboard.`,
        })
    }

    // Render the assignment type selection step
    const renderTypeSelection = () => {
        return (
            <div className="space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">
                        Create New Assessment
                    </h1>
                    <p className="text-muted-foreground">
                        Select the type of assessment you want to create
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(ASSIGNMENT_TYPE_INFO).map(
                        ([type, info]) => {
                            const Icon = info.icon
                            return (
                                <Card
                                    key={type}
                                    className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                                        selectedType === type
                                            ? "border-primary bg-primary/5"
                                            : ""
                                    }`}
                                    onClick={() => setSelectedType(type)}
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="p-2 rounded-full bg-primary/10">
                                                <Icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <CardTitle className="text-lg">
                                                {info.title}
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            {info.description}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="pt-0">
                                        <div className="flex flex-wrap gap-2">
                                            {info.outputs.map((output) => (
                                                <Badge
                                                    key={output}
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {output.replace("_", " ")}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardFooter>
                                </Card>
                            )
                        }
                    )}
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={handleTypeSelection}
                        disabled={!selectedType}
                    >
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    // Render the assignment details step
    const renderDetailsForm = () => {
        const typeInfo = ASSIGNMENT_TYPE_INFO[selectedType]

        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        onClick={() => setCurrentStep("type")}
                        className="p-0 h-auto"
                    >
                        <ChevronRight className="h-4 w-4 rotate-180" />
                        Back
                    </Button>
                    <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                    <span className="text-muted-foreground">
                        {typeInfo?.title || "Assignment"} Details
                    </span>
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">
                        Create {typeInfo?.title || "Assignment"}
                    </h1>
                    <p className="text-muted-foreground">
                        Enter the details for your{" "}
                        {typeInfo?.title.toLowerCase() || "assignment"}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                            Enter the essential details about your{" "}
                            {typeInfo?.title.toLowerCase() || "assignment"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="assignment-title">Title</Label>
                            <Input
                                id="assignment-title"
                                placeholder={`${
                                    typeInfo?.title || "Assignment"
                                } Title`}
                                value={assignmentTitle}
                                onChange={(e) =>
                                    setAssignmentTitle(e.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="course">Course</Label>
                            {isLoadingCourses ? (
                                <div className="flex items-center space-x-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Loading courses...</span>
                                </div>
                            ) : courseError ? (
                                <div className="text-destructive">
                                    {courseError}
                                </div>
                            ) : (
                                <Select
                                    value={selectedCourse}
                                    onValueChange={setSelectedCourse}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem
                                                key={course.id}
                                                value={course.id}
                                            >
                                                {course.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="due-date">Due Date</Label>
                            <Input
                                id="due-date"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder={`Brief description of what students will do in this ${
                                    typeInfo?.title.toLowerCase() ||
                                    "assignment"
                                }...`}
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="learning-objectives">
                                Learning Objectives
                            </Label>
                            <Textarea
                                id="learning-objectives"
                                placeholder="List the learning objectives this assessment addresses..."
                                rows={3}
                                value={learningObjectives}
                                onChange={(e) =>
                                    setLearningObjectives(e.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file-upload">
                                Upload File (Optional)
                            </Label>
                            <Input
                                id="file-upload"
                                type="file"
                                onChange={handleFileUpload}
                                accept=".txt,.pdf"
                            />
                        </div>

                        {/* Type-specific fields */}
                        {selectedType === ASSIGNMENT_TYPES.MULTIPLE_CHOICE && (
                            <div className="space-y-2">
                                <Label>Quiz Settings</Label>
                                <div className="rounded-md border p-4 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="num-questions">
                                            Number of Questions
                                        </Label>
                                        <Input
                                            id="num-questions"
                                            type="number"
                                            defaultValue="10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="time-limit">
                                            Time Limit (minutes)
                                        </Label>
                                        <Input
                                            id="time-limit"
                                            type="number"
                                            defaultValue="30"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="randomize" />
                                        <Label
                                            htmlFor="randomize"
                                            className="text-sm font-normal"
                                        >
                                            Randomize question order
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="show-answers" />
                                        <Label
                                            htmlFor="show-answers"
                                            className="text-sm font-normal"
                                        >
                                            Show correct answers after
                                            submission
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedType === ASSIGNMENT_TYPES.GROUP_PROJECT && (
                            <div className="space-y-2">
                                <Label>Group Settings</Label>
                                <div className="rounded-md border p-4 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="group-size">
                                            Group Size
                                        </Label>
                                        <Input
                                            id="group-size"
                                            type="number"
                                            defaultValue="4"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="group-formation">
                                            Group Formation
                                        </Label>
                                        <RadioGroup defaultValue="instructor">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="instructor"
                                                    id="instructor"
                                                />
                                                <Label
                                                    htmlFor="instructor"
                                                    className="text-sm font-normal"
                                                >
                                                    Instructor-assigned groups
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="student"
                                                    id="student"
                                                />
                                                <Label
                                                    htmlFor="student"
                                                    className="text-sm font-normal"
                                                >
                                                    Student-selected groups
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="random"
                                                    id="random"
                                                />
                                                <Label
                                                    htmlFor="random"
                                                    className="text-sm font-normal"
                                                >
                                                    Randomly assigned groups
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="peer-eval"
                                            defaultChecked
                                        />
                                        <Label
                                            htmlFor="peer-eval"
                                            className="text-sm font-normal"
                                        >
                                            Include peer evaluation component
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* LMS Integration */}
                        <div className="space-y-2">
                            <Label>LMS Integration</Label>
                            <div className="space-y-3 rounded-md border p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="canvas"
                                            checked={publishToLMS.includes(
                                                "Canvas"
                                            )}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setPublishToLMS([
                                                        ...publishToLMS,
                                                        "Canvas",
                                                    ])
                                                } else {
                                                    setPublishToLMS(
                                                        publishToLMS.filter(
                                                            (lms) =>
                                                                lms !== "Canvas"
                                                        )
                                                    )
                                                }
                                            }}
                                        />
                                        <Label
                                            htmlFor="canvas"
                                            className="text-sm font-normal"
                                        >
                                            Publish to Canvas
                                        </Label>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200"
                                    >
                                        Connected
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="google-classroom"
                                            checked={publishToLMS.includes(
                                                "Google Classroom"
                                            )}
                                            onCheckedChange={(checked) => {
                                                if (
                                                    connectedLMS.includes(
                                                        "Google Classroom"
                                                    )
                                                ) {
                                                    if (checked) {
                                                        setPublishToLMS([
                                                            ...publishToLMS,
                                                            "Google Classroom",
                                                        ])
                                                    } else {
                                                        setPublishToLMS(
                                                            publishToLMS.filter(
                                                                (lms) =>
                                                                    lms !==
                                                                    "Google Classroom"
                                                            )
                                                        )
                                                    }
                                                } else {
                                                    toast({
                                                        title: "Google Classroom Not Connected",
                                                        description:
                                                            "Please connect to Google Classroom first",
                                                    })
                                                }
                                            }}
                                            disabled={
                                                !connectedLMS.includes(
                                                    "Google Classroom"
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor="google-classroom"
                                            className={`text-sm font-normal ${
                                                !connectedLMS.includes(
                                                    "Google Classroom"
                                                )
                                                    ? "text-muted-foreground"
                                                    : ""
                                            }`}
                                        >
                                            Publish to Google Classroom
                                        </Label>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() =>
                                            (window.location.href =
                                                "/dashboard/integrations")
                                        }
                                    >
                                        Connect
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            onClick={handleDetailsSubmission}
                            disabled={isLoadingCourses || !!courseError}
                        >
                            Continue to Generation{" "}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    // Render the content generation and review step
    const renderGenerationStep = () => {
        const typeInfo = ASSIGNMENT_TYPE_INFO[selectedType]
        const outputs = typeInfo?.outputs || []

        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        onClick={() => setCurrentStep("details")}
                        className="p-0 h-auto"
                    >
                        <ChevronRight className="h-4 w-4 rotate-180" />
                        Back
                    </Button>
                    <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                    <span className="text-muted-foreground">
                        Generate Content
                    </span>
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">{assignmentTitle}</h1>
                    <p className="text-muted-foreground">
                        {courses.find((c) => c.id === selectedCourse)?.name ||
                            selectedCourse}
                    </p>
                </div>

                {isGenerating ? (
                    <Card className="flex items-center justify-center py-12">
                        <CardContent className="text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                            <h3 className="text-xl font-medium">
                                Generating Content
                            </h3>
                            <p className="text-muted-foreground mt-2">
                                Our AI is creating your{" "}
                                {typeInfo?.title.toLowerCase() || "assignment"}{" "}
                                content...
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <Tabs defaultValue={outputs[0]} className="space-y-4">
                            <TabsList>
                                {outputs.includes("instructions") && (
                                    <TabsTrigger value="instructions">
                                        Instructions
                                    </TabsTrigger>
                                )}
                                {outputs.includes("rubric") && (
                                    <TabsTrigger value="rubric">
                                        Rubric
                                    </TabsTrigger>
                                )}
                                {outputs.includes("questions") && (
                                    <TabsTrigger value="questions">
                                        Questions
                                    </TabsTrigger>
                                )}
                                {outputs.includes("answer_key") && (
                                    <TabsTrigger value="answer_key">
                                        Answer Key
                                    </TabsTrigger>
                                )}
                                {outputs.includes("checklist") && (
                                    <TabsTrigger value="checklist">
                                        Checklist
                                    </TabsTrigger>
                                )}
                                {outputs.includes("participation_criteria") && (
                                    <TabsTrigger value="participation_criteria">
                                        Participation Criteria
                                    </TabsTrigger>
                                )}
                                {outputs.includes("peer_evaluation") && (
                                    <TabsTrigger value="peer_evaluation">
                                        Peer Evaluation
                                    </TabsTrigger>
                                )}
                            </TabsList>

                            {outputs.includes("instructions") && (
                                <TabsContent
                                    value="instructions"
                                    className="space-y-4"
                                >
                                    <div className="flex justify-end space-x-2 mb-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleCopyToClipboard(
                                                    generatedContent.instructions ||
                                                        "",
                                                    "Instructions"
                                                )
                                            }
                                            className="h-8"
                                        >
                                            {copied === "Instructions" ? (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8"
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={
                                            generatedContent.instructions || ""
                                        }
                                        onChange={(e) =>
                                            setGeneratedContent({
                                                ...generatedContent,
                                                instructions: e.target.value,
                                            })
                                        }
                                        className="min-h-[500px] font-mono"
                                    />
                                </TabsContent>
                            )}

                            {outputs.includes("rubric") && (
                                <TabsContent
                                    value="rubric"
                                    className="space-y-4"
                                >
                                    <div className="flex justify-end space-x-2 mb-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleCopyToClipboard(
                                                    generatedContent.rubric ||
                                                        "",
                                                    "Rubric"
                                                )
                                            }
                                            className="h-8"
                                        >
                                            {copied === "Rubric" ? (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8"
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={generatedContent.rubric || ""}
                                        onChange={(e) =>
                                            setGeneratedContent({
                                                ...generatedContent,
                                                rubric: e.target.value,
                                            })
                                        }
                                        className="min-h-[500px] font-mono"
                                    />
                                </TabsContent>
                            )}

                            {outputs.includes("questions") && (
                                <TabsContent
                                    value="questions"
                                    className="space-y-4"
                                >
                                    <div className="flex justify-end space-x-2 mb-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleCopyToClipboard(
                                                    generatedContent.questions ||
                                                        "",
                                                    "Questions"
                                                )
                                            }
                                            className="h-8"
                                        >
                                            {copied === "Questions" ? (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8"
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={generatedContent.questions || ""}
                                        onChange={(e) =>
                                            setGeneratedContent({
                                                ...generatedContent,
                                                questions: e.target.value,
                                            })
                                        }
                                        className="min-h-[500px] font-mono"
                                    />
                                </TabsContent>
                            )}

                            {outputs.includes("answer_key") && (
                                <TabsContent
                                    value="answer_key"
                                    className="space-y-4"
                                >
                                    <div className="flex justify-end space-x-2 mb-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleCopyToClipboard(
                                                    generatedContent.answer_key ||
                                                        "",
                                                    "Answer Key"
                                                )
                                            }
                                            className="h-8"
                                        >
                                            {copied === "Answer Key" ? (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8"
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={
                                            generatedContent.answer_key || ""
                                        }
                                        onChange={(e) =>
                                            setGeneratedContent({
                                                ...generatedContent,
                                                answer_key: e.target.value,
                                            })
                                        }
                                        className="min-h-[500px] font-mono"
                                    />
                                </TabsContent>
                            )}

                            {outputs.includes("checklist") && (
                                <TabsContent
                                    value="checklist"
                                    className="space-y-4"
                                >
                                    <div className="flex justify-end space-x-2 mb-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleCopyToClipboard(
                                                    generatedContent.checklist ||
                                                        "",
                                                    "Checklist"
                                                )
                                            }
                                            className="h-8"
                                        >
                                            {copied === "Checklist" ? (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8"
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={generatedContent.checklist || ""}
                                        onChange={(e) =>
                                            setGeneratedContent({
                                                ...generatedContent,
                                                checklist: e.target.value,
                                            })
                                        }
                                        className="min-h-[500px] font-mono"
                                    />
                                </TabsContent>
                            )}

                            {outputs.includes("participation_criteria") && (
                                <TabsContent
                                    value="participation_criteria"
                                    className="space-y-4"
                                >
                                    <div className="flex justify-end space-x-2 mb-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleCopyToClipboard(
                                                    generatedContent.participation_criteria ||
                                                        "",
                                                    "Participation Criteria"
                                                )
                                            }
                                            className="h-8"
                                        >
                                            {copied ===
                                            "Participation Criteria" ? (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8"
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={
                                            generatedContent.participation_criteria ||
                                            ""
                                        }
                                        onChange={(e) =>
                                            setGeneratedContent({
                                                ...generatedContent,
                                                participation_criteria:
                                                    e.target.value,
                                            })
                                        }
                                        className="min-h-[500px] font-mono"
                                    />
                                </TabsContent>
                            )}

                            {outputs.includes("peer_evaluation") && (
                                <TabsContent
                                    value="peer_evaluation"
                                    className="space-y-4"
                                >
                                    <div className="flex justify-end space-x-2 mb-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleCopyToClipboard(
                                                    generatedContent.peer_evaluation ||
                                                        "",
                                                    "Peer Evaluation"
                                                )
                                            }
                                            className="h-8"
                                        >
                                            {copied === "Peer Evaluation" ? (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8"
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={
                                            generatedContent.peer_evaluation ||
                                            ""
                                        }
                                        onChange={(e) =>
                                            setGeneratedContent({
                                                ...generatedContent,
                                                peer_evaluation: e.target.value,
                                            })
                                        }
                                        className="min-h-[500px] font-mono"
                                    />
                                </TabsContent>
                            )}
                        </Tabs>

                        <div className="flex justify-between">
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setPdfPreviewOpen(true)}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setEmailPreviewOpen(true)}
                                >
                                    <Mail className="mr-2 h-4 w-4" />
                                    Email to Students
                                </Button>
                            </div>
                            <Button
                                onClick={handleSaveAssignment}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save {typeInfo?.title || "Assignment"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            {currentStep === "type" && renderTypeSelection()}
            {currentStep === "details" && renderDetailsForm()}
            {currentStep === "generate" && renderGenerationStep()}

            {/* PDF Preview Dialog */}
            <PDFPreviewDialog
                open={pdfPreviewOpen}
                onOpenChange={setPdfPreviewOpen}
                assignment={generatedContent.instructions || ""}
                rubric={generatedContent.rubric || ""}
                title={assignmentTitle}
                course={
                    courses.find((c) => c.id === selectedCourse)?.name ||
                    selectedCourse
                }
            />

            {/* Email Preview Dialog */}
            <EmailPreviewDialog
                open={emailPreviewOpen}
                onOpenChange={setEmailPreviewOpen}
                assignment={generatedContent.instructions || ""}
                rubric={generatedContent.rubric || ""}
                title={assignmentTitle}
                course={
                    courses.find((c) => c.id === selectedCourse)?.name ||
                    selectedCourse
                }
            />
        </div>
    )
}
