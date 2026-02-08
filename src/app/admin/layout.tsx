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
import { useTheme } from "next-themes";
import {
    LayoutDashboard,
    Ticket,
    MessageSquare,
    Building2,
    Users,
    BookOpen,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    Moon,
    Sun,
    ChevronRight,
    Bell,
    GraduationCap,
    Book,
    FlaskConical,
    Calendar,
    CreditCard,
} from "lucide-react";
import type { Profile } from "@/types";

const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Academic", href: "/admin/academic", icon: GraduationCap },
    { name: "Library", href: "/admin/library", icon: Book },
    { name: "Labs", href: "/admin/labs", icon: FlaskConical },
    { name: "Facilities", href: "/admin/facilities", icon: Building2 },
    { name: "Events", href: "/admin/events", icon: Calendar },
    { name: "Finance", href: "/admin/finance", icon: CreditCard },
    { name: "Tickets", href: "/admin/tickets", icon: Ticket },
    { name: "Live Chat", href: "/admin/live-chat", icon: MessageSquare },
    { name: "Staff", href: "/admin/staff", icon: Users },
    { name: "Knowledge Base", href: "/admin/knowledge-base", icon: BookOpen },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        if (!name) return "A";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            super_admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
            department_admin: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            support_agent: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        };
        return colors[role] || colors.support_agent;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar - Desktop */}
            <aside className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col ${collapsed ? "lg:w-20" : "lg:w-64"
                } transition-all duration-300`}>
                <div className="flex flex-col flex-1 bg-white dark:bg-gray-800 border-r">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-4 border-b">
                        <Link href="/admin/dashboard" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#003DA5] rounded-xl flex items-center justify-center shrink-0">
                                <span className="text-sm font-bold text-white">UTP</span>
                            </div>
                            {!collapsed && (
                                <div>
                                    <span className="font-semibold text-foreground">Admin</span>
                                    <p className="text-xs text-muted-foreground">Support System</p>
                                </div>
                            )}
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCollapsed(!collapsed)}
                            className="hidden lg:flex"
                        >
                            <ChevronRight className={`h-4 w-4 transition-transform ${collapsed ? "" : "rotate-180"}`} />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <ScrollArea className="flex-1 py-4">
                        <nav className="space-y-1 px-3">
                            {navigation.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link key={item.name} href={item.href}>
                                        <Button
                                            variant={isActive ? "secondary" : "ghost"}
                                            className={`w-full ${collapsed ? "justify-center" : "justify-start"} gap-3 ${isActive ? "bg-primary/10 text-primary" : ""
                                                }`}
                                            title={collapsed ? item.name : undefined}
                                        >
                                            <item.icon className="h-5 w-5 shrink-0" />
                                            {!collapsed && <span>{item.name}</span>}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </nav>
                    </ScrollArea>

                    {/* User Info */}
                    <div className="p-4 border-t">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className={`w-full ${collapsed ? "justify-center p-2" : "justify-start"} gap-3 h-auto`}>
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={profile?.avatar_url || ""} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                            {getInitials(profile?.full_name ?? null)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {!collapsed && (
                                        <div className="flex-1 text-left">
                                            <p className="text-sm font-medium truncate">{profile?.full_name || "Admin"}</p>
                                            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                                        </div>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">{profile?.full_name || "Admin"}</p>
                                        <Badge className={getRoleBadge(profile?.role || "support_agent")}>
                                            {profile?.role?.replace("_", " ")}
                                        </Badge>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                                    {theme === "dark" ? (
                                        <>
                                            <Sun className="mr-2 h-4 w-4" />
                                            Light Mode
                                        </>
                                    ) : (
                                        <>
                                            <Moon className="mr-2 h-4 w-4" />
                                            Dark Mode
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden sticky top-0 z-50 glass border-b">
                <div className="flex items-center justify-between h-16 px-4">
                    <div className="flex items-center gap-3">
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72 p-0">
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center gap-3 h-16 px-4 border-b">
                                        <div className="w-10 h-10 bg-[#003DA5] rounded-xl flex items-center justify-center">
                                            <span className="text-sm font-bold text-white">UTP</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-foreground">Admin</span>
                                            <p className="text-xs text-muted-foreground">Support System</p>
                                        </div>
                                    </div>
                                    <ScrollArea className="flex-1 py-4">
                                        <nav className="space-y-1 px-3">
                                            {navigation.map((item) => {
                                                const isActive = pathname.startsWith(item.href);
                                                return (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        onClick={() => setMobileMenuOpen(false)}
                                                    >
                                                        <Button
                                                            variant={isActive ? "secondary" : "ghost"}
                                                            className={`w-full justify-start gap-3 ${isActive ? "bg-primary/10 text-primary" : ""
                                                                }`}
                                                        >
                                                            <item.icon className="h-5 w-5" />
                                                            {item.name}
                                                        </Button>
                                                    </Link>
                                                );
                                            })}
                                        </nav>
                                    </ScrollArea>
                                </div>
                            </SheetContent>
                        </Sheet>
                        <Link href="/admin/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#003DA5] rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-white">UTP</span>
                            </div>
                            <span className="font-semibold text-foreground">Admin</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                            <Bell className="h-5 w-5" />
                        </Button>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={profile?.avatar_url || ""} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {getInitials(profile?.full_name ?? null)}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className={`${collapsed ? "lg:pl-20" : "lg:pl-64"} transition-all duration-300`}>
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
