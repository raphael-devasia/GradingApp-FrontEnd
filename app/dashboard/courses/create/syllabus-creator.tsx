"use client"

import { useState, useEffect } from "react"
import {
    Loader2,
    Sparkles,
    RefreshCw,
    Download,
    Check,
    Edit2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { SyllabusPreview } from "./syllabus-preview"
import { Syllabus } from "@/types/syllabus"
import { toast } from "@/components/ui/use-toast"

interface SyllabusCreatorProps {
    courseDetails: {
        name: string
        description: string
        subject: string
        gradeLevel: string
    }
    onComplete: (syllabus: Syllabus) => Promise<void>
    isCreating: boolean
}

const SYLLABUS_TYPES = {
    UNDERGRADUATE: "undergraduate",
    GRADUATE: "graduate",
    HIGH_SCHOOL: "high_school",
    MIDDLE_SCHOOL: "middle_school",
    ONLINE: "online",
    BLENDED: "blended",
    PROFESSIONAL: "professional",
    SHORT_COURSE: "short_course",
    SEMINAR: "seminar",
    WORKSHOP: "workshop",
    CERTIFICATION: "certification",
} as const

type SyllabusType = (typeof SYLLABUS_TYPES)[keyof typeof SYLLABUS_TYPES]

export function SyllabusCreator({
    courseDetails,
    onComplete,
    isCreating,
}: SyllabusCreatorProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [activeTab, setActiveTab] = useState<"generate" | "edit" | "preview">(
        "generate"
    )
    const [syllabusData, setSyllabusData] = useState<Syllabus | null>(null)
    const [prompt, setPrompt] = useState("")
    const [additionalInfo, setAdditionalInfo] = useState("")
    const [syllabusType, setSyllabusType] =
        useState<SyllabusType>("middle_school")

    // Generate default prompt based on course details
    useEffect(() => {
        const defaultPrompt = `Create a comprehensive syllabus in JSON format for a ${courseDetails.gradeLevel} level ${courseDetails.subject} course titled "${courseDetails.name}". The course is described as: ${courseDetails.description}. Include course title, instructor, term, course description, subject, gradeLevel, learning objectives, required materials, grading policy, weekly schedule, and course policies.`
        setPrompt(defaultPrompt)
    }, [courseDetails])

    // Function to generate syllabus using AI via API
    const generateSyllabus = async () => {
        const token = localStorage.getItem("token")
        if (!token) {
            toast({
                title: "Authentication Required",
                description: "Please sign in to generate a syllabus.",
                variant: "destructive",
            })
            return
        }

        if (!prompt.trim()) {
            toast({
                title: "Error",
                description: "Prompt is required.",
                variant: "destructive",
            })
            return
        }

        setIsGenerating(true)
        console.log("Generation started")

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/syllabus/generate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        prompt: `${prompt}${
                            additionalInfo
                                ? `\n\nAdditional context: ${additionalInfo}`
                                : ""
                        }`,
                        syllabusType,
                    }),
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(
                    errorData.message || "Failed to generate syllabus"
                )
            }

            const { data: generatedSyllabus }: { data: Syllabus } =
                await response.json()
            setSyllabusData(generatedSyllabus)
            setActiveTab("edit")
            toast({
                title: "Syllabus Generated",
                description:
                    "The syllabus has been successfully generated. You can now edit or preview it.",
            })
        } catch (error) {
            console.error("Error generating syllabus:", error)
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "An error occurred while generating the syllabus.",
                variant: "destructive",
            })
        } finally {
            setIsGenerating(false)
        }
    }

    // Function to handle syllabus submission
    const handleComplete = async () => {
        if (!syllabusData) return
        try {
            await onComplete(syllabusData)
            toast({
                title: "Course Created",
                description:
                    "The course and syllabus have been successfully created.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create course. Please try again.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="space-y-6">
            <Tabs
                value={activeTab}
                onValueChange={(value) =>
                    setActiveTab(value as typeof activeTab)
                }
            >
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="generate">Generate</TabsTrigger>
                    <TabsTrigger value="edit" disabled={!syllabusData}>
                        Edit
                    </TabsTrigger>
                    <TabsTrigger value="preview" disabled={!syllabusData}>
                        Preview
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="generate" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Sparkles className="mr-2 h-5 w-5 text-primary" />
                                AI-Assisted Syllabus Generation
                            </CardTitle>
                            <CardDescription>
                                Let our AI help you create a comprehensive
                                syllabus based on your course details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="syllabusType">
                                    Syllabus Type
                                </Label>
                                <select
                                    id="syllabusType"
                                    value={syllabusType}
                                    onChange={(e) =>
                                        setSyllabusType(
                                            e.target.value as SyllabusType
                                        )
                                    }
                                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    {Object.values(SYLLABUS_TYPES).map(
                                        (type) => (
                                            <option key={type} value={type}>
                                                {type.charAt(0).toUpperCase() +
                                                    type
                                                        .slice(1)
                                                        .replace(/_/g, " ")}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="prompt">
                                    Generation Prompt
                                </Label>
                                <Textarea
                                    id="prompt"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="min-h-[120px] mt-2"
                                    placeholder="Create a syllabus for..."
                                />
                                <p className="text-sm text-muted-foreground mt-2">
                                    This prompt will guide the AI in generating
                                    your syllabus. Feel free to modify it.
                                </p>
                            </div>
                            <div>
                                <Label htmlFor="additionalInfo">
                                    Additional Information (Optional)
                                </Label>
                                <Textarea
                                    id="additionalInfo"
                                    value={additionalInfo}
                                    onChange={(e) =>
                                        setAdditionalInfo(e.target.value)
                                    }
                                    className="min-h-[100px] mt-2"
                                    placeholder="Specific textbooks, grading policies, or other details you'd like to include..."
                                />
                            </div>
                            <div className="bg-muted p-4 rounded-lg">
                                <h4 className="font-medium mb-2">
                                    Course Details (from previous step)
                                </h4>
                                <ul className="space-y-1 text-sm">
                                    <li>
                                        <span className="font-medium">
                                            Course Name:
                                        </span>{" "}
                                        {courseDetails.name}
                                    </li>
                                    <li>
                                        <span className="font-medium">
                                            Subject:
                                        </span>{" "}
                                        {courseDetails.subject}
                                    </li>
                                    <li>
                                        <span className="font-medium">
                                            Grade Level:
                                        </span>{" "}
                                        {courseDetails.gradeLevel}
                                    </li>
                                    <li>
                                        <span className="font-medium">
                                            Description:
                                        </span>{" "}
                                        {courseDetails.description}
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => setActiveTab("details")}
                            >
                                Back to Details
                            </Button>
                            <Button
                                onClick={generateSyllabus}
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate Syllabus
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="edit" className="space-y-6">
                    {syllabusData && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Your Syllabus</CardTitle>
                                <CardDescription>
                                    Review and customize the AI-generated
                                    syllabus to fit your needs.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion
                                    type="multiple"
                                    defaultValue={["basic-info", "objectives"]}
                                >
                                    <AccordionItem value="basic-info">
                                        <AccordionTrigger>
                                            Basic Information
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="courseTitle">
                                                        Course Title
                                                    </Label>
                                                    <Input
                                                        id="courseTitle"
                                                        value={
                                                            syllabusData.courseTitle
                                                        }
                                                        onChange={(e) =>
                                                            setSyllabusData({
                                                                ...syllabusData,
                                                                courseTitle:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="instructor">
                                                        Instructor Name
                                                    </Label>
                                                    <Input
                                                        id="instructor"
                                                        value={
                                                            syllabusData.instructor
                                                        }
                                                        onChange={(e) =>
                                                            setSyllabusData({
                                                                ...syllabusData,
                                                                instructor:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="term">
                                                        Term
                                                    </Label>
                                                    <Input
                                                        id="term"
                                                        value={
                                                            syllabusData.term
                                                        }
                                                        onChange={(e) =>
                                                            setSyllabusData({
                                                                ...syllabusData,
                                                                term: e.target
                                                                    .value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="subject">
                                                        Subject
                                                    </Label>
                                                    <Input
                                                        id="subject"
                                                        value={
                                                            syllabusData.subject
                                                        }
                                                        onChange={(e) =>
                                                            setSyllabusData({
                                                                ...syllabusData,
                                                                subject:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="gradeLevel">
                                                        Grade Level
                                                    </Label>
                                                    <Input
                                                        id="gradeLevel"
                                                        value={
                                                            syllabusData.gradeLevel
                                                        }
                                                        onChange={(e) =>
                                                            setSyllabusData({
                                                                ...syllabusData,
                                                                gradeLevel:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="courseDescription">
                                                        Course Description
                                                    </Label>
                                                    <Textarea
                                                        id="courseDescription"
                                                        value={
                                                            syllabusData.courseDescription
                                                        }
                                                        onChange={(e) =>
                                                            setSyllabusData({
                                                                ...syllabusData,
                                                                courseDescription:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="min-h-[100px]"
                                                    />
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="objectives">
                                        <AccordionTrigger>
                                            Learning Objectives
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4">
                                                {syllabusData.learningObjectives.map(
                                                    (objective, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-start gap-2"
                                                        >
                                                            <Input
                                                                value={
                                                                    objective
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const newObjectives =
                                                                        [
                                                                            ...syllabusData.learningObjectives,
                                                                        ]
                                                                    newObjectives[
                                                                        index
                                                                    ] =
                                                                        e.target.value
                                                                    setSyllabusData(
                                                                        {
                                                                            ...syllabusData,
                                                                            learningObjectives:
                                                                                newObjectives,
                                                                        }
                                                                    )
                                                                }}
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    const newObjectives =
                                                                        syllabusData.learningObjectives.filter(
                                                                            (
                                                                                _,
                                                                                i
                                                                            ) =>
                                                                                i !==
                                                                                index
                                                                        )
                                                                    setSyllabusData(
                                                                        {
                                                                            ...syllabusData,
                                                                            learningObjectives:
                                                                                newObjectives,
                                                                        }
                                                                    )
                                                                }}
                                                            >
                                                                ✕
                                                            </Button>
                                                        </div>
                                                    )
                                                )}
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSyllabusData({
                                                            ...syllabusData,
                                                            learningObjectives:
                                                                [
                                                                    ...syllabusData.learningObjectives,
                                                                    "New learning objective",
                                                                ],
                                                        })
                                                    }}
                                                >
                                                    Add Objective
                                                </Button>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="materials">
                                        <AccordionTrigger>
                                            Required Materials
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4">
                                                {syllabusData.requiredMaterials.map(
                                                    (material, index) => (
                                                        <div
                                                            key={index}
                                                            className="border p-3 rounded-md"
                                                        >
                                                            <div className="flex justify-between items-center mb-2">
                                                                <h4 className="font-medium">
                                                                    Material{" "}
                                                                    {index + 1}
                                                                </h4>
                                                                <Badge
                                                                    variant={
                                                                        material.required
                                                                            ? "default"
                                                                            : "outline"
                                                                    }
                                                                >
                                                                    {material.required
                                                                        ? "Required"
                                                                        : "Optional"}
                                                                </Badge>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div>
                                                                    <Label
                                                                        htmlFor={`material-title-${index}`}
                                                                    >
                                                                        Title
                                                                    </Label>
                                                                    <Input
                                                                        id={`material-title-${index}`}
                                                                        value={
                                                                            material.title
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const newMaterials =
                                                                                [
                                                                                    ...syllabusData.requiredMaterials,
                                                                                ]
                                                                            newMaterials[
                                                                                index
                                                                            ] =
                                                                                {
                                                                                    ...material,
                                                                                    title: e
                                                                                        .target
                                                                                        .value,
                                                                                }
                                                                            setSyllabusData(
                                                                                {
                                                                                    ...syllabusData,
                                                                                    requiredMaterials:
                                                                                        newMaterials,
                                                                                }
                                                                            )
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label
                                                                        htmlFor={`material-author-${index}`}
                                                                    >
                                                                        Author
                                                                    </Label>
                                                                    <Input
                                                                        id={`material-author-${index}`}
                                                                        value={
                                                                            material.author
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const newMaterials =
                                                                                [
                                                                                    ...syllabusData.requiredMaterials,
                                                                                ]
                                                                            newMaterials[
                                                                                index
                                                                            ] =
                                                                                {
                                                                                    ...material,
                                                                                    author: e
                                                                                        .target
                                                                                        .value,
                                                                                }
                                                                            setSyllabusData(
                                                                                {
                                                                                    ...syllabusData,
                                                                                    requiredMaterials:
                                                                                        newMaterials,
                                                                                }
                                                                            )
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label
                                                                        htmlFor={`material-publisher-${index}`}
                                                                    >
                                                                        Publisher
                                                                    </Label>
                                                                    <Input
                                                                        id={`material-publisher-${index}`}
                                                                        value={
                                                                            material.publisher
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const newMaterials =
                                                                                [
                                                                                    ...syllabusData.requiredMaterials,
                                                                                ]
                                                                            newMaterials[
                                                                                index
                                                                            ] =
                                                                                {
                                                                                    ...material,
                                                                                    publisher:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                }
                                                                            setSyllabusData(
                                                                                {
                                                                                    ...syllabusData,
                                                                                    requiredMaterials:
                                                                                        newMaterials,
                                                                                }
                                                                            )
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label
                                                                        htmlFor={`material-year-${index}`}
                                                                    >
                                                                        Year
                                                                    </Label>
                                                                    <Input
                                                                        id={`material-year-${index}`}
                                                                        value={
                                                                            material.year
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const newMaterials =
                                                                                [
                                                                                    ...syllabusData.requiredMaterials,
                                                                                ]
                                                                            newMaterials[
                                                                                index
                                                                            ] =
                                                                                {
                                                                                    ...material,
                                                                                    year: e
                                                                                        .target
                                                                                        .value,
                                                                                }
                                                                            setSyllabusData(
                                                                                {
                                                                                    ...syllabusData,
                                                                                    requiredMaterials:
                                                                                        newMaterials,
                                                                                }
                                                                            )
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2 mt-3">
                                                                <Switch
                                                                    id={`required-${index}`}
                                                                    checked={
                                                                        material.required
                                                                    }
                                                                    onCheckedChange={(
                                                                        checked
                                                                    ) => {
                                                                        const newMaterials =
                                                                            [
                                                                                ...syllabusData.requiredMaterials,
                                                                            ]
                                                                        newMaterials[
                                                                            index
                                                                        ] = {
                                                                            ...material,
                                                                            required:
                                                                                checked,
                                                                        }
                                                                        setSyllabusData(
                                                                            {
                                                                                ...syllabusData,
                                                                                requiredMaterials:
                                                                                    newMaterials,
                                                                            }
                                                                        )
                                                                    }}
                                                                />
                                                                <Label
                                                                    htmlFor={`required-${index}`}
                                                                >
                                                                    Required
                                                                </Label>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSyllabusData({
                                                            ...syllabusData,
                                                            requiredMaterials: [
                                                                ...syllabusData.requiredMaterials,
                                                                {
                                                                    title: "New Material",
                                                                    author: "",
                                                                    publisher:
                                                                        "",
                                                                    year: "",
                                                                    required:
                                                                        true,
                                                                },
                                                            ],
                                                        })
                                                    }}
                                                >
                                                    Add Material
                                                </Button>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="grading">
                                        <AccordionTrigger>
                                            Grading Policy
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4">
                                                {Object.entries(
                                                    syllabusData.gradingPolicy
                                                ).map(([key, value]) => (
                                                    <div
                                                        key={key}
                                                        className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
                                                    >
                                                        <div>
                                                            <Label
                                                                htmlFor={`grading-${key}`}
                                                            >
                                                                {key
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                    key.slice(
                                                                        1
                                                                    )}
                                                            </Label>
                                                            <Input
                                                                id={`grading-${key}`}
                                                                value={
                                                                    value.description
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const newGradingPolicy =
                                                                        {
                                                                            ...syllabusData.gradingPolicy,
                                                                        }
                                                                    newGradingPolicy[
                                                                        key
                                                                    ] = {
                                                                        ...value,
                                                                        description:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    }
                                                                    setSyllabusData(
                                                                        {
                                                                            ...syllabusData,
                                                                            gradingPolicy:
                                                                                newGradingPolicy,
                                                                        }
                                                                    )
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label
                                                                htmlFor={`percentage-${key}`}
                                                            >
                                                                Percentage
                                                            </Label>
                                                            <div className="flex items-center">
                                                                <Input
                                                                    id={`percentage-${key}`}
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    value={
                                                                        value.percentage
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const newGradingPolicy =
                                                                            {
                                                                                ...syllabusData.gradingPolicy,
                                                                            }
                                                                        newGradingPolicy[
                                                                            key
                                                                        ] = {
                                                                            ...value,
                                                                            percentage:
                                                                                Number.parseInt(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                ),
                                                                        }
                                                                        setSyllabusData(
                                                                            {
                                                                                ...syllabusData,
                                                                                gradingPolicy:
                                                                                    newGradingPolicy,
                                                                            }
                                                                        )
                                                                    }}
                                                                />
                                                                <span className="ml-2">
                                                                    %
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                const newGradingPolicy =
                                                                    {
                                                                        ...syllabusData.gradingPolicy,
                                                                    }
                                                                delete newGradingPolicy[
                                                                    key
                                                                ]
                                                                setSyllabusData(
                                                                    {
                                                                        ...syllabusData,
                                                                        gradingPolicy:
                                                                            newGradingPolicy,
                                                                    }
                                                                )
                                                            }}
                                                        >
                                                            ✕
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        const newKey = `component${
                                                            Object.keys(
                                                                syllabusData.gradingPolicy
                                                            ).length + 1
                                                        }`
                                                        const newGradingPolicy =
                                                            {
                                                                ...syllabusData.gradingPolicy,
                                                            }
                                                        newGradingPolicy[
                                                            newKey
                                                        ] = {
                                                            percentage: 0,
                                                            description:
                                                                "New component",
                                                        }
                                                        setSyllabusData({
                                                            ...syllabusData,
                                                            gradingPolicy:
                                                                newGradingPolicy,
                                                        })
                                                    }}
                                                >
                                                    Add Grading Component
                                                </Button>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="schedule">
                                        <AccordionTrigger>
                                            Weekly Schedule
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4">
                                                {syllabusData.weeklySchedule.map(
                                                    (week, index) => (
                                                        <div
                                                            key={index}
                                                            className="border p-3 rounded-md"
                                                        >
                                                            <h4 className="font-medium mb-2">
                                                                Week {week.week}
                                                            </h4>
                                                            <div className="grid grid-cols-1 gap-3">
                                                                <div>
                                                                    <Label
                                                                        htmlFor={`week-topic-${index}`}
                                                                    >
                                                                        Topic
                                                                    </Label>
                                                                    <Input
                                                                        id={`week-topic-${index}`}
                                                                        value={
                                                                            week.topic
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const newSchedule =
                                                                                [
                                                                                    ...syllabusData.weeklySchedule,
                                                                                ]
                                                                            newSchedule[
                                                                                index
                                                                            ] =
                                                                                {
                                                                                    ...week,
                                                                                    topic: e
                                                                                        .target
                                                                                        .value,
                                                                                }
                                                                            setSyllabusData(
                                                                                {
                                                                                    ...syllabusData,
                                                                                    weeklySchedule:
                                                                                        newSchedule,
                                                                                }
                                                                            )
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label
                                                                        htmlFor={`week-readings-${index}`}
                                                                    >
                                                                        Readings
                                                                    </Label>
                                                                    <Input
                                                                        id={`week-readings-${index}`}
                                                                        value={
                                                                            week.readings
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const newSchedule =
                                                                                [
                                                                                    ...syllabusData.weeklySchedule,
                                                                                ]
                                                                            newSchedule[
                                                                                index
                                                                            ] =
                                                                                {
                                                                                    ...week,
                                                                                    readings:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                }
                                                                            setSyllabusData(
                                                                                {
                                                                                    ...syllabusData,
                                                                                    weeklySchedule:
                                                                                        newSchedule,
                                                                                }
                                                                            )
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label
                                                                        htmlFor={`week-assignments-${index}`}
                                                                    >
                                                                        Assignments
                                                                    </Label>
                                                                    <Input
                                                                        id={`week-assignments-${index}`}
                                                                        value={
                                                                            week.assignments
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const newSchedule =
                                                                                [
                                                                                    ...syllabusData.weeklySchedule,
                                                                                ]
                                                                            newSchedule[
                                                                                index
                                                                            ] =
                                                                                {
                                                                                    ...week,
                                                                                    assignments:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                }
                                                                            setSyllabusData(
                                                                                {
                                                                                    ...syllabusData,
                                                                                    weeklySchedule:
                                                                                        newSchedule,
                                                                                }
                                                                            )
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                                <div className="flex justify-between">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            const lastWeek =
                                                                syllabusData
                                                                    .weeklySchedule[
                                                                    syllabusData
                                                                        .weeklySchedule
                                                                        .length -
                                                                        1
                                                                ]
                                                            const newWeek = {
                                                                week:
                                                                    lastWeek.week +
                                                                    1,
                                                                topic: "New Topic",
                                                                readings: "TBD",
                                                                assignments:
                                                                    "TBD",
                                                            }
                                                            setSyllabusData({
                                                                ...syllabusData,
                                                                weeklySchedule:
                                                                    [
                                                                        ...syllabusData.weeklySchedule,
                                                                        newWeek,
                                                                    ],
                                                            })
                                                        }}
                                                    >
                                                        Add Week
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            const newSchedule =
                                                                [
                                                                    ...syllabusData.weeklySchedule,
                                                                ]
                                                            newSchedule.pop()
                                                            setSyllabusData({
                                                                ...syllabusData,
                                                                weeklySchedule:
                                                                    newSchedule,
                                                            })
                                                        }}
                                                        disabled={
                                                            syllabusData
                                                                .weeklySchedule
                                                                .length <= 1
                                                        }
                                                    >
                                                        Remove Last Week
                                                    </Button>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="policies">
                                        <AccordionTrigger>
                                            Course Policies
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4">
                                                {Object.entries(
                                                    syllabusData.policies
                                                ).map(([key, value]) => (
                                                    <div key={key}>
                                                        <Label
                                                            htmlFor={`policy-${key}`}
                                                        >
                                                            {key
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                key
                                                                    .slice(1)
                                                                    .replace(
                                                                        /([A-Z])/g,
                                                                        " $1"
                                                                    )}{" "}
                                                            Policy
                                                        </Label>
                                                        <Textarea
                                                            id={`policy-${key}`}
                                                            value={value}
                                                            onChange={(e) => {
                                                                const newPolicies =
                                                                    {
                                                                        ...syllabusData.policies,
                                                                    }
                                                                newPolicies[
                                                                    key
                                                                ] =
                                                                    e.target.value
                                                                setSyllabusData(
                                                                    {
                                                                        ...syllabusData,
                                                                        policies:
                                                                            newPolicies,
                                                                    }
                                                                )
                                                            }}
                                                            className="min-h-[100px] mt-2"
                                                        />
                                                    </div>
                                                ))}
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        const newPolicies = {
                                                            ...syllabusData.policies,
                                                        }
                                                        newPolicies.newPolicy =
                                                            "Enter policy details here."
                                                        setSyllabusData({
                                                            ...syllabusData,
                                                            policies:
                                                                newPolicies,
                                                        })
                                                    }}
                                                >
                                                    Add Policy
                                                </Button>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setActiveTab("generate")}
                                    >
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Regenerate
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setActiveTab("preview")}
                                    >
                                        Preview
                                    </Button>
                                </div>
                                <Button onClick={() => setActiveTab("preview")}>
                                    <Check className="mr-2 h-4 w-4" />
                                    Continue
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="preview" className="space-y-6">
                    {syllabusData && (
                        <>
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">
                                    Syllabus Preview
                                </h2>
                                <div className="flex space-x-2">
                                    <Button variant="outline">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download PDF
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setActiveTab("edit")}
                                    >
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                    <Button
                                        onClick={handleComplete}
                                        disabled={isCreating}
                                    >
                                        {isCreating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating Course...
                                            </>
                                        ) : (
                                            "Create Course"
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <Card className="border-2">
                                <CardContent className="p-6">
                                    <SyllabusPreview
                                        syllabusData={syllabusData}
                                    />
                                </CardContent>
                            </Card>
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
