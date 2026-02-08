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
} from "lucide-react";
import { useTheme } from "next-themes";
import type { Profile } from "@/types";

const navigation = [
    { name: "Dashboard", href: "/student/dashboard", icon: Home },
    { name: "New Report", href: "/student/new-report", icon: MessageSquarePlus },
    { name: "My Reports", href: "/student/my-reports", icon: FileText },
    { name: "Notifications", href: "/student/notifications", icon: Bell },
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

                // Get unread notifications count
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
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 glass border-b">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <Link href="/student/dashboard" className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#003DA5] rounded-xl flex items-center justify-center">
                                    <span className="text-sm font-bold text-white">UTP</span>
                                </div>
                                <span className="hidden sm:block font-semibold text-foreground">
                                    Support
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link key={item.name} href={item.href}>
                                        <Button
                                            variant={isActive ? "secondary" : "ghost"}
                                            className={`gap-2 ${isActive ? "bg-primary/10 text-primary" : ""}`}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.name}
                                            {item.name === "Notifications" && unreadCount > 0 && (
                                                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                                    {unreadCount > 9 ? "9+" : unreadCount}
                                                </Badge>
                                            )}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right Side */}
                        <div className="flex items-center gap-2">
                            {/* Theme Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="hidden sm:flex"
                            >
                                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            </Button>

                            {/* Profile Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={profile?.avatar_url || ""} />
                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                {getInitials(profile?.full_name ?? null)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
                                            <p className="text-xs text-muted-foreground">{profile?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/student/profile" className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/student/settings" className="flex items-center gap-2">
                                            <Settings className="h-4 w-4" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Mobile Menu Button */}
                            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="md:hidden">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-72">
                                    <div className="flex flex-col gap-4 mt-8">
                                        {navigation.map((item) => {
                                            const isActive = pathname === item.href;
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <Button
                                                        variant={isActive ? "secondary" : "ghost"}
                                                        className={`w-full justify-start gap-3 ${isActive ? "bg-primary/10 text-primary" : ""}`}
                                                    >
                                                        <item.icon className="h-5 w-5" />
                                                        {item.name}
                                                        {item.name === "Notifications" && unreadCount > 0 && (
                                                            <Badge variant="destructive" className="ml-auto">
                                                                {unreadCount}
                                                            </Badge>
                                                        )}
                                                    </Button>
                                                </Link>
                                            );
                                        })}
                                        <hr className="my-2" />
                                        <Button
                                            variant="ghost"
                                            className="justify-start gap-3"
                                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                        >
                                            {theme === "dark" ? (
                                                <>
                                                    <Sun className="h-5 w-5" />
                                                    Light Mode
                                                </>
                                            ) : (
                                                <>
                                                    <Moon className="h-5 w-5" />
                                                    Dark Mode
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
