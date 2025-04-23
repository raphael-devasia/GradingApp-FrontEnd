"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CalendarDays, Clock, FileText, Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function AssignmentsPage() {
  const { toast } = useToast()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Assignments</h2>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/create-assignment">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search assignments..." className="w-[200px] pl-8 md:w-[300px]" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Research Paper</CardTitle>
              <CardDescription>Introduction to Psychology (PSY 101)</CardDescription>
            </div>
            <Badge>Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center">
                <CalendarDays className="mr-1 h-4 w-4" />
                <span>Due: May 15, 2025</span>
              </div>
              <div className="flex items-center mt-1">
                <FileText className="mr-1 h-4 w-4" />
                <span>32 submissions</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/assignments/1" className="w-full">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Midterm Exam</CardTitle>
              <CardDescription>Advanced Statistics (STAT 301)</CardDescription>
            </div>
            <Badge>Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center">
                <CalendarDays className="mr-1 h-4 w-4" />
                <span>Due: April 10, 2025</span>
              </div>
              <div className="flex items-center mt-1">
                <FileText className="mr-1 h-4 w-4" />
                <span>45 submissions</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/assignments/2" className="w-full">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Case Study Analysis</CardTitle>
              <CardDescription>Environmental Science (ENV 201)</CardDescription>
            </div>
            <Badge variant="outline">Draft</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                <span>Created: March 22, 2025</span>
              </div>
              <div className="flex items-center mt-1">
                <FileText className="mr-1 h-4 w-4" />
                <span>Not published</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/assignments/3" className="w-full">
              <Button variant="outline" className="w-full">
                Edit Draft
              </Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Final Project</CardTitle>
              <CardDescription>Creative Writing (ENG 215)</CardDescription>
            </div>
            <Badge>Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center">
                <CalendarDays className="mr-1 h-4 w-4" />
                <span>Due: June 1, 2025</span>
              </div>
              <div className="flex items-center mt-1">
                <FileText className="mr-1 h-4 w-4" />
                <span>18 submissions</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/assignments/4" className="w-full">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Weekly Quiz</CardTitle>
              <CardDescription>Introduction to Psychology (PSY 101)</CardDescription>
            </div>
            <Badge variant="secondary">Archived</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center">
                <CalendarDays className="mr-1 h-4 w-4" />
                <span>Ended: March 1, 2025</span>
              </div>
              <div className="flex items-center mt-1">
                <FileText className="mr-1 h-4 w-4" />
                <span>30 submissions</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/assignments/5" className="w-full">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
