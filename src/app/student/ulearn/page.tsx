"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    BookOpen,
    Search,
    Clock,
    Calendar,
    ChevronRight,
    Star,
    FileText,
    Video,
    MessageSquare,
    Users,
    Play,
    Bell,
    Filter,
} from "lucide-react";

// Complete course data
const enrolledCourses = [
    {
        id: "1",
        code: "CSC1101",
        title: "Introduction to Programming",
        instructor: "Dr. Ahmad Ibrahim",
        progress: 65,
        modules: 4,
        completedModules: 2,
        nextDeadline: "Lab 3 - Feb 20",
        color: "from-blue-500 to-indigo-600",
        unreadAnnouncements: 2,
    },
    {
        id: "2",
        code: "CSC1102",
        title: "Data Structures & Algorithms",
        instructor: "Dr. Farid Hassan",
        progress: 45,
        modules: 5,
        completedModules: 2,
        nextDeadline: "Quiz 2 - Feb 15",
        color: "from-green-500 to-emerald-600",
        unreadAnnouncements: 1,
    },
    {
        id: "3",
        code: "MTH1201",
        title: "Linear Algebra",
        instructor: "Prof. Siti Aminah",
        progress: 30,
        modules: 6,
        completedModules: 1,
        nextDeadline: "Assignment 2 - Feb 18",
        color: "from-purple-500 to-violet-600",
        unreadAnnouncements: 0,
    },
    {
        id: "4",
        code: "CSC1203",
        title: "Computer Architecture",
        instructor: "Dr. Lee Wei Ming",
        progress: 20,
        modules: 5,
        completedModules: 1,
        nextDeadline: "Lab Report - Feb 22",
        color: "from-orange-500 to-red-600",
        unreadAnnouncements: 0,
    },
    {
        id: "5",
        code: "MPU3123",
        title: "Tamadun Islam dan Asia",
        instructor: "Dr. Nor Aziah",
        progress: 55,
        modules: 4,
        completedModules: 2,
        nextDeadline: "Essay - Feb 25",
        color: "from-teal-500 to-cyan-600",
        unreadAnnouncements: 1,
    },
];

const upcomingDeadlines = [
    { id: "1", course: "CSC1102", title: "Quiz 2: Stacks and Queues", type: "quiz", due: "Feb 15, 2:00 PM", urgent: true },
    { id: "2", course: "MTH1201", title: "Assignment 2: Matrix Operations", type: "assignment", due: "Feb 18, 11:59 PM", urgent: false },
    { id: "3", course: "CSC1101", title: "Lab 3: Data Manipulation", type: "assignment", due: "Feb 20, 11:59 PM", urgent: false },
    { id: "4", course: "CSC1203", title: "Lab Report: CPU Simulation", type: "assignment", due: "Feb 22, 11:59 PM", urgent: false },
    { id: "5", course: "MPU3123", title: "Essay: Cultural Impact", type: "assignment", due: "Feb 25, 11:59 PM", urgent: false },
];

const recentActivity = [
    { id: "1", type: "grade", course: "CSC1101", title: "Lab 2 graded", detail: "Score: 88/100", time: "2 hours ago" },
    { id: "2", type: "announcement", course: "CSC1102", title: "New announcement", detail: "Tree Assignment Released", time: "5 hours ago" },
    { id: "3", type: "submission", course: "CSC1102", title: "Assignment submitted", detail: "Lab 2: Linked List", time: "1 day ago" },
    { id: "4", type: "grade", course: "MTH1201", title: "Quiz 1 graded", detail: "Score: 75/100", time: "2 days ago" },
    { id: "5", type: "forum", course: "CSC1101", title: "New reply to your post", detail: "Lab Help & Questions", time: "3 days ago" },
];

