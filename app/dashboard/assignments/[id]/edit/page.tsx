"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function EditAssignmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [assignment, setAssignment] = useState({
    title: "",
    description: "",
    dueDate: "",
    totalPoints: 100,
    course: "",
    type: "essay",
    rubric: "",
    instructions: "",
    publishToLMS: [] as string[],
  })

  // Simulate fetching assignment data
  useEffect(() => {
    // In a real app, this would be an API call to fetch the assignment data
    setTimeout(() => {
      setAssignment({
        title: "Essay on Climate Change",
        description: "Write a 500-word essay on the impacts of climate change on global ecosystems.",
        dueDate: "2023-12-15",
        totalPoints: 100,
        course: "Environmental Science (ENV 201)",
        type: "essay",
        rubric: `# Essay Rubric
## Environmental Science (ENV 201)

| Category | Excellent (A) | Good (B) | Satisfactory (C) | Needs Improvement (D) | Points |
|----------|---------------|----------|------------------|------------------------|--------|
| **Content & Understanding** (30 points) | Demonstrates comprehensive understanding of climate change impacts. Includes detailed examples and evidence. | Shows good understanding with adequate examples. | Basic understanding with limited examples. | Minimal understanding with few or no examples. | /30 |
| **Analysis & Critical Thinking** (30 points) | Insightful analysis of ecosystem impacts. Makes thoughtful connections between climate change and environmental consequences. | Good analysis with some connections made. | Basic analysis with obvious connections. | Limited analysis with few connections. | /30 |
| **Organization & Structure** (20 points) | Exceptionally well-organized with clear introduction, body, and conclusion. Logical flow throughout. | Well-organized with good flow. | Adequately organized with some structural issues. | Poor organization making arguments difficult to follow. | /20 |
| **Writing Quality** (20 points) | Excellent clarity and precision in writing. Virtually error-free. | Clear writing with few errors. | Generally clear with several errors. | Unclear writing with numerous errors. | /20 |

**Total Points:** /100

**Grading Scale:**
- A: 90-100
- B: 80-89
- C: 70-79
- D: 60-69
- F: Below 60`,
        instructions: `# Essay on Climate Change
## Environmental Science (ENV 201)

### Overview
For this assignment, you will write a 500-word essay on the impacts of climate change on global ecosystems. Your essay should demonstrate your understanding of how climate change affects different ecosystems and the potential long-term consequences for biodiversity and ecosystem services.

### Requirements
- Length: 500 words (approximately 2 double-spaced pages)
- Format: 12-point Times New Roman font, 1-inch margins
- Citations: Minimum of 3 scholarly sources, APA format

### Components
Your essay must include the following sections:

1. **Introduction**
   - Brief overview of climate change
   - Clear thesis statement about its impacts on ecosystems

2. **Body**
   - Discussion of at least two specific ecosystems affected by climate change
   - Analysis of specific impacts (e.g., biodiversity loss, habitat changes)
   - Evidence from scientific research to support your points

3. **Conclusion**
   - Summary of key points
   - Reflection on the broader implications for the planet
   - Potential solutions or mitigation strategies

### Submission Guidelines
Submit your essay as a Word document (.docx) or PDF file through the course website.`,
        publishToLMS: ["Canvas"],
      })
      setIsLoading(false)
    }, 1000)
  }, [params.id])

  const handleSaveAssignment = () => {
    setIsSaving(true)

    // Simulate saving assignment
    setTimeout(() => {
      setIsSaving(false)

      toast({
        title: "Assignment Updated",
        description: "Your assignment has been updated successfully",
      })

      // Navigate back to the assignment details page
      router.push(`/dashboard/assignments/${params.id}`)
    }, 1500)
  }

  const handleCancel = () => {
    router.push(`/dashboard/assignments/${params.id}`)
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 pt-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading assignment details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center">
          <Button variant="ghost" onClick={handleCancel} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Edit Assignment</h2>
        </div>
        <Badge>{assignment.course}</Badge>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Assignment Details</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="rubric">Rubric</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Edit the basic details of your assignment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assignment-title">Assignment Title</Label>
                <Input
                  id="assignment-title"
                  value={assignment.title}
                  onChange={(e) => setAssignment({ ...assignment, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={assignment.description}
                  onChange={(e) => setAssignment({ ...assignment, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <div className="flex">
                    <Input
                      id="due-date"
                      type="date"
                      value={assignment.dueDate}
                      onChange={(e) => setAssignment({ ...assignment, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points">Total Points</Label>
                  <Input
                    id="points"
                    type="number"
                    value={assignment.totalPoints}
                    onChange={(e) => setAssignment({ ...assignment, totalPoints: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignment-type">Assignment Type</Label>
                <Select
                  value={assignment.type}
                  onValueChange={(value) => setAssignment({ ...assignment, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="essay">Essay</SelectItem>
                    <SelectItem value="research">Research Paper</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="discussion">Discussion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Instructions</CardTitle>
              <CardDescription>Edit the detailed instructions for this assignment</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={assignment.instructions}
                onChange={(e) => setAssignment({ ...assignment, instructions: e.target.value })}
                className="min-h-[400px] font-mono"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rubric" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grading Rubric</CardTitle>
              <CardDescription>Edit the rubric used to grade this assignment</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={assignment.rubric}
                onChange={(e) => setAssignment({ ...assignment, rubric: e.target.value })}
                className="min-h-[400px] font-mono"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Settings</CardTitle>
              <CardDescription>Configure additional settings for this assignment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>LMS Integration</Label>
                <div className="space-y-3 rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canvas"
                        checked={assignment.publishToLMS.includes("Canvas")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAssignment({
                              ...assignment,
                              publishToLMS: [...assignment.publishToLMS, "Canvas"],
                            })
                          } else {
                            setAssignment({
                              ...assignment,
                              publishToLMS: assignment.publishToLMS.filter((lms) => lms !== "Canvas"),
                            })
                          }
                        }}
                      />
                      <Label htmlFor="canvas" className="text-sm font-normal">
                        Publish to Canvas
                      </Label>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Connected
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="google-classroom"
                        checked={assignment.publishToLMS.includes("Google Classroom")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAssignment({
                              ...assignment,
                              publishToLMS: [...assignment.publishToLMS, "Google Classroom"],
                            })
                          } else {
                            setAssignment({
                              ...assignment,
                              publishToLMS: assignment.publishToLMS.filter((lms) => lms !== "Google Classroom"),
                            })
                          }
                        }}
                      />
                      <Label htmlFor="google-classroom" className="text-sm font-normal">
                        Publish to Google Classroom
                      </Label>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => router.push("/dashboard/integrations")}
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Advanced Settings</Label>
                <div className="space-y-3 rounded-md border p-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="plagiarism-check" defaultChecked />
                    <Label htmlFor="plagiarism-check" className="text-sm font-normal">
                      Enable plagiarism detection
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="ai-grading" defaultChecked />
                    <Label htmlFor="ai-grading" className="text-sm font-normal">
                      Enable AI-assisted grading
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="late-submissions" />
                    <Label htmlFor="late-submissions" className="text-sm font-normal">
                      Allow late submissions
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSaveAssignment} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
