"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
    Home,
    MessageSquarePlus,
    FileText,
    Bell,
    User,
    LogOut,
    Menu,
    Moon,
    Sun,
    Settings,
    GraduationCap,
    Calendar,
    BookOpen,
    Library,
    Building2,
    Wrench,
    Briefcase,
    FlaskConical,
    Printer,
    Users,
    FileQuestion,
    Grid3X3,
    ChevronRight,
    LayoutDashboard,
} from "lucide-react";
import { useTheme } from "next-themes";
import type { Profile } from "@/types";

// UTP Systems Navigation
const utpSystems = [
    {
        category: "Main",
        items: [
            { name: "Gateway", href: "/student/gateway", icon: Grid3X3, color: "text-blue-500" },
            { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard, color: "text-gray-500" },
        ]
    },
    {
        category: "Academic",
        items: [
            { name: "UCampus", href: "/student/ucampus", icon: GraduationCap, color: "text-blue-600", description: "Academic Records" },
            { name: "USchedule", href: "/student/uschedule", icon: Calendar, color: "text-green-600", description: "Timetable" },
            { name: "ULearn", href: "/student/ulearn", icon: BookOpen, color: "text-purple-600", description: "Learning" },
        ]
    },
    {
        category: "Resources",
        items: [
            { name: "ULibrary", href: "/student/ulibrary", icon: Library, color: "text-amber-600", description: "Library" },
            { name: "UBooking", href: "/student/ubooking", icon: Building2, color: "text-cyan-600", description: "Room Booking" },
            { name: "UFacility", href: "/student/ufacility", icon: Wrench, color: "text-orange-600", description: "Facilities" },
        ]
    },
    {
        category: "Career",
        items: [
            { name: "UCareer", href: "/student/ucareer", icon: Briefcase, color: "text-indigo-600", description: "Jobs" },
            { name: "ULab", href: "/student/ulab", icon: FlaskConical, color: "text-red-600", description: "Labs" },
        ]
    },
    {
        category: "Services",
        items: [
            { name: "UCS", href: "/student/new-report", icon: MessageSquarePlus, color: "text-yellow-600", description: "Support" },
            { name: "UPrint", href: "/student/uprint", icon: Printer, color: "text-gray-600", description: "Printing" },
            { name: "UPast", href: "/student/upast", icon: FileQuestion, color: "text-pink-600", description: "Past Papers" },
            { name: "UNexus", href: "/student/unexus", icon: Users, color: "text-teal-600", description: "Community" },
        ]
    }
];

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (data) setProfile(data as Profile);

                const { count } = await supabase
                    .from("notifications")
                    .select("*", { count: "exact", head: true })
                    .eq("user_id", user.id)
                    .eq("is_read", false);

                setUnreadCount(count || 0);
            }
        };

        fetchProfile();
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        toast.success("Logged out successfully");
        router.push("/login");
    };

    const getInitials = (name: string | null) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {/* Sidebar - Desktop */}
            <aside className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 border-r transition-all duration-300`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b">
                    <Link href="/student/gateway" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#003DA5] to-[#0066CC] rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-sm font-bold text-white">UTP</span>
                        </div>
                        {!sidebarCollapsed && (
                            <span className="font-bold text-lg bg-gradient-to-r from-[#003DA5] to-[#0066CC] bg-clip-text text-transparent">
                                Portal
                            </span>
                        )}
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="h-8 w-8">
                        <ChevronRight className={`h-4 w-4 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
                    </Button>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 py-4">
                    <nav className="space-y-6 px-2">
                        {utpSystems.map((section) => (
                            <div key={section.category}>
                                {!sidebarCollapsed && (
                                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        {section.category}
                                    </p>
                                )}
                                <div className="space-y-1">
                                    {section.items.map((item) => {
                                        const active = isActive(item.href);
                                        return (
                                            <Link key={item.name} href={item.href}>
                                                <Button
                                                    variant={active ? "secondary" : "ghost"}
                                                    className={`w-full ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'} gap-3 ${active ? 'bg-primary/10 text-primary' : ''}`}
                                                    title={sidebarCollapsed ? item.name : undefined}
                                                >
                                                    <item.icon className={`h-5 w-5 ${active ? 'text-primary' : item.color}`} />
                                                    {!sidebarCollapsed && (
                                                        <span className="truncate">{item.name}</span>
                                                    )}
                                                </Button>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </ScrollArea>

                {/* User Section */}
                <div className="border-t p-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} gap-3 h-12`}>
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={profile?.avatar_url || ""} />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                        {getInitials(profile?.full_name ?? null)}
                                    </AvatarFallback>
                                </Avatar>
                                {!sidebarCollapsed && (
                                    <div className="flex flex-col items-start text-left">
                                        <span className="text-sm font-medium truncate max-w-[140px]">{profile?.full_name || "User"}</span>
                                        <span className="text-xs text-muted-foreground truncate max-w-[140px]">{profile?.student_id || "Student"}</span>
                                    </div>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/student/profile" className="flex items-center gap-2">
                                    <User className="h-4 w-4" /> Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/student/settings" className="flex items-center gap-2">
                                    <Settings className="h-4 w-4" /> Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/student/notifications" className="flex items-center gap-2">
                                    <Bell className="h-4 w-4" /> Notifications
                                    {unreadCount > 0 && <Badge variant="destructive" className="ml-auto">{unreadCount}</Badge>}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                                {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                                {theme === "dark" ? "Light Mode" : "Dark Mode"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                                <LogOut className="mr-2 h-4 w-4" /> Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} transition-all duration-300`}>
                {/* Top Bar - Mobile & Desktop */}
                <header className="sticky top-0 z-40 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b flex items-center justify-between px-4 lg:px-6">
                    {/* Mobile Menu */}
                    <div className="flex items-center gap-3 lg:hidden">
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72 p-0">
                                <div className="h-16 flex items-center px-4 border-b">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#003DA5] to-[#0066CC] rounded-xl flex items-center justify-center">
                                        <span className="text-sm font-bold text-white">UTP</span>
                                    </div>
                                    <span className="ml-2 font-bold text-lg">Portal</span>
                                </div>
                                <ScrollArea className="h-[calc(100vh-4rem)]">
                                    <nav className="p-4 space-y-6">
                                        {utpSystems.map((section) => (
                                            <div key={section.category}>
                                                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                                    {section.category}
                                                </p>
                                                <div className="space-y-1">
                                                    {section.items.map((item) => {
                                                        const active = isActive(item.href);
                                                        return (
                                                            <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                                                                <Button
                                                                    variant={active ? "secondary" : "ghost"}
                                                                    className={`w-full justify-start gap-3 ${active ? 'bg-primary/10 text-primary' : ''}`}
                                                                >
                                                                    <item.icon className={`h-5 w-5 ${active ? 'text-primary' : item.color}`} />
                                                                    {item.name}
                                                                </Button>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </nav>
                                </ScrollArea>
                            </SheetContent>
                        </Sheet>
                        <Link href="/student/gateway">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#003DA5] to-[#0066CC] rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-white">UTP</span>
                            </div>
                        </Link>
                    </div>

                    {/* Page Title - Desktop */}
                    <div className="hidden lg:block">
                        <h1 className="text-lg font-semibold text-foreground">
                            {/* Dynamic title based on route */}
                        </h1>
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-2">
                        <Link href="/student/notifications">
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </Button>

                        {/* Mobile Profile */}
                        <div className="lg:hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={profile?.avatar_url || ""} />
                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                {getInitials(profile?.full_name ?? null)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col">
                                            <span>{profile?.full_name || "User"}</span>
                                            <span className="text-xs text-muted-foreground">{profile?.email}</span>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/student/profile"><User className="mr-2 h-4 w-4" /> Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/student/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                        <LogOut className="mr-2 h-4 w-4" /> Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
