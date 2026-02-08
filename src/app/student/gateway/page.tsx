"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
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
    Mail,
    MessageSquarePlus,
    Sparkles,
    ExternalLink,
    Star,
} from "lucide-react";

const systems = [
    {
        name: "UCampus",
        description: "Academic records, grades, transcripts, course registration",
        href: "/student/ucampus",
        icon: GraduationCap,
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-500/10",
        status: "active",
        featured: true,
    },
    {
        name: "USchedule",
        description: "Class timetable, schedule builder, room finder",
        href: "/student/uschedule",
        icon: Calendar,
        color: "from-green-500 to-green-600",
        bgColor: "bg-green-500/10",
        status: "active",
        featured: true,
    },
    {
        name: "ULearn",
        description: "Online courses, video lectures, quizzes, assignments",
        href: "/student/ulearn",
        icon: BookOpen,
        color: "from-purple-500 to-purple-600",
        bgColor: "bg-purple-500/10",
        status: "active",
        featured: true,
    },
    {
        name: "ULibrary",
        description: "Digital library, e-books, journals, research databases",
        href: "/student/ulibrary",
        icon: Library,
        color: "from-amber-500 to-amber-600",
        bgColor: "bg-amber-500/10",
        status: "active",
    },
    {
        name: "UBooking",
        description: "Room booking, facility reservation, event spaces",
        href: "/student/ubooking",
        icon: Building2,
        color: "from-cyan-500 to-cyan-600",
        bgColor: "bg-cyan-500/10",
        status: "active",
    },
    {
        name: "UCS",
        description: "AI-powered customer support, report issues, track tickets",
        href: "/student/new-report",
        icon: MessageSquarePlus,
        color: "from-yellow-500 to-orange-500",
        bgColor: "bg-yellow-500/10",
        status: "active",
        featured: true,
    },
    {
        name: "UFacility",
        description: "Maintenance requests, facility issues reporting",
        href: "/student/ufacility",
        icon: Wrench,
        color: "from-orange-500 to-orange-600",
        bgColor: "bg-orange-500/10",
        status: "active",
    },
    {
        name: "UCareer",
        description: "Job listings, internships, career development",
        href: "/student/ucareer",
        icon: Briefcase,
        color: "from-indigo-500 to-indigo-600",
        bgColor: "bg-indigo-500/10",
        status: "active",
    },
    {
        name: "ULab",
        description: "Laboratory booking, equipment reservation",
        href: "/student/ulab",
        icon: FlaskConical,
        color: "from-red-500 to-red-600",
        bgColor: "bg-red-500/10",
        status: "active",
    },
    {
        name: "UPrint",
        description: "Print services, document printing, quota management",
        href: "/student/uprint",
        icon: Printer,
        color: "from-gray-500 to-gray-600",
        bgColor: "bg-gray-500/10",
        status: "active",
    },
    {
        name: "UPast",
        description: "Past year examination papers archive",
        href: "/student/upast",
        icon: FileQuestion,
        color: "from-pink-500 to-pink-600",
        bgColor: "bg-pink-500/10",
        status: "active",
    },
    {
        name: "UNexus",
        description: "Campus community, events, student groups",
        href: "/student/unexus",
        icon: Users,
        color: "from-teal-500 to-teal-600",
        bgColor: "bg-teal-500/10",
        status: "active",
    },
    {
        name: "UTP Email",
        description: "University email communication",
        href: "https://outlook.office.com",
        icon: Mail,
        color: "from-blue-400 to-blue-500",
        bgColor: "bg-blue-400/10",
        status: "external",
        external: true,
    },
];

export default function GatewayPage() {
    const featuredSystems = systems.filter(s => s.featured);
    const otherSystems = systems.filter(s => !s.featured);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <Sparkles className="h-4 w-4" />
                    UTP Super Portal
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                    Welcome to UTP Gateway
                </h1>
                <p className="text-muted-foreground text-lg">
                    Access all university services in one place. Everything you need for your academic journey.
                </p>
            </div>

            {/* Featured Systems */}
            <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Featured Services
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {featuredSystems.map((system) => (
                        <Link key={system.name} href={system.href}>
                            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 group">
                                <CardHeader className="pb-2">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${system.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                                        <system.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        {system.name}
                                        <Badge variant="secondary" className="text-xs">Featured</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-sm">
                                        {system.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            {/* All Services Grid */}
            <div>
                <h2 className="text-lg font-semibold mb-4">All Services</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {otherSystems.map((system) => (
                        <Link
                            key={system.name}
                            href={system.href}
                            target={system.external ? "_blank" : undefined}
                            rel={system.external ? "noopener noreferrer" : undefined}
                        >
                            <Card className="h-full hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer">
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <div className={`w-12 h-12 rounded-xl ${system.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                        <system.icon className={`h-6 w-6 bg-gradient-to-br ${system.color} bg-clip-text`} style={{ color: system.color.includes('blue') ? '#3b82f6' : system.color.includes('green') ? '#22c55e' : system.color.includes('purple') ? '#a855f7' : system.color.includes('amber') ? '#f59e0b' : system.color.includes('cyan') ? '#06b6d4' : system.color.includes('orange') ? '#f97316' : system.color.includes('indigo') ? '#6366f1' : system.color.includes('red') ? '#ef4444' : system.color.includes('gray') ? '#6b7280' : system.color.includes('pink') ? '#ec4899' : system.color.includes('teal') ? '#14b8a6' : '#3b82f6' }} />
                                    </div>
                                    <h3 className="font-semibold text-sm flex items-center gap-1">
                                        {system.name}
                                        {system.external && <ExternalLink className="h-3 w-3" />}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {system.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600">15+</p>
                        <p className="text-sm text-muted-foreground">Services Available</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">24/7</p>
                        <p className="text-sm text-muted-foreground">AI Support</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-purple-600">100%</p>
                        <p className="text-sm text-muted-foreground">Integrated</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/20">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-amber-600">1</p>
                        <p className="text-sm text-muted-foreground">Login Needed</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
