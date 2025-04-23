"use client"

import { useState, useEffect } from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookOpen, FileText, LogOut, Menu, Users, Link2, MessageSquare } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { FreeTrialBanner } from "@/components/free-trial-banner"
import { Logo } from "@/components/logo"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIsMobile()

    // Add event listener
    window.addEventListener("resize", checkIsMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  // Redirect from dashboard root to assignments
  useEffect(() => {
    if (pathname === "/dashboard") {
      window.location.href = "/dashboard/assignments"
    }
  }, [pathname])

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed)
  }

  const NavItems = () => (
    <>
      <Button
        variant="ghost"
        className={cn(
          "justify-start hover:bg-primary hover:text-white w-full",
          isSidebarCollapsed && "justify-center px-2",
        )}
        asChild
      >
        <Link href="/dashboard/courses">
          <BookOpen className={cn("h-4 w-4", isSidebarCollapsed ? "mr-0" : "mr-2")} />
          {!isSidebarCollapsed && <span>Courses</span>}
        </Link>
      </Button>
      <Button
        variant="ghost"
        className={cn(
          "justify-start hover:bg-primary hover:text-white w-full",
          isSidebarCollapsed && "justify-center px-2",
        )}
        asChild
      >
        <Link href="/dashboard/assignments">
          <FileText className={cn("h-4 w-4", isSidebarCollapsed ? "mr-0" : "mr-2")} />
          {!isSidebarCollapsed && <span>Assignments</span>}
        </Link>
      </Button>
      <Button
        variant="ghost"
        className={cn(
          "justify-start hover:bg-primary hover:text-white w-full",
          isSidebarCollapsed && "justify-center px-2",
        )}
        asChild
      >
        <Link href="/dashboard/classroom">
          <Users className={cn("h-4 w-4", isSidebarCollapsed ? "mr-0" : "mr-2")} />
          {!isSidebarCollapsed && <span>Classroom</span>}
        </Link>
      </Button>
      <Button
        variant="ghost"
        className={cn(
          "justify-start hover:bg-primary hover:text-white w-full",
          isSidebarCollapsed && "justify-center px-2",
        )}
        asChild
      >
        <Link href="/dashboard/integrations">
          <Link2 className={cn("h-4 w-4", isSidebarCollapsed ? "mr-0" : "mr-2")} />
          {!isSidebarCollapsed && <span>Integrations</span>}
        </Link>
      </Button>
      <div className="mt-auto pt-4">
        <Button
          variant="ghost"
          className={cn(
            "justify-start hover:bg-primary hover:text-white w-full",
            isSidebarCollapsed && "justify-center px-2",
          )}
          asChild
        >
          <a href="https://gradegenie.hipporello.net/desk" target="_blank" rel="noopener noreferrer">
            <MessageSquare className={cn("h-4 w-4", isSidebarCollapsed ? "mr-0" : "mr-2")} />
            {!isSidebarCollapsed && <span>Feedback</span>}
          </a>
        </Button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <FreeTrialBanner daysRemaining={3} hoursRemaining={0} creditsRemaining={3} />
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            {isMobile ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                  <div className="flex h-full flex-col">
                    <div className="flex items-center border-b py-4">
                      <Logo size="md" />
                    </div>
                    <div className="flex flex-col space-y-1 p-4">
                      <NavItems />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ) : null}

            <Logo size="md" />
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="outline" size="sm" className="ml-auto h-8" asChild>
              <a href="https://gradegenie.hipporello.net/desk" target="_blank" rel="noopener noreferrer">
                <MessageSquare className="mr-2 h-4 w-4" />
                Feedback
              </a>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" alt="Professor" />
                    <AvatarFallback className="bg-primary/10 text-primary">PF</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="https://gradegenie.hipporello.net/desk" target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Feedback</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/login">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "flex-col border-r bg-secondary transition-all duration-300 ease-in-out",
            isMobile ? "hidden" : "flex",
            isSidebarCollapsed ? "w-[60px]" : "w-[240px]",
          )}
        >
          <div className="flex flex-col space-y-1 p-4 h-full relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -right-3 top-2 h-6 w-6 rounded-full border bg-background p-0"
              onClick={toggleSidebar}
            >
              {isSidebarCollapsed ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              )}
            </Button>
            <NavItems />
          </div>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
