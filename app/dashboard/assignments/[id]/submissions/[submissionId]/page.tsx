"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Download,
  Share2,
  Save,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"

// Types for our comments and highlights
type InlineComment = {
  id: string
  startIndex: number
  endIndex: number
  text: string
  color: string
  timestamp: string
  author: string
  isAIGenerated?: boolean
}

type SubScore = {
  name: string
  score: number
  maxScore: number
  rationale: string
}

type OverallFeedback = {
  strengths: string
  improvements: string
  actionItems: string
}

export default function SubmissionReviewPage({
  params,
}: {
  params: { id: string; submissionId: string }
}) {
  // Mock data for the submission
  const submission = {
    id: params.submissionId,
    assignmentId: params.id,
    assignmentTitle: "Essay on Climate Change",
    studentName: "John Doe",
    studentId: "S12345",
    submissionDate: "2023-12-10",
    status: "pending",
    content: `Climate change is one of the most pressing issues of our time. The Earth's climate has changed throughout history. Just in the last 650,000 years, there have been seven cycles of glacial advance and retreat, with the abrupt end of the last ice age about 11,700 years ago marking the beginning of the modern climate era — and of human civilization. Most of these climate changes are attributed to very small variations in Earth's orbit that change the amount of solar energy our planet receives.

The current warming trend is of particular significance because most of it is extremely likely (greater than 95% probability) to be the result of human activity since the mid-20th century and proceeding at a rate that is unprecedented over decades to millennia.

Earth-orbiting satellites and other technological advances have enabled scientists to see the big picture, collecting many different types of information about our planet and its climate on a global scale. This body of data, collected over many years, reveals the signals of a changing climate.

The heat-trapping nature of carbon dioxide and other gases was demonstrated in the mid-19th century. Their ability to affect the transfer of infrared energy through the atmosphere is the scientific basis of many instruments flown by NASA. There is no question that increased levels of greenhouse gases must cause the Earth to warm in response.

Ice cores drawn from Greenland, Antarctica, and tropical mountain glaciers show that the Earth's climate responds to changes in greenhouse gas levels. Ancient evidence can also be found in tree rings, ocean sediments, coral reefs, and layers of sedimentary rocks. This ancient, or paleoclimate, evidence reveals that current warming is occurring roughly ten times faster than the average rate of ice-age-recovery warming.`,
    aiCheckerResults: {
      score: 92,
      confidence: "High",
      details: [
        { section: "Introduction", aiProbability: 0.15, humanProbability: 0.85 },
        { section: "Main Body", aiProbability: 0.08, humanProbability: 0.92 },
        { section: "Conclusion", aiProbability: 0.12, humanProbability: 0.88 },
      ],
    },
    plagiarismResults: {
      score: 98,
      matches: [
        {
          text: "The heat-trapping nature of carbon dioxide and other gases was demonstrated in the mid-19th century.",
          source: "NASA Climate Change Website",
          similarity: 0.92,
        },
      ],
    },
  }

  // State for inline comments
  const [inlineComments, setInlineComments] = useState<InlineComment[]>([
    {
      id: "comment-1",
      startIndex: 120,
      endIndex: 180,
      text: "Good introduction to the topic",
      color: "bg-yellow-200",
      timestamp: new Date().toISOString(),
      author: "Instructor",
    },
    {
      id: "comment-2",
      startIndex: 450,
      endIndex: 520,
      text: "Consider adding more specific examples here",
      color: "bg-blue-200",
      timestamp: new Date().toISOString(),
      author: "Instructor",
    },
  ])

  // State for overall feedback
  const [overallFeedback, setOverallFeedback] = useState<OverallFeedback>({
    strengths:
      "Strong introduction and good use of scientific evidence. The essay demonstrates a clear understanding of climate change causes and effects.",
    improvements:
      "The conclusion could be more impactful. Some paragraphs are too long and could be broken up for better readability.",
    actionItems:
      "1. Add more specific examples of climate change impacts\n2. Strengthen the conclusion with a call to action\n3. Break up longer paragraphs for better readability",
  })

  // State for subscores with rationale
  const [subScores, setSubScores] = useState<SubScore[]>([
    {
      name: "Content",
      score: 90,
      maxScore: 100,
      rationale: "The essay covers the topic comprehensively and uses reliable sources.",
    },
    {
      name: "Organization",
      score: 85,
      maxScore: 100,
      rationale: "Good structure overall, but transitions between paragraphs could be smoother.",
    },
    {
      name: "Grammar",
      score: 80,
      maxScore: 100,
      rationale: "A few minor grammatical errors, but generally well-written.",
    },
    {
      name: "Citations",
      score: 85,
      maxScore: 100,
      rationale: "Sources are cited correctly, but could use more diverse references.",
    },
  ])

  // State for final score
  const [finalScore, setFinalScore] = useState<number>(85)

  // State for new comment
  const [newCommentText, setNewCommentText] = useState<string>("")
  const [selectedText, setSelectedText] = useState<string>("")
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null)
  const [isCommentMode, setIsCommentMode] = useState(false)

  // Content ref for getting selection positions
  const contentRef = useRef<HTMLDivElement>(null)
  const commentSidebarRef = useRef<HTMLDivElement>(null)

  // Handle text selection
  const handleTextSelection = () => {
    if (!isCommentMode) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || !contentRef.current) return

    const range = selection.getRangeAt(0)
    const selectedText = selection.toString().trim()

    if (!selectedText) return

    // Calculate the start and end indices
    const preSelectionRange = range.cloneRange()
    preSelectionRange.selectNodeContents(contentRef.current)
    preSelectionRange.setEnd(range.startContainer, range.startOffset)
    const start = preSelectionRange.toString().length

    setSelectedText(selectedText)
    setSelectionRange({ start, end: start + selectedText.length })
  }

  // Add a new inline comment
  const addInlineComment = () => {
    if (!newCommentText.trim() || !selectionRange) return

    const newComment: InlineComment = {
      id: `comment-${Date.now()}`,
      startIndex: selectionRange.start,
      endIndex: selectionRange.end,
      text: newCommentText,
      color: getRandomHighlightColor(),
      timestamp: new Date().toISOString(),
      author: "Instructor",
      isAIGenerated: false,
    }

    const updatedComments = [...inlineComments, newComment]
    setInlineComments(updatedComments)
    setNewCommentText("")
    setSelectedText("")
    setSelectionRange(null)
    setActiveCommentId(newComment.id)

    toast({
      title: "Comment added",
      description: "Your comment has been added to the selected text.",
    })
  }

  // Remove an inline comment
  const removeInlineComment = (id: string) => {
    setInlineComments(inlineComments.filter((comment) => comment.id !== id))
    if (activeCommentId === id) {
      setActiveCommentId(null)
    }
  }

  // Update a comment
  const updateComment = (id: string, text: string) => {
    const updatedComments = inlineComments.map((comment) => (comment.id === id ? { ...comment, text } : comment))
    setInlineComments(updatedComments)
  }

  // Update a subscore
  const updateSubScore = (index: number, newScore: number) => {
    const updatedScores = [...subScores]
    updatedScores[index].score = newScore
    setSubScores(updatedScores)

    // Recalculate overall score
    const total = updatedScores.reduce((sum, item) => sum + item.score, 0)
    const max = updatedScores.reduce((sum, item) => sum + item.maxScore, 0)
    setFinalScore(Math.round((total / max) * 100))
  }

  // Update a subscore rationale
  const updateSubScoreRationale = (index: number, rationale: string) => {
    const updatedScores = [...subScores]
    updatedScores[index].rationale = rationale
    setSubScores(updatedScores)
  }

  // Update overall feedback
  const updateOverallFeedback = (field: keyof OverallFeedback, value: string) => {
    setOverallFeedback({
      ...overallFeedback,
      [field]: value,
    })
  }

  // Get a random highlight color
  const getRandomHighlightColor = () => {
    const colors = ["bg-yellow-200", "bg-green-200", "bg-blue-200", "bg-purple-200", "bg-pink-200"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Generate AI comment suggestion
  const generateAIComment = async () => {
    if (!selectedText) return

    setIsGeneratingAI(true)

    try {
      // Simulate AI generation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Example AI-generated comment based on selected text
      let aiComment = "This section could be improved by..."

      if (selectedText.length < 20) {
        aiComment = "Consider revising this phrase for clarity."
      } else if (
        selectedText.toLowerCase().includes("however") ||
        selectedText.toLowerCase().includes("but") ||
        selectedText.toLowerCase().includes("although")
      ) {
        aiComment = "Good use of transition words to connect contrasting ideas."
      } else if (selectedText.length > 100) {
        aiComment =
          "This paragraph is well-structured but could benefit from more specific examples to support your argument."
      }

      setNewCommentText(aiComment)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  // Scroll to comment in the sidebar
  const scrollToComment = (commentId: string) => {
    setActiveCommentId(commentId)

    if (commentSidebarRef.current) {
      const commentElement = commentSidebarRef.current.querySelector(`[data-comment-id="${commentId}"]`)
      if (commentElement) {
        commentElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  // Toggle comment mode
  const toggleCommentMode = () => {
    setIsCommentMode(!isCommentMode)
    if (!isCommentMode) {
      toast({
        title: "Comment mode enabled",
        description: "Select text in the document to add comments.",
      })
    } else {
      setSelectedText("")
      setSelectionRange(null)
    }
  }

  // Render the content with highlights
  const renderHighlightedContent = () => {
    const content = submission.content
    const result = []
    const lastIndex = 0

    // Sort comments by startIndex
    const sortedComments = [...inlineComments].sort((a, b) => a.startIndex - b.startIndex)

    // Create an array to hold all segments (text and highlights)
    const segments = []

    // Add the beginning of the text
    if (sortedComments.length > 0 && sortedComments[0].startIndex > 0) {
      segments.push({
        type: "text",
        content: content.substring(0, sortedComments[0].startIndex),
      })
    } else if (sortedComments.length === 0) {
      segments.push({
        type: "text",
        content: content,
      })
    }

    // Add all highlights and text between them
    for (let i = 0; i < sortedComments.length; i++) {
      const comment = sortedComments[i]

      // Add the highlight
      segments.push({
        type: "highlight",
        content: content.substring(comment.startIndex, comment.endIndex),
        comment: comment,
      })

      // Add text between this highlight and the next one (or the end)
      const nextIndex = i < sortedComments.length - 1 ? sortedComments[i + 1].startIndex : content.length
      if (comment.endIndex < nextIndex) {
        segments.push({
          type: "text",
          content: content.substring(comment.endIndex, nextIndex),
        })
      }
    }

    // Process segments into paragraphs
    let currentParagraph = []
    const paragraphs = []

    for (const segment of segments) {
      if (segment.type === "text") {
        // Split text by paragraphs
        const paragraphTexts = segment.content.split("\n\n")

        // Add first part to current paragraph
        if (paragraphTexts.length > 0) {
          currentParagraph.push({
            type: "text",
            content: paragraphTexts[0],
          })
        }

        // For each additional paragraph, create a new paragraph
        for (let i = 1; i < paragraphTexts.length; i++) {
          // Save current paragraph
          if (currentParagraph.length > 0) {
            paragraphs.push([...currentParagraph])
            currentParagraph = []
          }

          // Start new paragraph
          currentParagraph.push({
            type: "text",
            content: paragraphTexts[i],
          })
        }
      } else {
        // Add highlight to current paragraph
        currentParagraph.push(segment)
      }
    }

    // Add the last paragraph if it exists
    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph)
    }

    // Render paragraphs
    return paragraphs.map((paragraph, pIndex) => (
      <p key={`p-${pIndex}`} className="mb-4">
        {paragraph.map((segment, sIndex) => {
          if (segment.type === "text") {
            return <span key={`s-${pIndex}-${sIndex}`}>{segment.content}</span>
          } else {
            const comment = segment.comment
            const isActive = comment.id === activeCommentId

            return (
              <span
                key={`h-${comment.id}`}
                className={`relative inline-block cursor-pointer group ${comment.color} px-0.5 rounded transition-all duration-200 ${isActive ? "ring-2 ring-primary" : ""}`}
                onClick={() => scrollToComment(comment.id)}
              >
                {segment.content}
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <MessageSquare className="w-3 h-3" />
                </span>
              </span>
            )
          }
        })}
      </p>
    ))
  }

  // Save all changes
  const saveChanges = () => {
    toast({
      title: "Changes saved",
      description: "All comments and grades have been saved.",
    })
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/assignments/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Submission Review</h1>
            <p className="text-muted-foreground">{submission.assignmentTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-muted px-4 py-2 rounded-lg flex flex-col items-center">
            <span className="text-sm font-medium text-muted-foreground">Final Score</span>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold">{finalScore}</span>
              <span className="text-sm ml-1">/100</span>
            </div>
          </div>
          <Button onClick={saveChanges}>
            <Save className="mr-2 h-4 w-4" />
            Save All Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Submission Content</CardTitle>
                <CardDescription>
                  Submitted on {new Date(submission.submissionDate).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={isCommentMode ? "default" : "outline"}
                  size="sm"
                  onClick={toggleCommentMode}
                  className="flex items-center gap-1"
                >
                  <MessageSquare className="h-4 w-4" />
                  {isCommentMode ? "Exit Comment Mode" : "Add Comments"}
                </Button>
                <Button variant="outline" size="icon" title="Share" asChild>
                  <Link href={`/dashboard/assignments/${params.id}/submissions/${params.submissionId}/share`}>
                    <Share2 className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="icon" title="Download as PDF">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative">
              {isCommentMode && (
                <div className="absolute top-0 left-0 right-0 bg-muted/30 p-2 rounded-t-md text-sm text-center">
                  Select text to add comments. Click on highlighted text to view comments.
                </div>
              )}
              <div
                ref={contentRef}
                className={`prose max-w-none ${isCommentMode ? "pt-8 cursor-text" : ""}`}
                onMouseUp={handleTextSelection}
              >
                {renderHighlightedContent()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overall Feedback</CardTitle>
              <CardDescription>Provide structured feedback on the submission</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <Label htmlFor="strengths" className="font-medium">
                      Strengths
                    </Label>
                  </div>
                  <Textarea
                    id="strengths"
                    placeholder="What did the student do well?"
                    value={overallFeedback.strengths}
                    onChange={(e) => updateOverallFeedback("strengths", e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <Label htmlFor="improvements" className="font-medium">
                      Areas for Improvement
                    </Label>
                  </div>
                  <Textarea
                    id="improvements"
                    placeholder="What could the student improve?"
                    value={overallFeedback.improvements}
                    onChange={(e) => updateOverallFeedback("improvements", e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-blue-500" />
                    <Label htmlFor="actionItems" className="font-medium">
                      Action Items
                    </Label>
                  </div>
                  <Textarea
                    id="actionItems"
                    placeholder="What specific actions should the student take?"
                    value={overallFeedback.actionItems}
                    onChange={(e) => updateOverallFeedback("actionItems", e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Inline Comments</CardTitle>
              <CardDescription>{inlineComments.length} comments on this submission</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div ref={commentSidebarRef} className="max-h-[350px] overflow-hidden">
                <ScrollArea className="h-[350px]">
                  <div className="px-4 py-2">
                    {selectedText && isCommentMode && (
                      <div className="mb-4 p-3 border rounded-md bg-muted/20 space-y-3">
                        <div>
                          <p className="font-medium text-sm">Selected Text:</p>
                          <p className="text-sm italic mt-1 text-muted-foreground">"{selectedText}"</p>
                        </div>

                        <Textarea
                          placeholder="Add your comment here..."
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          className="text-sm min-h-[80px]"
                        />

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={generateAIComment}
                            disabled={isGeneratingAI}
                          >
                            <Sparkles className="h-3.5 w-3.5 mr-1" />
                            {isGeneratingAI ? "Generating..." : "AI Suggest"}
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={addInlineComment}
                            disabled={!newCommentText.trim()}
                          >
                            Add Comment
                          </Button>
                        </div>
                      </div>
                    )}

                    {inlineComments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {isCommentMode
                          ? "Select text to add comments"
                          : "No comments yet. Click 'Add Comments' to start."}
                      </div>
                    ) : (
                      <div className="space-y-3 pb-2">
                        {inlineComments
                          .sort((a, b) => a.startIndex - b.startIndex)
                          .map((comment) => (
                            <div
                              key={comment.id}
                              data-comment-id={comment.id}
                              className={`p-3 border rounded-md transition-all ${
                                comment.id === activeCommentId ? "ring-2 ring-primary bg-muted/20" : "hover:bg-muted/10"
                              }`}
                              onClick={() => setActiveCommentId(comment.id)}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-1">
                                  <span className={`w-3 h-3 rounded-full ${comment.color}`}></span>
                                  <span className="text-xs font-medium">{comment.author}</span>
                                  {comment.isAIGenerated && <Sparkles className="h-3 w-3 text-purple-500" />}
                                </div>
                                <span className="text-xs text-muted-foreground">{formatDate(comment.timestamp)}</span>
                              </div>

                              <div className="text-xs text-muted-foreground mb-2 line-clamp-1">
                                <span className="italic">
                                  "{submission.content.substring(comment.startIndex, comment.endIndex)}"
                                </span>
                              </div>

                              <div className="text-sm mb-2">{comment.text}</div>

                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const newText = prompt("Edit comment:", comment.text)
                                    if (newText) updateComment(comment.id, newText)
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (confirm("Delete this comment?")) {
                                      removeInlineComment(comment.id)
                                    }
                                  }}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`/placeholder.svg?height=48&width=48`} />
                  <AvatarFallback>
                    {submission.studentName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{submission.studentName}</p>
                  <p className="text-sm text-muted-foreground">ID: {submission.studentId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grading</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-4xl font-bold">{finalScore}</span>
                  <span className="text-xl">/100</span>
                </div>

                <Separator />

                <div className="space-y-6">
                  <h3 className="font-medium">Sub Scores</h3>
                  {subScores.map((score, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor={`score-${index}`}>{score.name}</Label>
                        <span>
                          {score.score}/{score.maxScore}
                        </span>
                      </div>
                      <Input
                        id={`score-${index}`}
                        type="number"
                        min="0"
                        max={score.maxScore}
                        value={score.score}
                        onChange={(e) => updateSubScore(index, Number.parseInt(e.target.value))}
                      />
                      <Textarea
                        placeholder={`Rationale for ${score.name} score...`}
                        value={score.rationale}
                        onChange={(e) => updateSubScoreRationale(index, e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="ai">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ai">AI Checker</TabsTrigger>
              <TabsTrigger value="plagiarism">Plagiarism</TabsTrigger>
            </TabsList>
            <TabsContent value="ai">
              <Card>
                <CardHeader>
                  <CardTitle>AI Content Detection</CardTitle>
                  <CardDescription>Confidence: {submission.aiCheckerResults.confidence}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Human-Written Score</span>
                      <Badge>{submission.aiCheckerResults.score}%</Badge>
                    </div>
                    <Progress value={submission.aiCheckerResults.score} className="h-2" />

                    <Separator />

                    <h3 className="font-medium">Detailed Analysis</h3>
                    <div className="space-y-4">
                      {submission.aiCheckerResults.details.map((detail, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <span>{detail.section}</span>
                            <span>{Math.round(detail.humanProbability * 100)}% Human</span>
                          </div>
                          <Progress value={detail.humanProbability * 100} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="plagiarism">
              <Card>
                <CardHeader>
                  <CardTitle>Plagiarism Check</CardTitle>
                  <CardDescription>Originality Score: {submission.plagiarismResults.score}%</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={submission.plagiarismResults.score} className="h-2" />

                    <Separator />

                    <h3 className="font-medium">Matched Content</h3>
                    {submission.plagiarismResults.matches.length === 0 ? (
                      <p className="text-muted-foreground">No plagiarism detected</p>
                    ) : (
                      <div className="space-y-4">
                        {submission.plagiarismResults.matches.map((match, index) => (
                          <div key={index} className="p-3 border rounded-md space-y-2">
                            <p className="italic text-sm">"{match.text}"</p>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Source: {match.source}</span>
                              <Badge variant="outline">{Math.round(match.similarity * 100)}% Match</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
