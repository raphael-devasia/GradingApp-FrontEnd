"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const [currentStep, setCurrentStep] = useState<"type" | "details" | "generate">("type")

  // Assignment type selection
  const [selectedType, setSelectedType] = useState<string>("")

  // Basic assignment info
  const [assignmentTitle, setAssignmentTitle] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [description, setDescription] = useState("")
  const [learningObjectives, setLearningObjectives] = useState("")

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

  // Handle query params for quick creation
  useEffect(() => {
    const type = searchParams.get("type")
    const topic = searchParams.get("topic")

    if (type && Object.values(ASSIGNMENT_TYPES).includes(type)) {
      setSelectedType(type)
      setCurrentStep("details")
    }

    if (topic) {
      setDescription(topic)
    }
  }, [searchParams])

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

    setCurrentStep("generate")
    // Auto-generate content
    handleGenerateContent()
  }

  // Generate content based on assignment type
  const handleGenerateContent = () => {
    setIsGenerating(true)

    // Get the outputs needed for this assignment type
    const outputs = ASSIGNMENT_TYPE_INFO[selectedType]?.outputs || []

    // Simulate AI generating content
    setTimeout(() => {
      const newContent = {}

      // Generate different content based on assignment type
      if (outputs.includes("instructions")) {
        newContent["instructions"] = generateInstructions()
      }

      if (outputs.includes("rubric")) {
        newContent["rubric"] = generateRubric()
      }

      if (outputs.includes("questions")) {
        newContent["questions"] = generateQuestions()
      }

      if (outputs.includes("answer_key")) {
        newContent["answer_key"] = generateAnswerKey()
      }

      if (outputs.includes("checklist")) {
        newContent["checklist"] = generateChecklist()
      }

      if (outputs.includes("participation_criteria")) {
        newContent["participation_criteria"] = generateParticipationCriteria()
      }

      if (outputs.includes("peer_evaluation")) {
        newContent["peer_evaluation"] = generatePeerEvaluation()
      }

      setGeneratedContent(newContent)
      setIsGenerating(false)

      toast({
        title: "Content Generated",
        description: "Your assignment content has been generated successfully",
      })
    }, 2000)
  }

  // Content generation functions for different assignment types
  const generateInstructions = () => {
    const typeTitle = ASSIGNMENT_TYPE_INFO[selectedType]?.title || "Assignment"

    return `# ${typeTitle}: ${assignmentTitle}
## ${selectedCourse}

### Overview
This ${typeTitle.toLowerCase()} will assess your understanding of the subject matter and demonstrate your ability to ${selectedType === ASSIGNMENT_TYPES.ESSAY ? "analyze and articulate complex ideas" : selectedType === ASSIGNMENT_TYPES.RESEARCH_PAPER ? "conduct research and synthesize information" : selectedType === ASSIGNMENT_TYPES.PRESENTATION ? "organize and present information clearly" : "apply concepts to real-world scenarios"}.

### Learning Objectives
${learningObjectives || "- Demonstrate understanding of key concepts\n- Apply theoretical knowledge to practical situations\n- Develop critical thinking and analytical skills"}

### Requirements
- ${selectedType === ASSIGNMENT_TYPES.ESSAY ? "Length: 1000-1500 words" : selectedType === ASSIGNMENT_TYPES.RESEARCH_PAPER ? "Length: 2000-2500 words with at least 8 scholarly sources" : selectedType === ASSIGNMENT_TYPES.PRESENTATION ? "Duration: 10-15 minutes with visual aids" : "Follow all instructions carefully"}
- Format: ${selectedType === ASSIGNMENT_TYPES.RESEARCH_PAPER ? "APA style with proper citations" : "Clear, organized structure with proper grammar and spelling"}
- Due Date: ${dueDate || "To be announced"}

### Components
Your ${typeTitle.toLowerCase()} should include the following:

1. **Introduction**
   - Clear thesis or main argument
   - Overview of the topic's significance
   - Brief outline of your approach

2. **Main Body**
   - Well-structured arguments with supporting evidence
   - Critical analysis of key concepts
   - Application of relevant theories

3. **Conclusion**
   - Summary of key points
   - Implications of your analysis
   - Suggestions for further consideration

### Submission Guidelines
Submit your ${typeTitle.toLowerCase()} through the course website by the due date. Late submissions will be penalized according to the course policy.`
  }

  const generateRubric = () => {
    const typeTitle = ASSIGNMENT_TYPE_INFO[selectedType]?.title || "Assignment"

    return `# ${typeTitle} Rubric: ${assignmentTitle}
## ${selectedCourse}

| Criteria | Excellent (A) | Good (B) | Satisfactory (C) | Needs Improvement (D) |
|----------|---------------|----------|------------------|------------------------|
| **Content & Understanding** (30%) | Demonstrates comprehensive understanding of the subject. Ideas are original and insightful. | Shows solid understanding of most concepts. Ideas are generally well-developed. | Demonstrates basic understanding. Some ideas need further development. | Limited understanding of key concepts. Ideas are underdeveloped. |
| **Organization & Structure** (25%) | Exceptionally well-organized with logical flow. Clear transitions between sections. | Well-organized with good flow. Generally clear transitions. | Adequately organized but with some structural issues. Transitions sometimes unclear. | Poor organization. Lacks logical flow. Unclear transitions. |
| **Evidence & Support** (25%) | Excellent use of relevant, high-quality evidence. All arguments well-supported. | Good use of relevant evidence. Most arguments adequately supported. | Adequate use of evidence, though some may be less relevant. Some arguments lack support. | Insufficient or inappropriate evidence. Arguments poorly supported. |
| **Communication & Style** (20%) | Excellent clarity and precision in writing. Sophisticated style. Virtually error-free. | Clear writing with good style. Few grammatical or spelling errors. | Generally clear writing but with some stylistic issues. Several errors present. | Unclear writing with significant stylistic problems. Numerous errors. |

**Grading Scale:**
- A: 90-100%
- B: 80-89%
- C: 70-79%
- D: 60-69%
- F: Below 60%

**Additional Notes:**
This rubric evaluates both the content and presentation of your ${typeTitle.toLowerCase()}. Pay particular attention to developing well-supported arguments and maintaining a clear organizational structure.`
  }

  const generateQuestions = () => {
    return `# Multiple Choice Questions: ${assignmentTitle}
## ${selectedCourse}

1. Which of the following best describes the concept of photosynthesis?
   a) The process by which plants release oxygen into the atmosphere
   b) The process by which plants convert light energy into chemical energy
   c) The process by which plants absorb carbon dioxide from the atmosphere
   d) The process by which plants transport water from roots to leaves

2. What is the primary function of mitochondria in a cell?
   a) Protein synthesis
   b) Energy production
   c) Cell division
   d) Waste removal

3. Which of the following is NOT a characteristic of living organisms?
   a) Growth and development
   b) Response to stimuli
   c) Crystalline structure
   d) Reproduction

4. The process of natural selection is best described as:
   a) The inheritance of acquired characteristics
   b) The survival and reproduction of the fittest individuals
   c) Random changes in the genetic code
   d) Directed evolution toward a predetermined goal

5. Which of the following is an example of a prokaryotic organism?
   a) Mushroom
   b) Amoeba
   c) Bacterium
   d) Fern

6. The human circulatory system is responsible for:
   a) Transporting oxygen and nutrients to cells
   b) Filtering waste products from the blood
   c) Coordinating body movements
   d) Regulating body temperature

7. Which of the following is the correct sequence of taxonomic classification from broadest to most specific?
   a) Kingdom, Phylum, Class, Order, Family, Genus, Species
   b) Domain, Kingdom, Phylum, Class, Order, Family, Genus
   c) Species, Genus, Family, Order, Class, Phylum, Kingdom
   d) Phylum, Kingdom, Class, Order, Family, Genus, Species

8. The process of meiosis results in:
   a) Two identical diploid cells
   b) Four identical haploid cells
   c) Two different diploid cells
   d) Four genetically different haploid cells

9. Which of the following is NOT a function of the skeletal system?
   a) Production of blood cells
   b) Storage of minerals
   c) Detoxification of harmful substances
   d) Protection of vital organs

10. The primary role of enzymes in biological reactions is to:
    a) Provide energy for the reaction
    b) Lower the activation energy required
    c) Change the equilibrium of the reaction
    d) Increase the temperature of the reaction`
  }

  const generateAnswerKey = () => {
    return `# Answer Key: ${assignmentTitle}
## ${selectedCourse}

1. b) The process by which plants convert light energy into chemical energy
   - Explanation: Photosynthesis is the process where plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar.

2. b) Energy production
   - Explanation: Mitochondria are known as the powerhouses of the cell because they generate most of the cell's supply of ATP, which is used as a source of chemical energy.

3. c) Crystalline structure
   - Explanation: While some non-living things like minerals have crystalline structures, this is not a characteristic of living organisms.

4. b) The survival and reproduction of the fittest individuals
   - Explanation: Natural selection is the process where organisms better adapted to their environment tend to survive and produce more offspring.

5. c) Bacterium
   - Explanation: Bacteria are prokaryotic organisms, meaning they lack a true nucleus and membrane-bound organelles.

6. a) Transporting oxygen and nutrients to cells
   - Explanation: The circulatory system moves blood throughout the body, delivering oxygen and nutrients to cells and removing waste products.

7. a) Kingdom, Phylum, Class, Order, Family, Genus, Species
   - Explanation: This is the correct hierarchical order of taxonomic classification from broadest to most specific.

8. d) Four genetically different haploid cells
   - Explanation: Meiosis is a type of cell division that results in four daughter cells each with half the number of chromosomes of the parent cell, and genetically different from each other.

9. c) Detoxification of harmful substances
   - Explanation: The liver, not the skeletal system, is primarily responsible for detoxifying harmful substances in the body.

10. b) Lower the activation energy required
    - Explanation: Enzymes are biological catalysts that speed up reactions by lowering the activation energy needed for a reaction to occur.

**Grading Guidelines:**
- Each question is worth 10 points
- No partial credit for multiple choice questions
- Total possible score: 100 points`
  }

  const generateChecklist = () => {
    return `# Lab Report Checklist: ${assignmentTitle}
## ${selectedCourse}

### Format and Structure
- [ ] Title page with experiment title, your name, course, date
- [ ] Abstract (150-250 words summarizing the experiment)
- [ ] Introduction with clear purpose and hypothesis
- [ ] Materials and methods section with detailed procedure
- [ ] Results section with data tables and graphs
- [ ] Discussion section analyzing results
- [ ] Conclusion summarizing findings and addressing hypothesis
- [ ] References in proper citation format

### Content Quality
- [ ] Hypothesis is clear, testable, and based on scientific principles
- [ ] Procedure is detailed enough to be replicated
- [ ] Data is accurately recorded and properly labeled
- [ ] Graphs and tables are properly formatted with titles and labels
- [ ] Statistical analysis is appropriate for the data collected
- [ ] Discussion addresses experimental errors and limitations
- [ ] Conclusion is supported by the data
- [ ] Scientific terminology is used correctly throughout

### Technical Requirements
- [ ] Report follows required formatting (12pt font, double-spaced)
- [ ] Graphs created using appropriate software
- [ ] Raw data included in appendix
- [ ] All calculations shown and explained
- [ ] Units of measurement included with all values
- [ ] Error analysis included where appropriate

### Safety and Ethics
- [ ] Safety procedures followed and documented
- [ ] Ethical considerations addressed if applicable
- [ ] Proper disposal of materials documented
- [ ] Acknowledgment of assistance or collaboration

**Grading Notes:**
- Each item on this checklist contributes to your overall grade
- Major deficiencies in critical areas (hypothesis, data analysis, conclusion) will significantly impact your grade
- Exceptional work in any area will be noted and may positively influence your grade`
  }

  const generateParticipationCriteria = () => {
    return `# Discussion Participation Criteria: ${assignmentTitle}
## ${selectedCourse}

### Quantity of Participation
| Level | Description | Points |
|-------|-------------|--------|
| Excellent | Consistently participates throughout the discussion period with multiple substantive contributions | 25-30 |
| Good | Regularly participates with at least 2-3 substantive contributions | 20-24 |
| Satisfactory | Occasionally participates with at least 1-2 contributions | 15-19 |
| Needs Improvement | Rarely participates or contributions are minimal | 0-14 |

### Quality of Contributions
| Level | Description | Points |
|-------|-------------|--------|
| Excellent | Contributions demonstrate thorough preparation, critical thinking, and advance the discussion | 25-30 |
| Good | Contributions show good preparation and understanding of the material | 20-24 |
| Satisfactory | Contributions show basic preparation but limited depth | 15-19 |
| Needs Improvement | Contributions show minimal preparation or understanding | 0-14 |

### Engagement with Peers
| Level | Description | Points |
|-------|-------------|--------|
| Excellent | Actively engages with peers' ideas, asks thoughtful questions, and builds on others' contributions | 15-20 |
| Good | Responds thoughtfully to peers and shows active listening | 10-14 |
| Satisfactory | Some engagement with peers but limited follow-up | 5-9 |
| Needs Improvement | Minimal engagement with peers' contributions | 0-4 |

### Discussion Etiquette
| Level | Description | Points |
|-------|-------------|--------|
| Excellent | Consistently demonstrates respect, active listening, and inclusive behavior | 15-20 |
| Good | Generally respectful and attentive to others | 10-14 |
| Satisfactory | Mostly respectful but may occasionally interrupt or dominate | 5-9 |
| Needs Improvement | Frequently interrupts, dominates, or shows disrespect | 0-4 |

**Total Possible Points: 100**

**Additional Notes:**
- Participation will be assessed throughout the entire discussion period
- Quality is valued over quantity—a few thoughtful contributions are better than many superficial ones
- Both verbal and non-verbal participation (active listening, note-taking) will be considered
- Students with documented accommodations for participation will be assessed according to their individual plans`
  }

  const generatePeerEvaluation = () => {
    return `# Peer Evaluation Form: ${assignmentTitle}
## ${selectedCourse}

### Instructions
Rate each team member (including yourself) on the criteria below using the following scale:
1 = Poor, 2 = Below Average, 3 = Average, 4 = Good, 5 = Excellent

### Team Member: [Name]

#### Contribution to Project
- [ ] 1: Made minimal or no contributions to the project
- [ ] 2: Made some contributions but below expectations
- [ ] 3: Met basic expectations for contributions
- [ ] 4: Made significant and valuable contributions
- [ ] 5: Went above and beyond in contributions to the project

#### Reliability & Responsibility
- [ ] 1: Frequently missed deadlines and meetings
- [ ] 2: Occasionally missed deadlines or meetings
- [ ] 3: Generally reliable but needed reminders
- [ ] 4: Consistently reliable and responsible
- [ ] 5: Exceptionally dependable, often took initiative

#### Quality of Work
- [ ] 1: Work required significant revision or redoing
- [ ] 2: Work needed substantial improvement
- [ ] 3: Work met basic requirements
- [ ] 4: Work was high quality with few issues
- [ ] 5: Work was exceptional and elevated the project

#### Collaboration & Teamwork
- [ ] 1: Difficult to work with, created conflicts
- [ ] 2: Sometimes difficult to work with
- [ ] 3: Worked adequately with the team
- [ ] 4: Good team player, easy to work with
- [ ] 5: Outstanding team player, enhanced group dynamics

#### Communication
- [ ] 1: Poor communication, unresponsive
- [ ] 2: Communication was inconsistent
- [ ] 3: Communicated adequately when needed
- [ ] 4: Communicated clearly and consistently
- [ ] 5: Excellent communication that enhanced the project

### Comments
Please provide specific examples to support your ratings:

[Text area for comments]

### Overall Contribution Percentage
What percentage of the total group effort do you feel this person contributed?
[   ]%

**Note: The percentages for all team members should total 100%**

This peer evaluation will be used as part of the individual grade calculation for the group project. Your honest and fair assessment is important for equitable grading.`
  }

  // Handle saving the assignment
  const handleSaveAssignment = () => {
    setIsSaving(true)

    // Simulate saving assignment
    setTimeout(() => {
      setIsSaving(false)

      toast({
        title: "Assignment Saved",
        description: "Your assignment has been saved successfully",
      })

      // In a real app, this would save to a database and redirect
      router.push("/dashboard/assignments")
    }, 2000)
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
          <h1 className="text-3xl font-bold">Create New Assessment</h1>
          <p className="text-muted-foreground">Select the type of assessment you want to create</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(ASSIGNMENT_TYPE_INFO).map(([type, info]) => {
            const Icon = info.icon
            return (
              <Card
                key={type}
                className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${selectedType === type ? "border-primary bg-primary/5" : ""}`}
                onClick={() => setSelectedType(type)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{info.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {info.outputs.map((output) => (
                      <Badge key={output} variant="outline" className="text-xs">
                        {output.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleTypeSelection} disabled={!selectedType}>
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
          <Button variant="ghost" onClick={() => setCurrentStep("type")} className="p-0 h-auto">
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back
          </Button>
          <div className="h-1 w-1 rounded-full bg-muted-foreground" />
          <span className="text-muted-foreground">{typeInfo?.title || "Assignment"} Details</span>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Create {typeInfo?.title || "Assignment"}</h1>
          <p className="text-muted-foreground">
            Enter the details for your {typeInfo?.title.toLowerCase() || "assignment"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the essential details about your {typeInfo?.title.toLowerCase() || "assignment"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assignment-title">Title</Label>
              <Input
                id="assignment-title"
                placeholder={`${typeInfo?.title || "Assignment"} Title`}
                value={assignmentTitle}
                onChange={(e) => setAssignmentTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Introduction to Psychology (PSY 101)">
                    Introduction to Psychology (PSY 101)
                  </SelectItem>
                  <SelectItem value="Advanced Statistics (STAT 301)">Advanced Statistics (STAT 301)</SelectItem>
                  <SelectItem value="Environmental Science (ENV 201)">Environmental Science (ENV 201)</SelectItem>
                  <SelectItem value="Creative Writing (ENG 215)">Creative Writing (ENG 215)</SelectItem>
                  <SelectItem value="Biology 101">Biology 101</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder={`Brief description of what students will do in this ${typeInfo?.title.toLowerCase() || "assignment"}...`}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="learning-objectives">Learning Objectives</Label>
              <Textarea
                id="learning-objectives"
                placeholder="List the learning objectives this assessment addresses..."
                rows={3}
                value={learningObjectives}
                onChange={(e) => setLearningObjectives(e.target.value)}
              />
            </div>

            {/* Type-specific fields */}
            {selectedType === ASSIGNMENT_TYPES.MULTIPLE_CHOICE && (
              <div className="space-y-2">
                <Label>Quiz Settings</Label>
                <div className="rounded-md border p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="num-questions">Number of Questions</Label>
                    <Input id="num-questions" type="number" defaultValue="10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                    <Input id="time-limit" type="number" defaultValue="30" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="randomize" />
                    <Label htmlFor="randomize" className="text-sm font-normal">
                      Randomize question order
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="show-answers" />
                    <Label htmlFor="show-answers" className="text-sm font-normal">
                      Show correct answers after submission
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
                    <Label htmlFor="group-size">Group Size</Label>
                    <Input id="group-size" type="number" defaultValue="4" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group-formation">Group Formation</Label>
                    <RadioGroup defaultValue="instructor">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="instructor" id="instructor" />
                        <Label htmlFor="instructor" className="text-sm font-normal">
                          Instructor-assigned groups
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="student" />
                        <Label htmlFor="student" className="text-sm font-normal">
                          Student-selected groups
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="random" id="random" />
                        <Label htmlFor="random" className="text-sm font-normal">
                          Randomly assigned groups
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="peer-eval" defaultChecked />
                    <Label htmlFor="peer-eval" className="text-sm font-normal">
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
                      checked={publishToLMS.includes("Canvas")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPublishToLMS([...publishToLMS, "Canvas"])
                        } else {
                          setPublishToLMS(publishToLMS.filter((lms) => lms !== "Canvas"))
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
                      checked={publishToLMS.includes("Google Classroom")}
                      onCheckedChange={(checked) => {
                        if (connectedLMS.includes("Google Classroom")) {
                          if (checked) {
                            setPublishToLMS([...publishToLMS, "Google Classroom"])
                          } else {
                            setPublishToLMS(publishToLMS.filter((lms) => lms !== "Google Classroom"))
                          }
                        } else {
                          toast({
                            title: "Google Classroom Not Connected",
                            description: "Please connect to Google Classroom first",
                          })
                        }
                      }}
                      disabled={!connectedLMS.includes("Google Classroom")}
                    />
                    <Label
                      htmlFor="google-classroom"
                      className={`text-sm font-normal ${
                        !connectedLMS.includes("Google Classroom") ? "text-muted-foreground" : ""
                      }`}
                    >
                      Publish to Google Classroom
                    </Label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => (window.location.href = "/dashboard/integrations")}
                  >
                    Connect
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleDetailsSubmission}>
              Continue to Generation <ArrowRight className="ml-2 h-4 w-4" />
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
          <Button variant="ghost" onClick={() => setCurrentStep("details")} className="p-0 h-auto">
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back
          </Button>
          <div className="h-1 w-1 rounded-full bg-muted-foreground" />
          <span className="text-muted-foreground">Generate Content</span>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{assignmentTitle}</h1>
          <p className="text-muted-foreground">{selectedCourse}</p>
        </div>

        {isGenerating ? (
          <Card className="flex items-center justify-center py-12">
            <CardContent className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-xl font-medium">Generating Content</h3>
              <p className="text-muted-foreground mt-2">
                Our AI is creating your {typeInfo?.title.toLowerCase() || "assignment"} content...
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Tabs defaultValue={outputs[0]} className="space-y-4">
              <TabsList>
                {outputs.includes("instructions") && <TabsTrigger value="instructions">Instructions</TabsTrigger>}
                {outputs.includes("rubric") && <TabsTrigger value="rubric">Rubric</TabsTrigger>}
                {outputs.includes("questions") && <TabsTrigger value="questions">Questions</TabsTrigger>}
                {outputs.includes("answer_key") && <TabsTrigger value="answer_key">Answer Key</TabsTrigger>}
                {outputs.includes("checklist") && <TabsTrigger value="checklist">Checklist</TabsTrigger>}
                {outputs.includes("participation_criteria") && (
                  <TabsTrigger value="participation_criteria">Participation Criteria</TabsTrigger>
                )}
                {outputs.includes("peer_evaluation") && (
                  <TabsTrigger value="peer_evaluation">Peer Evaluation</TabsTrigger>
                )}
              </TabsList>

              {outputs.includes("instructions") && (
                <TabsContent value="instructions" className="space-y-4">
                  <div className="flex justify-end space-x-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToClipboard(generatedContent.instructions || "", "Instructions")}
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
                    <Button variant="outline" size="sm" className="h-8">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                  <Textarea
                    value={generatedContent.instructions || ""}
                    onChange={(e) => setGeneratedContent({ ...generatedContent, instructions: e.target.value })}
                    className="min-h-[500px] font-mono"
                  />
                </TabsContent>
              )}

              {outputs.includes("rubric") && (
                <TabsContent value="rubric" className="space-y-4">
                  <div className="flex justify-end space-x-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToClipboard(generatedContent.rubric || "", "Rubric")}
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
                    <Button variant="outline" size="sm" className="h-8">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                  <Textarea
                    value={generatedContent.rubric || ""}
                    onChange={(e) => setGeneratedContent({ ...generatedContent, rubric: e.target.value })}
                    className="min-h-[500px] font-mono"
                  />
                </TabsContent>
              )}

              {outputs.includes("questions") && (
                <TabsContent value="questions" className="space-y-4">
                  <div className="flex justify-end space-x-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToClipboard(generatedContent.questions || "", "Questions")}
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
                    <Button variant="outline" size="sm" className="h-8">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                  <Textarea
                    value={generatedContent.questions || ""}
                    onChange={(e) => setGeneratedContent({ ...generatedContent, questions: e.target.value })}
                    className="min-h-[500px] font-mono"
                  />
                </TabsContent>
              )}

              {outputs.includes("answer_key") && (
                <TabsContent value="answer_key" className="space-y-4">
                  <div className="flex justify-end space-x-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToClipboard(generatedContent.answer_key || "", "Answer Key")}
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
                    <Button variant="outline" size="sm" className="h-8">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                  <Textarea
                    value={generatedContent.answer_key || ""}
                    onChange={(e) => setGeneratedContent({ ...generatedContent, answer_key: e.target.value })}
                    className="min-h-[500px] font-mono"
                  />
                </TabsContent>
              )}

              {outputs.includes("checklist") && (
                <TabsContent value="checklist" className="space-y-4">
                  <div className="flex justify-end space-x-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToClipboard(generatedContent.checklist || "", "Checklist")}
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
                    <Button variant="outline" size="sm" className="h-8">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                  <Textarea
                    value={generatedContent.checklist || ""}
                    onChange={(e) => setGeneratedContent({ ...generatedContent, checklist: e.target.value })}
                    className="min-h-[500px] font-mono"
                  />
                </TabsContent>
              )}

              {outputs.includes("participation_criteria") && (
                <TabsContent value="participation_criteria" className="space-y-4">
                  <div className="flex justify-end space-x-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCopyToClipboard(generatedContent.participation_criteria || "", "Participation Criteria")
                      }
                      className="h-8"
                    >
                      {copied === "Participation Criteria" ? (
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
                    <Button variant="outline" size="sm" className="h-8">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                  <Textarea
                    value={generatedContent.participation_criteria || ""}
                    onChange={(e) =>
                      setGeneratedContent({ ...generatedContent, participation_criteria: e.target.value })
                    }
                    className="min-h-[500px] font-mono"
                  />
                </TabsContent>
              )}

              {outputs.includes("peer_evaluation") && (
                <TabsContent value="peer_evaluation" className="space-y-4">
                  <div className="flex justify-end space-x-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToClipboard(generatedContent.peer_evaluation || "", "Peer Evaluation")}
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
                    <Button variant="outline" size="sm" className="h-8">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                  <Textarea
                    value={generatedContent.peer_evaluation || ""}
                    onChange={(e) => setGeneratedContent({ ...generatedContent, peer_evaluation: e.target.value })}
                    className="min-h-[500px] font-mono"
                  />
                </TabsContent>
              )}
            </Tabs>

            <div className="flex justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setPdfPreviewOpen(true)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => setEmailPreviewOpen(true)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email to Students
                </Button>
              </div>
              <Button onClick={handleSaveAssignment} disabled={isSaving}>
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
        course={selectedCourse}
      />

      {/* Email Preview Dialog */}
      <EmailPreviewDialog
        open={emailPreviewOpen}
        onOpenChange={setEmailPreviewOpen}
        assignment={generatedContent.instructions || ""}
        rubric={generatedContent.rubric || ""}
        title={assignmentTitle}
        course={selectedCourse}
      />
    </div>
  )
}
