"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { Classroom } from "@/types/classRoom"
import { ClassRoomUseCases } from "@/use-cases/class-room-use-case"
import { HttpClassRoomRepository } from "@/repositories/classRoom-repository"

interface CoTeacher {
    id: string
    name: string
    email: string
    role: string
    status: string
    classroomIds: string[]
}

interface CoTeachersListProps {
    classrooms: Classroom[]
}

export function CoTeachersList({ classrooms }: CoTeachersListProps) {
    const { toast } = useToast()
    const [coTeachers, setCoTeachers] = useState<CoTeacher[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [classFilter, setClassFilter] = useState("all")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const classRoomUseCases = new ClassRoomUseCases(
        new HttpClassRoomRepository()
    )

    useEffect(() => {
        async function fetchCoTeachers() {
            try {
                setLoading(true)
                const response = await classRoomUseCases.getCoTeachers(
                    classFilter !== "all" ? classFilter : undefined
                )
                if (!response.success)
                    throw new Error("Failed to fetch co-teachers")
                setCoTeachers(response.data)
            } catch (err: any) {
                setError(err.message)
                toast({
                    title: "Error",
                    description:
                        "Failed to load co-teachers. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }
        fetchCoTeachers()
    }, [classFilter, toast])

    const filteredTeachers = coTeachers.filter(
        (teacher) =>
            teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search co-teachers..."
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

            {loading && <p>Loading co-teachers...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && filteredTeachers.length === 0 && (
                <p>No co-teachers found.</p>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Classes</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTeachers.map((teacher) => (
                            <TableRow key={teacher.id}>
                                <TableCell className="font-medium">
                                    {teacher.name}
                                </TableCell>
                                <TableCell>{teacher.email}</TableCell>
                                <TableCell>{teacher.role}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            teacher.status.toLowerCase() ===
                                            "active"
                                                ? "default"
                                                : "outline"
                                        }
                                    >
                                        {teacher.status
                                            .charAt(0)
                                            .toUpperCase() +
                                            teacher.status.slice(1)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {teacher.classroomIds.map((id) => {
                                            const cls = classrooms.find(
                                                (c) => c.id === id
                                            )
                                            return (
                                                <Badge
                                                    key={id}
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {cls
                                                        ? `${cls.name} (${cls.code})`
                                                        : id}
                                                </Badge>
                                            )
                                        })}
                                    </div>
                                </TableCell>
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
                                                Edit Access
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                Resend Invitation
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
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
