"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NewCoursePage() {
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateCourse = () => {
    setIsCreating(true)

    // Simulate course creation
    setTimeout(() => {
      setIsCreating(false)

      toast({
        title: "Course Created",
        description: "Your new course has been created successfully",
      })

      // In a real app, this would navigate to the new course page
      window.location.href = "/dashboard/courses"
    }, 2000)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/courses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Create New Course</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <CardDescription>Enter the details for your new course</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-title">Course Title</Label>
              <Input id="course-title" placeholder="Introduction to Psychology" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-code">Course Code</Label>
              <Input id="course-code" placeholder="PSY 101" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="psychology">Psychology</SelectItem>
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="environmental">Environmental Studies</SelectItem>
                <SelectItem value="computer-science">Computer Science</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <Select defaultValue="spring-2025">
              <SelectTrigger>
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spring-2025">Spring 2025</SelectItem>
                <SelectItem value="summer-2025">Summer 2025</SelectItem>
                <SelectItem value="fall-2025">Fall 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Course Description</Label>
            <Textarea id="description" placeholder="Enter a description of your course" rows={4} />
          </div>
          <div className="space-y-2">
            <Label>Course Schedule</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="days" className="text-sm text-muted-foreground">
                  Days
                </Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mw">Monday/Wednesday</SelectItem>
                    <SelectItem value="tr">Tuesday/Thursday</SelectItem>
                    <SelectItem value="mwf">Monday/Wednesday/Friday</SelectItem>
                    <SelectItem value="f">Friday only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm text-muted-foreground">
                  Time
                </Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9-10:30">9:00 AM - 10:30 AM</SelectItem>
                    <SelectItem value="11-12:30">11:00 AM - 12:30 PM</SelectItem>
                    <SelectItem value="1-2:30">1:00 PM - 2:30 PM</SelectItem>
                    <SelectItem value="3-4:30">3:00 PM - 4:30 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/dashboard/courses">Cancel</Link>
          </Button>
          <Button onClick={handleCreateCourse} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
