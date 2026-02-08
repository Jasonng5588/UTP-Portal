"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Download,
    Printer,
    Book,
    Filter,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    List,
    Grid3X3,
} from "lucide-react";

// Complete timetable data based on UTP USchedule features
const classSessions = [
    { id: "1", courseCode: "CSC1101", courseName: "Introduction to Programming", type: "Lecture", day: "Monday", startTime: "08:00", endTime: "10:00", room: "DK1", building: "Academic Block 1", instructor: "Dr. Ahmad Ibrahim" },
    { id: "2", courseCode: "MTH1201", courseName: "Linear Algebra", type: "Lecture", day: "Monday", startTime: "10:00", endTime: "12:00", room: "DK3", building: "Academic Block 2", instructor: "Prof. Siti Aminah" },
    { id: "3", courseCode: "CSC1102", courseName: "Data Structures & Algorithms", type: "Lab", day: "Monday", startTime: "14:00", endTime: "17:00", room: "Lab 5", building: "IT Building", instructor: "Dr. Farid Hassan" },
    { id: "4", courseCode: "CSC1203", courseName: "Computer Architecture", type: "Lecture", day: "Tuesday", startTime: "08:00", endTime: "10:00", room: "DK2", building: "Academic Block 1", instructor: "Dr. Lee Wei Ming" },
    { id: "5", courseCode: "CSC1101", courseName: "Introduction to Programming", type: "Tutorial", day: "Tuesday", startTime: "10:00", endTime: "11:00", room: "T2", building: "Academic Block 1", instructor: "En. Hafiz" },
    { id: "6", courseCode: "MPU3123", courseName: "Tamadun Islam dan Asia", type: "Lecture", day: "Tuesday", startTime: "14:00", endTime: "16:00", room: "DK5", building: "Academic Block 2", instructor: "Dr. Nor Aziah" },
    { id: "7", courseCode: "MTH1201", courseName: "Linear Algebra", type: "Tutorial", day: "Wednesday", startTime: "08:00", endTime: "09:00", room: "T5", building: "Academic Block 2", instructor: "En. Kamal" },
    { id: "8", courseCode: "CSC1102", courseName: "Data Structures & Algorithms", type: "Lecture", day: "Wednesday", startTime: "10:00", endTime: "12:00", room: "DK1", building: "Academic Block 1", instructor: "Dr. Farid Hassan" },
    { id: "9", courseCode: "CSC1203", courseName: "Computer Architecture", type: "Lab", day: "Wednesday", startTime: "14:00", endTime: "17:00", room: "Lab 3", building: "IT Building", instructor: "Dr. Lee Wei Ming" },
    { id: "10", courseCode: "CSC1101", courseName: "Introduction to Programming", type: "Lab", day: "Thursday", startTime: "08:00", endTime: "11:00", room: "Lab 1", building: "IT Building", instructor: "En. Hafiz" },
    { id: "11", courseCode: "MPU3123", courseName: "Tamadun Islam dan Asia", type: "Tutorial", day: "Thursday", startTime: "14:00", endTime: "15:00", room: "T8", building: "Academic Block 2", instructor: "Pn. Fatimah" },
    { id: "12", courseCode: "CSC1102", courseName: "Data Structures & Algorithms", type: "Tutorial", day: "Friday", startTime: "10:00", endTime: "11:00", room: "T3", building: "Academic Block 1", instructor: "En. Rizal" },
];

