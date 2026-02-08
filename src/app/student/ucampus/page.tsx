"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
    GraduationCap,
    Download,
    FileText,
    TrendingUp,
    TrendingDown,
    Award,
    BookOpen,
    Calendar,
    ChevronRight,
    Printer,
    Mail,
    CheckCircle,
    Clock,
    Calculator,
    RefreshCw,
    Loader2,
} from "lucide-react";

type AcademicProfile = {
    studentId: string;
    name: string;
    programme: string;
    faculty: string;
    intake: string;
    status: string;
    cgpa: number;
    totalCredits: number;
    totalEarned: number;
    currentSemester: string;
    expectedGraduation: string;
};

type SemesterData = {
    id: string;
    name: string;
    gpa: number;
    credits: number;
    earned: number;
    status: string;
    courses: Array<{
        code: string;
        name: string;
        credits: number;
        grade: string;
        gradePoint: number;
    }>;
};


const semesters = [
    {
        id: "sem1",
        name: "September 2024",
        gpa: 3.52,
        credits: 15,
        earned: 15,
        status: "completed",
        courses: [
            { code: "CSC1101", name: "Introduction to Programming", credits: 3, grade: "A-", gradePoint: 3.67 },
            { code: "MTH1101", name: "Calculus I", credits: 3, grade: "B+", gradePoint: 3.33 },
            { code: "CSC1102", name: "Discrete Mathematics", credits: 3, grade: "A", gradePoint: 4.00 },
            { code: "ENG1101", name: "English for Academic Purposes", credits: 3, grade: "A-", gradePoint: 3.67 },
            { code: "MPU3113", name: "Hubungan Etnik", credits: 3, grade: "B+", gradePoint: 3.33 },
        ],
    },
    {
        id: "sem2",
        name: "January 2025",
        gpa: 3.38,
        credits: 15,
        earned: 12,
        status: "in_progress",
        courses: [
            { code: "CSC1201", name: "Data Structures & Algorithms", credits: 3, grade: "B+", gradePoint: 3.33 },
            { code: "CSC1202", name: "Object-Oriented Programming", credits: 3, grade: "A-", gradePoint: 3.67 },
            { code: "MTH1201", name: "Linear Algebra", credits: 3, grade: "B", gradePoint: 3.00 },
            { code: "CSC1203", name: "Computer Architecture", credits: 3, grade: "-", gradePoint: 0 },
            { code: "MPU3123", name: "Tamadun Islam dan Asia", credits: 3, grade: "-", gradePoint: 0 },
        ],
    },
];

const gradeScale = [
    { grade: "A", point: 4.00, range: "90-100" },
    { grade: "A-", point: 3.67, range: "85-89" },
    { grade: "B+", point: 3.33, range: "80-84" },
    { grade: "B", point: 3.00, range: "75-79" },
    { grade: "B-", point: 2.67, range: "70-74" },
    { grade: "C+", point: 2.33, range: "65-69" },
    { grade: "C", point: 2.00, range: "60-64" },
    { grade: "C-", point: 1.67, range: "55-59" },
    { grade: "D+", point: 1.33, range: "50-54" },
    { grade: "D", point: 1.00, range: "45-49" },
    { grade: "F", point: 0.00, range: "0-44" },
];

const documentRequests = [
    { id: "1", type: "Result Slip", semester: "September 2024", status: "ready", requestDate: "Feb 1, 2025" },
    { id: "2", type: "Academic Transcript", status: "processing", requestDate: "Feb 5, 2025" },
];

