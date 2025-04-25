"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/toast"
import { Classroom } from "@/types/classRoom"
import { ClassRoomUseCases } from "@/use-cases/class-room-use-case"
import { HttpClassRoomRepository } from "@/repositories/classRoom-repository"

interface Student {
    id: string
    name: string
    email: string
    classroomIds: string[]
    submissions: number
    lastActive: string
}

interface StudentsListProps {
    classrooms: Classroom[]
}

export function StudentsList({ classrooms }: StudentsListProps) {
    const { toast } = useToast()
    const [students, setStudents] = useState<Student[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [classFilter, setClassFilter] = useState("all")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const classRoomUseCases = new ClassRoomUseCases(
        new HttpClassRoomRepository()
    )

    useEffect(() => {
        async function fetchStudents() {
            try {
                setLoading(true)
                const response = await classRoomUseCases.getStudents(
                    classFilter !== "all" ? classFilter : undefined
                )
               
                
                if (!response.success)
                    throw new Error("Failed to fetch students")

                console.log("the students are ", response.data)
                
                setStudents(response.data)
            } catch (err: any) {
                setError(err.message)
                toast({
                    title: "Error",
                    description: "Failed to load students. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }
        fetchStudents()
    }, [classFilter, toast])

    const filteredStudents = students.filter(
        (student) =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search students..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by class" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classrooms.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                                {cls.name} ({cls.code})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {loading && <p>Loading students...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && filteredStudents.length === 0 && (
                <p>No students found.</p>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]">
                                <Checkbox />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Submissions</TableHead>
                            <TableHead>Last Active</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell>
                                    <Checkbox />
                                </TableCell>
                                <TableCell className="font-medium">
                                    {student.name}
                                </TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>
                                    {student.classroomIds
                                        .map(
                                            (id) =>
                                                classrooms.find(
                                                    (cls) => cls.id === id
                                                )?.name || id
                                        )
                                        .join(", ")}
                                </TableCell>
                                <TableCell>{student.submissions}</TableCell>
                                <TableCell>{student.lastActive}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                            >
                                                <span className="sr-only">
                                                    Open menu
                                                </span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>
                                                Actions
                                            </DropdownMenuLabel>
                                            <DropdownMenuItem>
                                                View Profile
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                View Submissions
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">
                                                Remove
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
