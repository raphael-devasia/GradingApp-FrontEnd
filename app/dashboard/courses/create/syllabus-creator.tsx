"use client"

import { useState, useEffect } from "react"
import { Loader2, Sparkles, RefreshCw, Download, Check, Edit2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { SyllabusPreview } from "./syllabus-preview"
import { Syllabus } from "@/types/syllabus"

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

export function SyllabusCreator({ courseDetails, onComplete, isCreating }: SyllabusCreatorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("generate")
  const [syllabusData, setSyllabusData] = useState<any>(null)
  const [prompt, setPrompt] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")

  // Generate default prompt based on course details
  useEffect(() => {
    const defaultPrompt = `Create a comprehensive syllabus for a ${courseDetails.gradeLevel} level ${courseDetails.subject} course titled "${courseDetails.name}". The course is described as: ${courseDetails.description}`
    setPrompt(defaultPrompt)
  }, [courseDetails])

  // Mock function to simulate AI generation
  const generateSyllabus = () => {
    setIsGenerating(true)

    // Simulate API call delay
    setTimeout(() => {
      // Mock syllabus data
      const mockSyllabus = {
        courseTitle: courseDetails.name,
        instructor: "Professor Name",
        term: "Fall 2023",
        courseDescription: courseDetails.description,
        learningObjectives: [
          "Understand key concepts and theories in " + courseDetails.subject,
          "Develop critical thinking and analytical skills",
          "Apply theoretical knowledge to practical situations",
          "Communicate ideas effectively through writing and discussion",
        ],
        requiredMaterials: [
          { title: "Main Textbook", author: "Author Name", publisher: "Publisher", year: "2022", required: true },
          {
            title: "Supplementary Reading",
            author: "Author Name",
            publisher: "Publisher",
            year: "2020",
            required: false,
          },
        ],
        gradingPolicy: {
          assignments: { percentage: 30, description: "Weekly assignments" },
          participation: { percentage: 10, description: "Class participation and discussion" },
          midterm: { percentage: 25, description: "Mid-term examination" },
          finalExam: { percentage: 35, description: "Final examination" },
        },
        weeklySchedule: [
          {
            week: 1,
            topic: "Introduction to the Course",
            readings: "Chapters 1-2",
            assignments: "Introductory Assignment",
          },
          { week: 2, topic: "Foundational Concepts", readings: "Chapters 3-4", assignments: "Reading Response" },
          { week: 3, topic: "Theoretical Frameworks", readings: "Chapters 5-6", assignments: "Case Study Analysis" },
          { week: 4, topic: "Applied Methods", readings: "Chapters 7-8", assignments: "Group Project Proposal" },
          { week: 5, topic: "Current Developments", readings: "Chapters 9-10", assignments: "Research Paper Outline" },
          { week: 6, topic: "Advanced Topics I", readings: "Chapters 11-12", assignments: "Problem Set" },
          { week: 7, topic: "Advanced Topics II", readings: "Chapters 13-14", assignments: "Midterm Preparation" },
          {
            week: 8,
            topic: "Midterm Examination",
            readings: "Review All Previous Chapters",
            assignments: "Midterm Exam",
          },
          { week: 9, topic: "Practical Applications I", readings: "Chapters 15-16", assignments: "Case Analysis" },
          {
            week: 10,
            topic: "Practical Applications II",
            readings: "Chapters 17-18",
            assignments: "Group Presentation",
          },
          { week: 11, topic: "Integration of Concepts", readings: "Chapters 19-20", assignments: "Synthesis Paper" },
          { week: 12, topic: "Future Directions", readings: "Chapters 21-22", assignments: "Final Project Work" },
          { week: 13, topic: "Student Presentations", readings: "None", assignments: "Final Presentations" },
          { week: 14, topic: "Course Review", readings: "Review All Materials", assignments: "Final Exam Preparation" },
          { week: 15, topic: "Final Examination", readings: "None", assignments: "Final Exam" },
        ],
        policies: {
          attendance:
            "Regular attendance is required. More than three unexcused absences will result in grade reduction.",
          lateWork: "Late assignments will be accepted with a 10% penalty per day, up to three days.",
          academicIntegrity:
            "Academic dishonesty, including plagiarism and cheating, will result in course failure and possible disciplinary action.",
          accommodations: "Reasonable accommodations will be made for students with documented disabilities.",
        },
      }

      setSyllabusData(mockSyllabus)
      setIsGenerating(false)
      setActiveTab("edit")
    }, 3000)
  }

  return (
      <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                              <Label htmlFor="prompt">Generation Prompt</Label>
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
                                  Review and customize the AI-generated syllabus
                                  to fit your needs.
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
                                                      value={syllabusData.term}
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
                                                  (
                                                      objective: string,
                                                      index: number
                                                  ) => (
                                                      <div
                                                          key={index}
                                                          className="flex items-start gap-2"
                                                      >
                                                          <Input
                                                              value={objective}
                                                              onChange={(e) => {
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
                                                                              _: any,
                                                                              i: number
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
                                                          learningObjectives: [
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
                                                  (
                                                      material: any,
                                                      index: number
                                                  ) => (
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
                                                                          ] = {
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
                                                                          ] = {
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
                                                                          ] = {
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
                                                                          ] = {
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
                                                                  publisher: "",
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
                                              ).map(
                                                  ([key, value]: [
                                                      string,
                                                      any
                                                  ]) => (
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
                                                  )
                                              )}
                                              <Button
                                                  variant="outline"
                                                  onClick={() => {
                                                      const newKey = `component${
                                                          Object.keys(
                                                              syllabusData.gradingPolicy
                                                          ).length + 1
                                                      }`
                                                      const newGradingPolicy = {
                                                          ...syllabusData.gradingPolicy,
                                                      }
                                                      newGradingPolicy[newKey] =
                                                          {
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
                                                  (
                                                      week: any,
                                                      index: number
                                                  ) => (
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
                                                                          ] = {
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
                                                                          ] = {
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
                                                                          ] = {
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
                                                              weeklySchedule: [
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
                                                          const newSchedule = [
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
                                              ).map(
                                                  ([key, value]: [
                                                      string,
                                                      any
                                                  ]) => (
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
                                                  )
                                              )}
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
                                                          policies: newPolicies,
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
                                  <Button onClick={() => onComplete(syllabusData)} disabled={isCreating}>
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
