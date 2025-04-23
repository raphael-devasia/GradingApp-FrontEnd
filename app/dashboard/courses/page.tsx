"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Course } from "@/types/course"
import { CourseUseCases } from "@/use-cases/course-use-cases"
import { HttpCourseRepository } from "@/repositories/course-repository"

interface ApiResponse<T> {
    success: boolean
    data: T
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const courseUseCases = new CourseUseCases(new HttpCourseRepository())

    useEffect(() => {
        async function fetchCourses() {
            try {
                const response = await courseUseCases.getCourses()
                setCourses(response.data)
            } catch (err: any) {
                setError(err.message || "Failed to load courses")
            } finally {
                setIsLoading(false)
            }
        }
        fetchCourses()
    }, [])

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <PageHeader
                    heading="Courses"
                    subheading="Manage your courses and create new ones"
                />
                <Button asChild>
                    <Link
                        href="/dashboard/courses/create"
                        title="Create a new course with details and AI-generated syllabus"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Course
                    </Link>
                </Button>
            </div>

            {isLoading && (
                <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            )}

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {!isLoading && !error && courses.length === 0 && (
                <p className="text-muted-foreground">
                    No courses found. Create one to get started!
                </p>
            )}

            {!isLoading && !error && courses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Card key={course.id}>
                            <CardHeader>
                                <CardTitle>{course.name}</CardTitle>
                                <CardDescription>
                                    {course.subject}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {course.description}
                                </p>
                                <div className="flex justify-between text-sm">
                                    <div>
                                        <span className="font-medium">
                                            {course.students}
                                        </span>{" "}
                                        Students
                                    </div>
                                    <div>
                                        <span className="font-medium">
                                            {course.assignments}
                                        </span>{" "}
                                        Assignments
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button
                                    variant="outline"
                                    asChild
                                    className="w-full"
                                >
                                    <Link
                                        href={`/dashboard/courses/${course.id}`}
                                    >
                                        View Details
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