export default function UCampusPage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedSemester, setSelectedSemester] = useState("all");
    const [loading, setLoading] = useState(true);
    const [academicProfile, setAcademicProfile] = useState<AcademicProfile>({
        studentId: "",
        name: "",
        programme: "",
        faculty: "",
        intake: "",
        status: "Active",
        cgpa: 0,
        totalCredits: 0,
        totalEarned: 0,
        currentSemester: "",
        expectedGraduation: "",
    });
    const [semesterData, setSemesterData] = useState<SemesterData[]>(semesters);
    const [gpaCredits, setGpaCredits] = useState([
        { credits: 3, grade: "A" },
        { credits: 3, grade: "B+" },
        { credits: 3, grade: "A-" },
    ]);

    const supabase = createClient();

    // Fetch real user data from database
    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                // Get current authenticated user
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    // Fetch user profile
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (profile) {
                        // Fetch enrollments with course data
                        const { data: enrollments } = await supabase
                            .from('enrollments')
                            .select(`
                                *,
                                course:courses(*),
                                semester:semesters(*)
                            `)
                            .eq('student_id', user.id);

                        // Calculate CGPA from grades
                        const { data: grades } = await supabase
                            .from('grades')
                            .select('*')
                            .eq('student_id', user.id);

                        let totalPoints = 0;
                        let totalCredits = 0;
                        if (grades) {
                            grades.forEach((g: any) => {
                                const gradeInfo = gradeScale.find(gs => gs.grade === g.grade);
                                if (gradeInfo && g.credits) {
                                    totalPoints += gradeInfo.point * g.credits;
                                    totalCredits += g.credits;
                                }
                            });
                        }

                        setAcademicProfile({
                            studentId: profile.student_id || user.email?.split('@')[0] || 'N/A',
                            name: profile.full_name || user.user_metadata?.full_name || 'Student',
                            programme: profile.programme || 'Bachelor of Computer Science (Hons)',
                            faculty: profile.faculty || 'Faculty of Science and Information Technology',
                            intake: profile.intake_date || 'September 2024',
                            status: profile.status || 'Active',
                            cgpa: totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0,
                            totalCredits: totalCredits,
                            totalEarned: totalCredits,
                            currentSemester: 'January 2025',
                            expectedGraduation: profile.expected_graduation || 'September 2028',
                        });

                        // Process enrollments into semester data if available
                        if (enrollments && enrollments.length > 0) {
                            // Group by semester and format
                            // For now we use the default semesters as fallback
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching academic data:', error);
                // Keep default demo data on error
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const calculateTargetGPA = () => {
        let totalPoints = 0;
        let totalCredits = 0;
        gpaCredits.forEach((item) => {
            const grade = gradeScale.find(g => g.grade === item.grade);
            if (grade) {
                totalPoints += grade.point * item.credits;
                totalCredits += item.credits;
            }
        });
        return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
    };

    const downloadResultSlip = (semesterId: string) => {
        toast.success("Downloading result slip...");
    };

    const requestTranscript = () => {
        toast.success("Transcript request submitted! You will receive an email when it's ready.");
    };

    const addGpaRow = () => {
        setGpaCredits([...gpaCredits, { credits: 3, grade: "B" }]);
    };

    const updateGpaRow = (index: number, field: "credits" | "grade", value: string | number) => {
        const newCredits = [...gpaCredits];
        if (field === "credits") {
            newCredits[index].credits = Number(value);
        } else {
            newCredits[index].grade = value as string;
        }
        setGpaCredits(newCredits);
    };

    const removeGpaRow = (index: number) => {
        setGpaCredits(gpaCredits.filter((_, i) => i !== index));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (

        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">UCampus</h1>
                        <p className="text-muted-foreground">Academic Records & Registration</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <FileText className="h-4 w-4" />
                                Request Documents
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Request Academic Documents</DialogTitle>
                                <DialogDescription>Select the document you need and submit your request.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="grid gap-3">
                                    <Button variant="outline" className="justify-start gap-2 h-auto py-3" onClick={requestTranscript}>
                                        <FileText className="h-5 w-5" />
                                        <div className="text-left">
                                            <p className="font-medium">Partial Academic Transcript</p>
                                            <p className="text-xs text-muted-foreground">Official transcript up to current semester</p>
                                        </div>
                                    </Button>
                                    <Button variant="outline" className="justify-start gap-2 h-auto py-3" onClick={() => toast.info("Completion letter request submitted")}>
                                        <Award className="h-5 w-5" />
                                        <div className="text-left">
                                            <p className="font-medium">Completion Letter</p>
                                            <p className="text-xs text-muted-foreground">Letter confirming enrollment status</p>
                                        </div>
                                    </Button>
                                    <Button variant="outline" className="justify-start gap-2 h-auto py-3" onClick={() => toast.info("Certified copy request submitted")}>
                                        <CheckCircle className="h-5 w-5" />
                                        <div className="text-left">
                                            <p className="font-medium">Certified True Copy</p>
                                            <p className="text-xs text-muted-foreground">Certified copy of result slip</p>
                                        </div>
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Requests are processed within 3-5 working days. You will receive an email notification when ready.</p>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Student Profile Summary */}
            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-xl font-bold mb-1">{academicProfile.name}</h2>
                            <p className="text-blue-100 text-sm mb-3">{academicProfile.studentId}</p>
                            <p className="text-blue-100">{academicProfile.programme}</p>
                            <p className="text-blue-200 text-sm">{academicProfile.faculty}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/20 rounded-lg p-3">
                                <p className="text-3xl font-bold">{academicProfile.cgpa}</p>
                                <p className="text-blue-100 text-sm">CGPA</p>
                            </div>
                            <div className="bg-white/20 rounded-lg p-3">
                                <p className="text-3xl font-bold">{academicProfile.totalEarned}</p>
                                <p className="text-blue-100 text-sm">Credits Earned</p>
                            </div>
                            <div className="bg-white/20 rounded-lg p-3">
                                <p className="text-lg font-semibold">{academicProfile.currentSemester}</p>
                                <p className="text-blue-100 text-sm">Current Semester</p>
                            </div>
                            <div className="bg-white/20 rounded-lg p-3">
                                <p className="text-lg font-semibold">{academicProfile.expectedGraduation}</p>
                                <p className="text-blue-100 text-sm">Expected Graduation</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="results">Results & Grades</TabsTrigger>
                    <TabsTrigger value="gpa">GPA Calculator</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{semesters[0]?.gpa || "-"}</p>
                                    <p className="text-sm text-muted-foreground">Last Semester GPA</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <BookOpen className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{semesters.length}</p>
                                    <p className="text-sm text-muted-foreground">Semesters Completed</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <Award className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">Dean's List</p>
                                    <p className="text-sm text-muted-foreground">Current Standing</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Current Semester: {academicProfile.currentSemester}</CardTitle>
                            <CardDescription>Enrolled courses for this semester</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Course Name</TableHead>
                                        <TableHead className="text-center">Credits</TableHead>
                                        <TableHead className="text-center">Grade</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {semesters.find(s => s.status === "in_progress")?.courses.map((course) => (
                                        <TableRow key={course.code}>
                                            <TableCell className="font-medium">{course.code}</TableCell>
                                            <TableCell>{course.name}</TableCell>
                                            <TableCell className="text-center">{course.credits}</TableCell>
                                            <TableCell className="text-center">
                                                {course.grade === "-" ? (
                                                    <Badge variant="secondary">In Progress</Badge>
                                                ) : (
                                                    <Badge variant="default">{course.grade}</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Results Tab */}
                <TabsContent value="results" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Semester Results</h2>
                        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select Semester" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Semesters</SelectItem>
                                {semesters.map((sem) => (
                                    <SelectItem key={sem.id} value={sem.id}>{sem.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {semesters.filter(s => selectedSemester === "all" || s.id === selectedSemester).map((semester) => (
                        <Card key={semester.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base">{semester.name}</CardTitle>
                                        <CardDescription>GPA: {semester.gpa} • Credits: {semester.earned}/{semester.credits}</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        {semester.status === "completed" && (
                                            <Button variant="outline" size="sm" className="gap-1" onClick={() => downloadResultSlip(semester.id)}>
                                                <Download className="h-4 w-4" />
                                                Result Slip
                                            </Button>
                                        )}
                                        <Badge variant={semester.status === "completed" ? "default" : "secondary"}>
                                            {semester.status === "completed" ? "Completed" : "In Progress"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Code</TableHead>
                                            <TableHead>Course Name</TableHead>
                                            <TableHead className="text-center">Credits</TableHead>
                                            <TableHead className="text-center">Grade</TableHead>
                                            <TableHead className="text-center">Point</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {semester.courses.map((course) => (
                                            <TableRow key={course.code}>
                                                <TableCell className="font-medium">{course.code}</TableCell>
                                                <TableCell>{course.name}</TableCell>
                                                <TableCell className="text-center">{course.credits}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={course.grade === "-" ? "outline" : "default"}>{course.grade}</Badge>
                                                </TableCell>
                                                <TableCell className="text-center">{course.gradePoint > 0 ? course.gradePoint.toFixed(2) : "-"}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* GPA Calculator Tab */}
                <TabsContent value="gpa" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                GPA Calculator
                            </CardTitle>
                            <CardDescription>Calculate your target GPA based on expected grades</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                {gpaCredits.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <Select value={item.credits.toString()} onValueChange={(v) => updateGpaRow(index, "credits", v)}>
                                            <SelectTrigger className="w-24">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1, 2, 3, 4].map((c) => (
                                                    <SelectItem key={c} value={c.toString()}>{c} Credits</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={item.grade} onValueChange={(v) => updateGpaRow(index, "grade", v)}>
                                            <SelectTrigger className="w-24">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {gradeScale.map((g) => (
                                                    <SelectItem key={g.grade} value={g.grade}>{g.grade} ({g.point})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button variant="ghost" size="icon" onClick={() => removeGpaRow(index)}>×</Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" onClick={addGpaRow}>+ Add Course</Button>

                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-medium">Calculated GPA:</span>
                                    <span className="text-3xl font-bold text-primary">{calculateTargetGPA()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Grade Scale Reference</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 md:grid-cols-11 gap-2">
                                {gradeScale.map((g) => (
                                    <div key={g.grade} className="text-center p-2 rounded-lg bg-muted">
                                        <p className="font-bold">{g.grade}</p>
                                        <p className="text-xs text-muted-foreground">{g.point}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Document Requests</CardTitle>
                            <CardDescription>Track your document requests and download ready documents</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {documentRequests.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.status === 'ready' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
                                            }`}>
                                            {doc.status === 'ready' ? (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <Clock className="h-5 w-5 text-yellow-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">{doc.type}</p>
                                            <p className="text-sm text-muted-foreground">Requested: {doc.requestDate} {doc.semester && `• ${doc.semester}`}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={doc.status === 'ready' ? 'default' : 'secondary'}>
                                            {doc.status === 'ready' ? 'Ready' : 'Processing'}
                                        </Badge>
                                        {doc.status === 'ready' && (
                                            <Button size="sm" className="gap-1">
                                                <Download className="h-4 w-4" />
                                                Download
                                            </Button>
                                        )}
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
