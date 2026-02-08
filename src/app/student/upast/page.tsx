"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { pastApi } from "@/lib/api";
import {
    FileText,
    Search,
    Download,
    Bookmark,
    BookmarkCheck,
    Calendar,
    Filter,
    Loader2,
    History,
    Star,
    Eye,
    Folder,
} from "lucide-react";

type PastPaper = {
    id: string;
    course_code: string;
    course_name: string;
    year: number;
    semester: string;
    exam_type: string;
    file_url: string | null;
    department: string | null;
    uploaded_at: string;
    download_count: number;
};

type Bookmark = {
    id: string;
    paper_id: string;
    created_at: string;
    paper: PastPaper;
};

const years = [2024, 2023, 2022, 2021, 2020];
const semesters = ["All", "January", "May", "September"];
const examTypes = ["All", "Final Exam", "Mid-Term", "Quiz", "Test"];

export default function UPastPage() {
    const [activeTab, setActiveTab] = useState("browse");
    const [papers, setPapers] = useState<PastPaper[]>([]);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [yearFilter, setYearFilter] = useState<number | null>(null);
    const [semesterFilter, setSemesterFilter] = useState("All");
    const [examFilter, setExamFilter] = useState("All");

    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUser();
    }, []);

    useEffect(() => {
        loadPapers();
    }, [yearFilter, semesterFilter, examFilter]);

    useEffect(() => {
        if (userId) loadBookmarks();
    }, [userId]);

    const loadPapers = async () => {
        setLoading(true);
        try {
            const { data, error } = await pastApi.getPapers(
                undefined,
                yearFilter || undefined,
                semesterFilter !== 'All' ? semesterFilter : undefined
            );
            if (error) throw error;
            let filtered = data || [];
            if (examFilter !== 'All') {
                filtered = filtered.filter((p: PastPaper) => p.exam_type === examFilter);
            }
            setPapers(filtered);
        } catch (error) {
            console.error('Error loading papers:', error);
            // Fallback demo data
            setPapers([
                { id: "1", course_code: "CDB2043", course_name: "Data Structures & Algorithms", year: 2024, semester: "May", exam_type: "Final Exam", file_url: "/papers/cdb2043-may2024.pdf", department: "Computer Science", uploaded_at: new Date().toISOString(), download_count: 156 },
                { id: "2", course_code: "CDB2033", course_name: "Database Systems", year: 2024, semester: "May", exam_type: "Final Exam", file_url: "/papers/cdb2033-may2024.pdf", department: "Computer Science", uploaded_at: new Date().toISOString(), download_count: 203 },
                { id: "3", course_code: "CDB3063", course_name: "Software Engineering", year: 2024, semester: "January", exam_type: "Final Exam", file_url: "/papers/cdb3063-jan2024.pdf", department: "Computer Science", uploaded_at: new Date().toISOString(), download_count: 89 },
                { id: "4", course_code: "MPU3123", course_name: "Tamadun Islam dan Asia", year: 2023, semester: "September", exam_type: "Final Exam", file_url: "/papers/mpu3123-sep2023.pdf", department: "General Studies", uploaded_at: new Date().toISOString(), download_count: 312 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const loadBookmarks = async () => {
        if (!userId) return;
        try {
            const { data, error } = await pastApi.getMyBookmarks(userId);
            if (error) throw error;
            setBookmarks(data as Bookmark[] || []);
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            setBookmarks([]);
        }
    };

    const handleBookmark = async (paperId: string, paperName: string) => {
        if (!userId) {
            toast.error("Please login to bookmark papers");
            return;
        }

        const existing = bookmarks.find(b => b.paper_id === paperId);
        if (existing) {
            // Remove bookmark
            try {
                const { error } = await pastApi.removeBookmark(existing.id);
                if (error) throw error;
                toast.success("Bookmark removed");
                loadBookmarks();
            } catch (error: any) {
                toast.error(error.message || "Failed to remove bookmark");
            }
        } else {
            // Add bookmark
            try {
                const { error } = await pastApi.addBookmark(paperId, userId);
                if (error) throw error;
                toast.success(`Bookmarked ${paperName}`);
                loadBookmarks();
            } catch (error: any) {
                toast.error(error.message || "Failed to bookmark");
            }
        }
    };

    const handleDownload = async (paper: PastPaper) => {
        try {
            await pastApi.recordDownload(paper.id);
            // In a real app, this would trigger the actual download
            toast.success(`Downloading ${paper.course_code} - ${paper.exam_type}`);
            if (paper.file_url) {
                window.open(paper.file_url, '_blank');
            }
        } catch (error) {
            console.error('Download error:', error);
        }
    };

    const isBookmarked = (paperId: string) => bookmarks.some(b => b.paper_id === paperId);

    const filteredPapers = papers.filter(p =>
        p.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.course_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">UPast</h1>
                        <p className="text-muted-foreground">Past Year Papers Repository</p>
                    </div>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by course code or name..."
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
                        <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{papers.length}</p>
                            <p className="text-xs text-muted-foreground">Total Papers</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <Bookmark className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{bookmarks.length}</p>
                            <p className="text-xs text-muted-foreground">Bookmarked</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <Download className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{papers.reduce((sum, p) => sum + p.download_count, 0)}</p>
                            <p className="text-xs text-muted-foreground">Downloads</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{years.length}</p>
                            <p className="text-xs text-muted-foreground">Years</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Filters:</span>
                        </div>
                        <Select value={yearFilter?.toString() || "all"} onValueChange={(v) => setYearFilter(v === "all" ? null : parseInt(v))}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Years</SelectItem>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {semesters.map((sem) => (
                                    <SelectItem key={sem} value={sem}>{sem === "All" ? "All Semesters" : sem}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={examFilter} onValueChange={setExamFilter}>
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Exam Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {examTypes.map((type) => (
                                    <SelectItem key={type} value={type}>{type === "All" ? "All Types" : type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setYearFilter(null);
                                setSemesterFilter("All");
                                setExamFilter("All");
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="browse">Browse Papers</TabsTrigger>
                    <TabsTrigger value="bookmarks">My Bookmarks</TabsTrigger>
                </TabsList>

                {/* Browse Tab */}
                <TabsContent value="browse" className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredPapers.map((paper) => (
                                <Card key={paper.id} className="overflow-hidden hover:shadow-lg transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <FileText className="h-6 w-6 text-slate-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold">{paper.course_code}</h3>
                                                        <Badge variant="outline">{paper.exam_type}</Badge>
                                                    </div>
                                                    <p className="text-muted-foreground">{paper.course_name}</p>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                                        <span>{paper.semester} {paper.year}</span>
                                                        <span className="flex items-center gap-1">
                                                            <Download className="h-3 w-3" />
                                                            {paper.download_count}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleBookmark(paper.id, paper.course_code)}
                                                >
                                                    {isBookmarked(paper.id) ? (
                                                        <BookmarkCheck className="h-5 w-5 text-amber-500" />
                                                    ) : (
                                                        <Bookmark className="h-5 w-5" />
                                                    )}
                                                </Button>
                                                <Button size="sm" variant="outline" className="gap-1">
                                                    <Eye className="h-4 w-4" />
                                                    Preview
                                                </Button>
                                                <Button size="sm" className="gap-1" onClick={() => handleDownload(paper)}>
                                                    <Download className="h-4 w-4" />
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {filteredPapers.length === 0 && (
                                <div className="text-center py-12">
                                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No papers found matching your criteria</p>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>

                {/* Bookmarks Tab */}
                <TabsContent value="bookmarks" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bookmarked Papers</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {bookmarks.length > 0 ? (
                                bookmarks.map((bookmark) => (
                                    <div key={bookmark.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <BookmarkCheck className="h-5 w-5 text-amber-500" />
                                            <div>
                                                <p className="font-medium">{bookmark.paper.course_code} - {bookmark.paper.course_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {bookmark.paper.semester} {bookmark.paper.year} • {bookmark.paper.exam_type}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleDownload(bookmark.paper)}>
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleBookmark(bookmark.paper_id, bookmark.paper.course_code)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No bookmarked papers</p>
                                    <Button className="mt-4" onClick={() => setActiveTab("browse")}>
                                        Browse Papers
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
