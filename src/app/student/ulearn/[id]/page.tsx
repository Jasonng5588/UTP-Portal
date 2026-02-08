"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Play,
    CheckCircle,
    Circle,
    FileText,
    Video,
    Clock,
    Calendar,
    Star,
    Upload,
    Send,
    Download,
    Users,
    MessageSquare,
    Award,
    Lock,
    Unlock,
    AlertCircle,
} from "lucide-react";

// Full course data structure
const courseData: Record<string, {
    id: string;
    code: string;
    title: string;
    instructor: string;
    description: string;
    color: string;
    modules: {
        id: string;
        title: string;
        lessons: {
            id: string;
            title: string;
            type: "video" | "document" | "quiz" | "assignment";
            duration?: string;
            completed: boolean;
            locked: boolean;
        }[];
    }[];
    announcements: { id: string; title: string; content: string; date: string }[];
    assignments: { id: string; title: string; dueDate: string; status: "pending" | "submitted" | "graded"; grade?: string; maxGrade: string }[];
    quizzes: { id: string; title: string; questions: number; duration: string; attempts: number; maxAttempts: number; bestScore?: number }[];
    forums: { id: string; title: string; posts: number; lastPost: string }[];
}> = {
    "1": {
        id: "1",
        code: "CSC1101",
        title: "Introduction to Programming",
        instructor: "Dr. Ahmad Ibrahim",
        description: "Learn the fundamentals of programming using Python. This course covers variables, control structures, functions, and object-oriented programming concepts.",
        color: "from-blue-500 to-indigo-600",
        modules: [
            {
                id: "m1",
                title: "Module 1: Introduction to Programming Concepts",
                lessons: [
                    { id: "l1", title: "Welcome & Course Overview", type: "video", duration: "15 min", completed: true, locked: false },
                    { id: "l2", title: "Setting Up Python Environment", type: "document", duration: "10 min", completed: true, locked: false },
                    { id: "l3", title: "Your First Python Program", type: "video", duration: "25 min", completed: true, locked: false },
                    { id: "l4", title: "Module 1 Quiz", type: "quiz", duration: "20 min", completed: true, locked: false },
                ],
            },
            {
                id: "m2",
                title: "Module 2: Variables and Data Types",
                lessons: [
                    { id: "l5", title: "Understanding Variables", type: "video", duration: "20 min", completed: true, locked: false },
                    { id: "l6", title: "Numbers and Strings", type: "video", duration: "30 min", completed: true, locked: false },
                    { id: "l7", title: "Lists and Dictionaries", type: "video", duration: "35 min", completed: false, locked: false },
                    { id: "l8", title: "Practice Exercise: Data Types", type: "assignment", duration: "45 min", completed: false, locked: false },
                    { id: "l9", title: "Module 2 Quiz", type: "quiz", duration: "25 min", completed: false, locked: false },
                ],
            },
            {
                id: "m3",
                title: "Module 3: Control Structures",
                lessons: [
                    { id: "l10", title: "If-Else Statements", type: "video", duration: "25 min", completed: false, locked: false },
                    { id: "l11", title: "Loops: For and While", type: "video", duration: "30 min", completed: false, locked: true },
                    { id: "l12", title: "Nested Loops", type: "document", duration: "15 min", completed: false, locked: true },
                    { id: "l13", title: "Module 3 Quiz", type: "quiz", duration: "20 min", completed: false, locked: true },
                ],
            },
            {
                id: "m4",
                title: "Module 4: Functions",
                lessons: [
                    { id: "l14", title: "Defining Functions", type: "video", duration: "30 min", completed: false, locked: true },
                    { id: "l15", title: "Parameters and Return Values", type: "video", duration: "25 min", completed: false, locked: true },
                    { id: "l16", title: "Lab Assignment: Functions", type: "assignment", duration: "60 min", completed: false, locked: true },
                ],
            },
        ],
        announcements: [
            { id: "a1", title: "Mid-semester Test Schedule", content: "The mid-semester test will be held on March 15, 2025 at 2:00 PM in DK1. Please bring your student ID.", date: "Feb 8, 2025" },
            { id: "a2", title: "Lab 3 Deadline Extended", content: "Due to system issues, the deadline for Lab 3 has been extended to February 20, 2025.", date: "Feb 5, 2025" },
            { id: "a3", title: "Welcome to CSC1101", content: "Welcome to Introduction to Programming! Please review the syllabus and course expectations.", date: "Jan 15, 2025" },
        ],
        assignments: [
            { id: "as1", title: "Lab 1: Hello World Program", dueDate: "Jan 25, 2025", status: "graded", grade: "95", maxGrade: "100" },
            { id: "as2", title: "Lab 2: Calculator Program", dueDate: "Feb 5, 2025", status: "graded", grade: "88", maxGrade: "100" },
            { id: "as3", title: "Lab 3: Data Manipulation", dueDate: "Feb 20, 2025", status: "pending", maxGrade: "100" },
            { id: "as4", title: "Lab 4: Control Flow Exercises", dueDate: "Mar 5, 2025", status: "pending", maxGrade: "100" },
        ],
        quizzes: [
            { id: "q1", title: "Quiz 1: Programming Basics", questions: 20, duration: "30 min", attempts: 1, maxAttempts: 1, bestScore: 85 },
            { id: "q2", title: "Quiz 2: Variables & Data Types", questions: 25, duration: "30 min", attempts: 1, maxAttempts: 1, bestScore: 92 },
            { id: "q3", title: "Quiz 3: Control Structures", questions: 20, duration: "25 min", attempts: 0, maxAttempts: 1 },
        ],
        forums: [
            { id: "f1", title: "General Discussion", posts: 45, lastPost: "2 hours ago" },
            { id: "f2", title: "Lab Help & Questions", posts: 23, lastPost: "1 day ago" },
            { id: "f3", title: "Study Group", posts: 12, lastPost: "3 days ago" },
        ],
    },
    "2": {
        id: "2",
        code: "CSC1102",
        title: "Data Structures & Algorithms",
        instructor: "Dr. Farid Hassan",
        description: "Master fundamental data structures and algorithms for efficient problem solving.",
        color: "from-green-500 to-emerald-600",
        modules: [
            {
                id: "m1",
                title: "Module 1: Introduction to Data Structures",
                lessons: [
                    { id: "l1", title: "What are Data Structures?", type: "video", duration: "20 min", completed: true, locked: false },
                    { id: "l2", title: "Arrays and Linked Lists", type: "video", duration: "35 min", completed: true, locked: false },
                    { id: "l3", title: "Module 1 Quiz", type: "quiz", duration: "20 min", completed: true, locked: false },
                ],
            },
            {
                id: "m2",
                title: "Module 2: Stacks and Queues",
                lessons: [
                    { id: "l4", title: "Stack Operations", type: "video", duration: "25 min", completed: true, locked: false },
                    { id: "l5", title: "Queue Operations", type: "video", duration: "25 min", completed: false, locked: false },
                    { id: "l6", title: "Implementation Lab", type: "assignment", duration: "60 min", completed: false, locked: false },
                ],
            },
        ],
        announcements: [
            { id: "a1", title: "Tree Assignment Released", content: "The binary tree assignment is now available. Due date: March 1, 2025.", date: "Feb 7, 2025" },
        ],
        assignments: [
            { id: "as1", title: "Lab 1: Array Operations", dueDate: "Jan 30, 2025", status: "graded", grade: "90", maxGrade: "100" },
            { id: "as2", title: "Lab 2: Linked List", dueDate: "Feb 15, 2025", status: "submitted", maxGrade: "100" },
        ],
        quizzes: [
            { id: "q1", title: "Quiz 1: Basic Structures", questions: 15, duration: "25 min", attempts: 1, maxAttempts: 1, bestScore: 78 },
        ],
        forums: [
            { id: "f1", title: "General Discussion", posts: 32, lastPost: "5 hours ago" },
        ],
    },
};

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    const course = courseData[courseId];

    const [activeTab, setActiveTab] = useState("content");
    const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
    const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
    const [forumPost, setForumPost] = useState("");

    useEffect(() => {
        if (!course) return;
        // Find first incomplete lesson
        for (const module of course.modules) {
            for (const lesson of module.lessons) {
                if (!lesson.completed && !lesson.locked) {
                    setCurrentLessonId(lesson.id);
                    return;
                }
            }
        }
    }, [course]);

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Course Not Found</h2>
                <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
                <Button onClick={() => router.push("/student/ulearn")}>Back to ULearn</Button>
            </div>
        );
    }

    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    const completedLessons = course.modules.reduce((acc, m) => acc + m.lessons.filter(l => l.completed).length, 0);
    const progress = Math.round((completedLessons / totalLessons) * 100);

    const getCurrentLesson = () => {
        for (const module of course.modules) {
            const lesson = module.lessons.find(l => l.id === currentLessonId);
            if (lesson) return { lesson, module };
        }
        return null;
    };

    const markAsComplete = (lessonId: string) => {
        toast.success("Lesson marked as complete!");
        // In real app, this would update the database
    };

    const submitAssignment = (assignmentId: string) => {
        if (!assignmentFile) {
            toast.error("Please select a file to upload");
            return;
        }
        toast.success("Assignment submitted successfully!");
        setAssignmentFile(null);
    };

    const startQuiz = (quizId: string) => {
        toast.info("Starting quiz...");
        // In real app, this would navigate to quiz page
    };

    const postToForum = (forumId: string) => {
        if (!forumPost.trim()) {
            toast.error("Please enter a message");
            return;
        }
        toast.success("Posted to forum!");
        setForumPost("");
    };

    const lessonIcons = {
        video: Video,
        document: FileText,
        quiz: Star,
        assignment: Upload,
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-start gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/student/ulearn")}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center`}>
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">{course.code}</Badge>
                                <Badge variant="secondary">{progress}% Complete</Badge>
                            </div>
                            <h1 className="text-2xl font-bold">{course.title}</h1>
                            <p className="text-muted-foreground">Instructor: {course.instructor}</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{course.description}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Course Progress</span>
                        <span className="text-sm text-muted-foreground">{completedLessons}/{totalLessons} lessons</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                    <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                    <TabsTrigger value="announcements">Announcements</TabsTrigger>
                    <TabsTrigger value="forums">Forums</TabsTrigger>
                </TabsList>

                {/* Content Tab - Course Modules */}
                <TabsContent value="content" className="space-y-4">
                    {course.modules.map((module, moduleIdx) => (
                        <Card key={module.id}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                        {moduleIdx + 1}
                                    </span>
                                    {module.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {module.lessons.map((lesson) => {
                                    const Icon = lessonIcons[lesson.type];
                                    return (
                                        <div
                                            key={lesson.id}
                                            className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${lesson.locked
                                                    ? 'bg-muted/30 opacity-60'
                                                    : currentLessonId === lesson.id
                                                        ? 'bg-primary/10 border-primary'
                                                        : 'bg-muted/50 hover:bg-muted cursor-pointer'
                                                }`}
                                            onClick={() => !lesson.locked && setCurrentLessonId(lesson.id)}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${lesson.completed
                                                    ? 'bg-green-100 dark:bg-green-900/30'
                                                    : lesson.locked
                                                        ? 'bg-gray-100 dark:bg-gray-800'
                                                        : 'bg-blue-100 dark:bg-blue-900/30'
                                                }`}>
                                                {lesson.completed ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : lesson.locked ? (
                                                    <Lock className="h-4 w-4 text-gray-500" />
                                                ) : (
                                                    <Icon className="h-4 w-4 text-blue-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm">{lesson.title}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span className="capitalize">{lesson.type}</span>
                                                    {lesson.duration && <span>• {lesson.duration}</span>}
                                                </div>
                                            </div>
                                            {!lesson.locked && !lesson.completed && (
                                                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); markAsComplete(lesson.id); }}>
                                                    <Play className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* Assignments Tab */}
                <TabsContent value="assignments" className="space-y-4">
                    {course.assignments.map((assignment) => (
                        <Card key={assignment.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${assignment.status === 'graded' ? 'bg-green-100 dark:bg-green-900/30' :
                                                assignment.status === 'submitted' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                                    'bg-yellow-100 dark:bg-yellow-900/30'
                                            }`}>
                                            <FileText className={`h-5 w-5 ${assignment.status === 'graded' ? 'text-green-600' :
                                                    assignment.status === 'submitted' ? 'text-blue-600' :
                                                        'text-yellow-600'
                                                }`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{assignment.title}</h3>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Calendar className="h-3 w-3" />
                                                Due: {assignment.dueDate}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={
                                            assignment.status === 'graded' ? 'default' :
                                                assignment.status === 'submitted' ? 'secondary' : 'outline'
                                        }>
                                            {assignment.status === 'graded' && `${assignment.grade}/${assignment.maxGrade}`}
                                            {assignment.status === 'submitted' && 'Submitted'}
                                            {assignment.status === 'pending' && 'Pending'}
                                        </Badge>
                                    </div>
                                </div>
                                {assignment.status === 'pending' && (
                                    <div className="mt-4 pt-4 border-t space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.zip"
                                                onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)}
                                            />
                                            <Button onClick={() => submitAssignment(assignment.id)} className="gap-2">
                                                <Upload className="h-4 w-4" />
                                                Submit
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Max file size: 50MB. Accepted formats: PDF, DOC, DOCX, ZIP</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* Quizzes Tab */}
                <TabsContent value="quizzes" className="space-y-4">
                    {course.quizzes.map((quiz) => (
                        <Card key={quiz.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${quiz.attempts > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-purple-100 dark:bg-purple-900/30'
                                            }`}>
                                            <Star className={`h-5 w-5 ${quiz.attempts > 0 ? 'text-green-600' : 'text-purple-600'}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{quiz.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>{quiz.questions} questions</span>
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{quiz.duration}</span>
                                                <span>Attempts: {quiz.attempts}/{quiz.maxAttempts}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-2">
                                        {quiz.bestScore !== undefined && (
                                            <Badge variant="default" className="bg-green-500">Score: {quiz.bestScore}%</Badge>
                                        )}
                                        {quiz.attempts < quiz.maxAttempts && (
                                            <Button size="sm" onClick={() => startQuiz(quiz.id)}>
                                                {quiz.attempts === 0 ? 'Start Quiz' : 'Retake'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* Announcements Tab */}
                <TabsContent value="announcements" className="space-y-4">
                    {course.announcements.map((announcement) => (
                        <Card key={announcement.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                        <MessageSquare className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold">{announcement.title}</h3>
                                            <span className="text-xs text-muted-foreground">{announcement.date}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{announcement.content}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* Forums Tab */}
                <TabsContent value="forums" className="space-y-4">
                    {course.forums.map((forum) => (
                        <Card key={forum.id}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <Users className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{forum.title}</h3>
                                            <p className="text-sm text-muted-foreground">{forum.posts} posts • Last: {forum.lastPost}</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">View Topic</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Post to General Discussion</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Textarea
                                placeholder="Write your message..."
                                value={forumPost}
                                onChange={(e) => setForumPost(e.target.value)}
                                rows={3}
                            />
                            <Button onClick={() => postToForum("f1")} className="gap-2">
                                <Send className="h-4 w-4" />
                                Post Message
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