const examSchedule = [
    { id: "e1", courseCode: "CSC1101", courseName: "Introduction to Programming", date: "Mar 15, 2025", startTime: "09:00", endTime: "12:00", venue: "Sports Hall A", seat: "A-045" },
    { id: "e2", courseCode: "MTH1201", courseName: "Linear Algebra", date: "Mar 17, 2025", startTime: "14:00", endTime: "17:00", venue: "Sports Hall B", seat: "B-112" },
    { id: "e3", courseCode: "CSC1102", courseName: "Data Structures & Algorithms", date: "Mar 19, 2025", startTime: "09:00", endTime: "12:00", venue: "DK1", seat: "C-023" },
    { id: "e4", courseCode: "CSC1203", courseName: "Computer Architecture", date: "Mar 21, 2025", startTime: "14:00", endTime: "17:00", venue: "DK3", seat: "D-078" },
    { id: "e5", courseCode: "MPU3123", courseName: "Tamadun Islam dan Asia", date: "Mar 24, 2025", startTime: "09:00", endTime: "11:00", venue: "Sports Hall A", seat: "A-156" },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const typeColors: Record<string, string> = {
    Lecture: "bg-blue-500",
    Lab: "bg-green-500",
    Tutorial: "bg-purple-500",
};

export default function USchedulePage() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [activeTab, setActiveTab] = useState("timetable");
    const [selectedDay, setSelectedDay] = useState("all");
    const [currentWeek, setCurrentWeek] = useState(new Date());

    const filteredSessions = selectedDay === "all"
        ? classSessions
        : classSessions.filter(s => s.day === selectedDay);

    const getTodaySessions = () => {
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = dayNames[new Date().getDay()];
        return classSessions.filter(s => s.day === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    const todaySessions = getTodaySessions();

    const getSessionsForSlot = (day: string, time: string) => {
        return classSessions.filter(s =>
            s.day === day &&
            s.startTime <= time &&
            s.endTime > time
        );
    };

    const exportTimetable = () => {
        toast.success("Timetable exported to PDF!");
    };

    const printTimetable = () => {
        window.print();
        toast.success("Print dialog opened");
    };

    const logExamClash = () => {
        toast.info("Redirecting to UCS Portal to log exam clash case...");
    };

    const checkExamClash = () => {
        // Check for same date/time exams
        const dateTimeMap = new Map<string, string[]>();
        examSchedule.forEach(exam => {
            const key = `${exam.date}-${exam.startTime}`;
            if (!dateTimeMap.has(key)) {
                dateTimeMap.set(key, []);
            }
            dateTimeMap.get(key)!.push(exam.courseCode);
        });

        for (const [key, courses] of dateTimeMap) {
            if (courses.length > 1) {
                return { hasClash: true, courses, time: key };
            }
        }
        return { hasClash: false };
    };

    const clashInfo = checkExamClash();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">USchedule</h1>
                        <p className="text-muted-foreground">Course & Exam Timetable</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1" onClick={exportTimetable}>
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1" onClick={printTimetable}>
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>
                </div>
            </div>

            {/* Today's Schedule */}
            {todaySessions.length > 0 && (
                <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5 text-indigo-600" />
                            Today's Classes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {todaySessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="min-w-[200px] p-3 rounded-lg bg-white dark:bg-gray-900 border"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-2 h-2 rounded-full ${typeColors[session.type]}`} />
                                        <Badge variant="outline">{session.courseCode}</Badge>
                                        <Badge variant="secondary">{session.type}</Badge>
                                    </div>
                                    <p className="font-medium text-sm">{session.courseName}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        <Clock className="h-3 w-3" />
                                        {session.startTime} - {session.endTime}
                                    </p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {session.room}, {session.building}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="timetable">Course Timetable</TabsTrigger>
                    <TabsTrigger value="exams">Exam Schedule</TabsTrigger>
                </TabsList>

                {/* Course Timetable Tab */}
                <TabsContent value="timetable" className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={selectedDay} onValueChange={setSelectedDay}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Days</SelectItem>
                                    {days.map((day) => (
                                        <SelectItem key={day} value={day}>{day}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant={viewMode === "grid" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setViewMode("grid")}
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === "list" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setViewMode("list")}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {viewMode === "grid" ? (
                        <Card>
                            <CardContent className="p-0 overflow-x-auto">
                                <table className="w-full min-w-[800px]">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-3 text-left font-medium text-muted-foreground w-20">Time</th>
                                            {days.map((day) => (
                                                <th key={day} className="p-3 text-left font-medium text-muted-foreground">{day}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {timeSlots.map((time) => (
                                            <tr key={time} className="border-b">
                                                <td className="p-2 text-sm text-muted-foreground font-medium">{time}</td>
                                                {days.map((day) => {
                                                    const sessions = getSessionsForSlot(day, time);
                                                    return (
                                                        <td key={`${day}-${time}`} className="p-1 align-top">
                                                            {sessions.map((session) => (
                                                                session.startTime === time && (
                                                                    <div
                                                                        key={session.id}
                                                                        className={`p-2 rounded text-xs text-white ${typeColors[session.type]}`}
                                                                        style={{
                                                                            minHeight: `${(parseInt(session.endTime) - parseInt(session.startTime)) * 40}px`
                                                                        }}
                                                                    >
                                                                        <p className="font-semibold">{session.courseCode}</p>
                                                                        <p className="opacity-90">{session.type}</p>
                                                                        <p className="opacity-80">{session.room}</p>
                                                                    </div>
                                                                )
                                                            ))}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {filteredSessions.sort((a, b) => {
                                const dayOrder = days.indexOf(a.day) - days.indexOf(b.day);
                                if (dayOrder !== 0) return dayOrder;
                                return a.startTime.localeCompare(b.startTime);
                            }).map((session) => (
                                <Card key={session.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-1 h-full min-h-[60px] rounded-full ${typeColors[session.type]}`} />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline">{session.courseCode}</Badge>
                                                    <Badge className={`${typeColors[session.type]} text-white`}>{session.type}</Badge>
                                                    <span className="text-sm text-muted-foreground">{session.day}</span>
                                                </div>
                                                <h3 className="font-semibold">{session.courseName}</h3>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {session.startTime} - {session.endTime}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {session.room}, {session.building}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {session.instructor}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Legend */}
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Legend:</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-500" /> Lecture</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500" /> Lab</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-purple-500" /> Tutorial</span>
                    </div>
                </TabsContent>

                {/* Exam Schedule Tab */}
                <TabsContent value="exams" className="space-y-4">
                    {clashInfo.hasClash && (
                        <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
                            <CardContent className="p-4 flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <div className="flex-1">
                                    <p className="font-medium text-red-700 dark:text-red-400">Exam Clash Detected!</p>
                                    <p className="text-sm text-muted-foreground">
                                        You have multiple exams scheduled at the same time. Please log a case with REX.
                                    </p>
                                </div>
                                <Button variant="destructive" size="sm" onClick={logExamClash}>
                                    Log Case
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Final Examination Schedule</CardTitle>
                            <CardDescription>March 2025 Semester</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {examSchedule.map((exam) => (
                                <div key={exam.id} className="p-4 rounded-lg border bg-muted/50">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline">{exam.courseCode}</Badge>
                                            </div>
                                            <h3 className="font-semibold">{exam.courseName}</h3>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {exam.date}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {exam.startTime} - {exam.endTime}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {exam.venue}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Seat Number</p>
                                            <p className="text-lg font-bold">{exam.seat}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <p className="text-xs text-muted-foreground text-center">
                        Please check this schedule regularly for any changes. Affected students will be notified via UTP email.
                    </p>
                </TabsContent>
            </Tabs>
        </div>
    );
}
