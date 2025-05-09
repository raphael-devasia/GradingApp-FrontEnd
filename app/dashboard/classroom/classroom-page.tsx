"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Upload, Users } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { StudentsList } from "./students-list"
import { CoTeachersList } from "./co-teachers-list"
import { useToast } from "@/components/ui/toast"
import { Classroom } from "@/types/classRoom"
import { ClassRoomUseCases } from "@/use-cases/class-room-use-case"
import { HttpClassRoomRepository } from "@/repositories/classRoom-repository"

export default function ClassroomPage() {
    const { toast } = useToast()
    const [classrooms, setClassrooms] = useState<Classroom[]>([])
    const [selectedStudentClass, setSelectedStudentClass] = useState("English")
    const [selectedCoTeacherClass, setSelectedCoTeacherClass] = useState("all")
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeClasses: 0,
        averageClassSize: 0,
        submissionsThisMonth: 0,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const classRoomUseCases = new ClassRoomUseCases(
        new HttpClassRoomRepository()
    )

    useEffect(() => {
        async function fetchClassrooms() {
            try {
                setLoading(true)
                const response = await classRoomUseCases.getClassRooms()
                console.log("getClassRooms response:", response)
                if (!response.success) {
                    throw new Error(
                        response.message || "Failed to fetch classrooms"
                    )
                }
                const data = Array.isArray(response.data) ? response.data : []
                setClassrooms(data)
                console.log("Set classrooms:", data)
                const totalStudents = data.reduce(
                    (sum, cls) => sum + cls.studentIds.length,
                    0
                )
                const activeClasses = data.length
                const averageClassSize = activeClasses
                    ? Math.round(totalStudents / activeClasses)
                    : 0
                const submissionsThisMonth = 342 // Placeholder; fetch from API if available
                setStats({
                    totalStudents,
                    activeClasses,
                    averageClassSize,
                    submissionsThisMonth,
                })
            } catch (err: any) {
                console.error("Error fetching classrooms:", err.message)
                setError(err.message)
                toast({
                    title: "Error",
                    description: "Failed to load classrooms. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }
        fetchClassrooms()
    }, [toast])

    const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const name = formData.get("student-name") as string
        const email = formData.get("student-email") as string

        if (!selectedStudentClass) {
            toast({
                title: "Error",
                description: "Please select a class.",
                variant: "destructive",
            })
            return
        }

        

        try {
            const response = await classRoomUseCases.addStudent(
                selectedStudentClass,
                name,
                email
            )
            if (!response.success)
                throw new Error(response.message || "Failed to add student")
            toast({
                title: "Student added",
                description:
                    "The student has been added to your class successfully.",
            })
            const updatedResponse = await classRoomUseCases.getClassRooms()
            const updatedData = Array.isArray(updatedResponse.data)
                ? updatedResponse.data
                : []
            setClassrooms(updatedData)
            setSelectedStudentClass("English")
        } catch (err: any) {
            console.error("Error adding student:", err.message)
            setError(err.message)
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            })
        }
    }

    const handleAddCoTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string
        const email = formData.get("email") as string

        let classroomId: string | undefined
        if (selectedCoTeacherClass !== "all") {
            const classroom = classrooms.find(
                (cls) => cls.name === selectedCoTeacherClass
            )
            if (!classroom) {
                toast({
                    title: "Error",
                    description: `Class "${selectedCoTeacherClass}" not found.`,
                    variant: "destructive",
                })
                return
            }
            classroomId = classroom.id
        }

        try {
            const response = await classRoomUseCases.addCoTeacher(
                classroomId,
                name,
                email
            )
            if (!response.success)
                throw new Error(response.message || "Failed to add co-teacher")
            toast({
                title: "Invitation sent",
                description:
                    "The co-teacher invitation has been sent successfully.",
            })
            const updatedResponse = await classRoomUseCases.getClassRooms()
            const updatedData = Array.isArray(updatedResponse.data)
                ? updatedResponse.data
                : []
            setClassrooms(updatedData)
            setSelectedCoTeacherClass("all")
        } catch (err: any) {
            console.error("Error adding co-teacher:", err.message)
            setError(err.message)
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            })
        }
    }

    return (
        <div className="container py-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Classroom Management
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your students and co-teachers for all your
                        classes
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Co-Teacher
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add Co-Teacher</DialogTitle>
                            <DialogDescription>
                                Enter the email address of the teacher you want
                                to invite as a co-teacher for this class.
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            onSubmit={handleAddCoTeacher}
                            className="grid gap-4 py-4"
                        >
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Jane Doe"
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="teacher@school.edu"
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="class" className="text-right">
                                    Class
                                </Label>
                                <Select
                                    value={selectedCoTeacherClass}
                                    onValueChange={setSelectedCoTeacherClass}
                                >
                                    <SelectTrigger
                                        id="class"
                                        name="class"
                                        className="col-span-3"
                                    >
                                        <SelectValue placeholder="Select a class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Classes
                                        </SelectItem>
                                        <SelectItem value="English">
                                            English
                                        </SelectItem>
                                        <SelectItem value="History">
                                            History
                                        </SelectItem>
                                        <SelectItem value="Math">
                                            Math
                                        </SelectItem>
                                        <SelectItem value="Science">
                                            Science
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Send Invitation</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="students" className="mt-6">
                <TabsList>
                    <TabsTrigger value="students">Students</TabsTrigger>
                    <TabsTrigger value="co-teachers">Co-Teachers</TabsTrigger>
                </TabsList>

                <TabsContent value="students" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Students
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.totalStudents}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Active Classes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.activeClasses}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Average Class Size
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.averageClassSize}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Submissions This Month
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.submissionsThisMonth}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Students</h2>
                            <div className="flex gap-2">
                                <Button variant="outline">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import Students
                                </Button>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Add Student
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>
                                                Add Student
                                            </DialogTitle>
                                            <DialogDescription>
                                                Enter the details of the student
                                                you want to add to your class.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form
                                            onSubmit={handleAddStudent}
                                            className="grid gap-4 py-4"
                                        >
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label
                                                    htmlFor="student-name"
                                                    className="text-right"
                                                >
                                                    Name
                                                </Label>
                                                <Input
                                                    id="student-name"
                                                    name="student-name"
                                                    placeholder="John Doe"
                                                    className="col-span-3"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label
                                                    htmlFor="student-email"
                                                    className="text-right"
                                                >
                                                    Email
                                                </Label>
                                                <Input
                                                    id="student-email"
                                                    name="student-email"
                                                    type="email"
                                                    placeholder="student@school.edu"
                                                    className="col-span-3"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label
                                                    htmlFor="student-class"
                                                    className="text-right"
                                                >
                                                    Class
                                                </Label>
                                                <Select
                                                    value={selectedStudentClass}
                                                    onValueChange={
                                                        setSelectedStudentClass
                                                    }
                                                >
                                                    <SelectTrigger
                                                        id="student-class"
                                                        name="student-class"
                                                        className="col-span-3"
                                                    >
                                                        <SelectValue placeholder="Select a class" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="English">
                                                            English
                                                        </SelectItem>
                                                        <SelectItem value="History">
                                                            History
                                                        </SelectItem>
                                                        <SelectItem value="Math">
                                                            Math
                                                        </SelectItem>
                                                        <SelectItem value="Science">
                                                            Science
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit">
                                                    Add Student
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                        <StudentsList classrooms={classrooms} />
                    </div>
                </TabsContent>

                <TabsContent value="co-teachers" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Co-Teacher Management</CardTitle>
                            <CardDescription>
                                Share access to your classes with other
                                teachers. Each co-teacher counts as one seat in
                                your plan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CoTeachersList classrooms={classrooms} />
                        </CardContent>
                        <CardFooter className="flex justify-between border-t px-6 py-4">
                            <div className="text-sm text-muted-foreground">
                                <Users className="mr-2 inline-block h-4 w-4" />
                                Using{" "}
                                {classrooms.reduce(
                                    (sum, cls) => sum + cls.coTeacherIds.length,
                                    0
                                )}{" "}
                                of 5 available seats
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Co-Teacher
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Add Co-Teacher
                                        </DialogTitle>
                                        <DialogDescription>
                                            Enter the email address of the
                                            teacher you want to invite as a
                                            co-teacher for this class.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form
                                        onSubmit={handleAddCoTeacher}
                                        className="grid gap-4 py-4"
                                    >
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="name"
                                                className="text-right"
                                            >
                                                Name
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="Jane Doe"
                                                className="col-span-3"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="email"
                                                className="text-right"
                                            >
                                                Email
                                            </Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="teacher@school.edu"
                                                className="col-span-3"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="class"
                                                className="text-right"
                                            >
                                                Class
                                            </Label>
                                            <Select
                                                value={selectedCoTeacherClass}
                                                onValueChange={
                                                    setSelectedCoTeacherClass
                                                }
                                            >
                                                <SelectTrigger
                                                    id="class"
                                                    name="class"
                                                    className="col-span-3"
                                                >
                                                    <SelectValue placeholder="Select a class" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        All Classes
                                                    </SelectItem>
                                                    <SelectItem value="English">
                                                        English
                                                    </SelectItem>
                                                    <SelectItem value="History">
                                                        History
                                                    </SelectItem>
                                                    <SelectItem value="Math">
                                                        Math
                                                    </SelectItem>
                                                    <SelectItem value="Science">
                                                        Science
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit">
                                                Send Invitation
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
