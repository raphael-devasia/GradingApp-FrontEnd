"use client"
import Link from "next/link"
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
import { CalendarDays, Clock, FileText, Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Assignment } from "@/types/assignment"
import AssignmentUseCases from "@/use-cases/assignment-use-cases"
import { HttpCourseRepository } from "@/repositories/course-repository"



export default function AssignmentsPage() {
    const { toast } = useToast()
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const assignmentUseCases = new AssignmentUseCases()

    useEffect(() => {
        async function fetchAssignments() {
            try {
                setLoading(true)
                const response = await assignmentUseCases.getAssignments()
                

                if (!response.success) {
                    throw new Error("Failed to fetch assignments")
                }
                
                

                // const data: Assignment[] = await response.json()
                setAssignments(response.data)
            } catch (err: any) {
                setError(err.message)
                toast({
                    title: "Error",
                    description:
                        "Failed to load assignments. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchAssignments()
    }, [toast])

    const getStatus = (
        assignment: Assignment
    ): "Active" | "Draft" | "Archived" => {
        if (assignment.status) return assignment.status
        const dueDate = new Date(assignment.dueDate)
        const now = new Date()
        if (dueDate < now) return "Archived"
        if (!assignment.updatedAt) return "Draft"
        return "Active"
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">
                    Assignments
                </h2>
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
                    <Input
                        type="search"
                        placeholder="Search assignments..."
                        className="w-[200px] pl-8 md:w-[300px]"
                    />
                </div>
            </div>

            {loading && <p>Loading assignments...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && assignments.length === 0 && (
                <p>No assignments found.</p>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assignments.map((assignment) => (
                    <Card key={assignment.courseName}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle>{assignment.title}</CardTitle>
                                <CardDescription>
                                    {assignment.courseName ||
                                        `Course ID: ${assignment.courseId}`}
                                </CardDescription>
                            </div>
                            <Badge
                                variant={
                                    getStatus(assignment) === "Draft"
                                        ? "outline"
                                        : getStatus(assignment) === "Archived"
                                        ? "secondary"
                                        : "default"
                                }
                            >
                                {getStatus(assignment)}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground">
                                {getStatus(assignment) === "Draft" ? (
                                    <div className="flex items-center">
                                        <Clock className="mr-1 h-4 w-4" />
                                        <span>
                                            Created:{" "}
                                            {new Date(
                                                assignment.createdAt
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <CalendarDays className="mr-1 h-4 w-4" />
                                        <span>
                                            Due:{" "}
                                            {new Date(
                                                assignment.dueDate
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center mt-1">
                                    <FileText className="mr-1 h-4 w-4" />
                                    <span>
                                        {assignment.submissionCount
                                            ? `${assignment.submissionCount} submissions`
                                            : getStatus(assignment) === "Draft"
                                            ? "Not published"
                                            : "0 submissions"}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Link
                                href={`/dashboard/assignments/${assignment.id}`}
                                className="w-full"
                            >
                                <Button variant="outline" className="w-full">
                                    {getStatus(assignment) === "Draft"
                                        ? "Edit Draft"
                                        : "View Details"}
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