export default function ULearnPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("courses");

    const filteredCourses = enrolledCourses.filter(
        (course) =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalProgress = Math.round(
        enrolledCourses.reduce((acc, c) => acc + c.progress, 0) / enrolledCourses.length
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">ULearn</h1>
                        <p className="text-muted-foreground">Learning Management System</p>
                    </div>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{enrolledCourses.length}</p>
                            <p className="text-xs text-muted-foreground">Enrolled Courses</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <Star className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{totalProgress}%</p>
                            <p className="text-xs text-muted-foreground">Overall Progress</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{upcomingDeadlines.length}</p>
                            <p className="text-xs text-muted-foreground">Pending Tasks</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <Bell className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{enrolledCourses.reduce((a, c) => a + c.unreadAnnouncements, 0)}</p>
                            <p className="text-xs text-muted-foreground">Unread</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Urgent Deadlines Alert */}
            {upcomingDeadlines.some(d => d.urgent) && (
                <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-red-700 dark:text-red-400">Urgent Deadline</p>
                                {upcomingDeadlines.filter(d => d.urgent).map((d) => (
                                    <p key={d.id} className="text-sm text-muted-foreground">
                                        {d.course}: {d.title} - Due {d.due}
                                    </p>
                                ))}
                            </div>
                            <Button variant="destructive" size="sm">View</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="courses">My Courses</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                    <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                </TabsList>

                {/* Courses Tab */}
                <TabsContent value="courses" className="space-y-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCourses.map((course) => (
                            <Link key={course.id} href={`/student/ulearn/${course.id}`}>
                                <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                                    <div className={`h-24 bg-gradient-to-br ${course.color} rounded-t-lg flex items-center justify-center relative`}>
                                        <BookOpen className="h-10 w-10 text-white/80" />
                                        {course.unreadAnnouncements > 0 && (
                                            <Badge className="absolute top-2 right-2 bg-red-500">{course.unreadAnnouncements} new</Badge>
                                        )}
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <Badge variant="outline">{course.code}</Badge>
                                        </div>
                                        <h3 className="font-semibold mb-1">{course.title}</h3>
                                        <p className="text-sm text-muted-foreground mb-3">{course.instructor}</p>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="font-medium">{course.progress}%</span>
                                            </div>
                                            <Progress value={course.progress} className="h-2" />
                                        </div>

                                        <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                {course.completedModules}/{course.modules} modules
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {course.nextDeadline}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </TabsContent>

                {/* Calendar Tab */}
                <TabsContent value="calendar" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Deadlines</CardTitle>
                            <CardDescription>All pending assignments and quizzes</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {upcomingDeadlines.map((deadline) => (
                                <div key={deadline.id} className={`p-3 rounded-lg border flex items-center gap-4 ${deadline.urgent ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20' : 'bg-muted/50'}`}>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${deadline.type === 'quiz' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                                        }`}>
                                        {deadline.type === 'quiz' ? (
                                            <Star className="h-5 w-5 text-purple-600" />
                                        ) : (
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{deadline.course}</Badge>
                                            {deadline.urgent && <Badge variant="destructive">Urgent</Badge>}
                                        </div>
                                        <p className="font-medium">{deadline.title}</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {deadline.due}
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Your latest course activities</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.type === 'grade' ? 'bg-green-100 dark:bg-green-900/30' :
                                            activity.type === 'announcement' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                                activity.type === 'submission' ? 'bg-purple-100 dark:bg-purple-900/30' :
                                                    'bg-orange-100 dark:bg-orange-900/30'
                                        }`}>
                                        {activity.type === 'grade' && <Star className="h-5 w-5 text-green-600" />}
                                        {activity.type === 'announcement' && <Bell className="h-5 w-5 text-blue-600" />}
                                        {activity.type === 'submission' && <FileText className="h-5 w-5 text-purple-600" />}
                                        {activity.type === 'forum' && <MessageSquare className="h-5 w-5 text-orange-600" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline">{activity.course}</Badge>
                                            <span className="text-xs text-muted-foreground">{activity.time}</span>
                                        </div>
                                        <p className="font-medium text-sm">{activity.title}</p>
                                        <p className="text-sm text-muted-foreground">{activity.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
