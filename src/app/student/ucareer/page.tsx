"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { careerApi } from "@/lib/api";
import {
    Briefcase,
    MapPin,
    Calendar,
    DollarSign,
    Search,
    Building,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    History,
    Star,
    ExternalLink,
    Send,
    Users,
    GraduationCap,
} from "lucide-react";

type Job = {
    id: string;
    title: string;
    company: string;
    description: string | null;
    requirements: string[] | null;
    job_type: string;
    location: string | null;
    salary_range: string | null;
    deadline: string | null;
    is_remote: boolean;
    is_featured: boolean;
    posted_at: string;
};

type JobApplication = {
    id: string;
    job_id: string;
    resume_url: string | null;
    cover_letter: string | null;
    status: string;
    applied_at: string;
    reviewed_at: string | null;
    job: Job;
};

type CareerEvent = {
    id: string;
    title: string;
    description: string | null;
    event_type: string;
    location: string | null;
    start_datetime: string;
    end_datetime: string | null;
    registration_link: string | null;
    is_virtual: boolean;
};

const jobTypes = ["All", "Full-time", "Part-time", "Internship", "Contract"];

export default function UCareerPage() {
    const [activeTab, setActiveTab] = useState("jobs");
    const [jobs, setJobs] = useState<Job[]>([]);
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [events, setEvents] = useState<CareerEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");

    // Apply dialog
    const [applyDialogOpen, setApplyDialogOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [applying, setApplying] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUser();
    }, []);

    useEffect(() => {
        loadJobs();
        loadEvents();
    }, [typeFilter]);

    useEffect(() => {
        if (userId) loadApplications();
    }, [userId]);

    const loadJobs = async () => {
        setLoading(true);
        try {
            const { data, error } = await careerApi.getJobs(
                typeFilter !== 'All' ? typeFilter : undefined
            );
            if (error) throw error;
            setJobs(data || []);
        } catch (error) {
            console.error('Error loading jobs:', error);
            // Fallback demo data
            setJobs([
                { id: "1", title: "Software Engineer Intern", company: "PETRONAS Digital", description: "Join our digital transformation team", requirements: ["Python", "JavaScript", "Good communication"], job_type: "Internship", location: "Kuala Lumpur", salary_range: "RM 2,500 - 3,000/month", deadline: "2025-03-15", is_remote: false, is_featured: true, posted_at: new Date().toISOString() },
                { id: "2", title: "Data Analyst", company: "Maybank", description: "Analyze financial data and create insights", requirements: ["SQL", "Python", "Tableau"], job_type: "Full-time", location: "Kuala Lumpur", salary_range: "RM 5,000 - 7,000/month", deadline: "2025-03-20", is_remote: false, is_featured: true, posted_at: new Date().toISOString() },
                { id: "3", title: "Cloud Engineer", company: "AWS", description: "Help customers build on AWS", requirements: ["AWS", "Linux", "Scripting"], job_type: "Full-time", location: "Remote", salary_range: "RM 10,000 - 15,000/month", deadline: "2025-04-01", is_remote: true, is_featured: false, posted_at: new Date().toISOString() },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const loadApplications = async () => {
        if (!userId) return;
        try {
            const { data, error } = await careerApi.getMyApplications(userId);
            if (error) throw error;
            setApplications(data as JobApplication[] || []);
        } catch (error) {
            console.error('Error loading applications:', error);
            setApplications([]);
        }
    };

    const loadEvents = async () => {
        try {
            const { data, error } = await careerApi.getCareerEvents();
            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error('Error loading career events:', error);
            setEvents([
                { id: "1", title: "Career Fair 2025", description: "Annual career fair with 50+ companies", event_type: "Career Fair", location: "Chancellor Hall", start_datetime: "2025-03-05T09:00:00", end_datetime: "2025-03-06T17:00:00", registration_link: null, is_virtual: false },
                { id: "2", title: "Resume Workshop", description: "Learn to craft the perfect resume", event_type: "Workshop", location: "Pocket D", start_datetime: "2025-02-20T14:00:00", end_datetime: "2025-02-20T16:00:00", registration_link: null, is_virtual: false },
            ]);
        }
    };

    const handleApply = async () => {
        if (!userId || !selectedJob) {
            toast.error("Please login to apply");
            return;
        }

        // Check if already applied
        if (applications.some(a => a.job_id === selectedJob.id)) {
            toast.error("You've already applied for this job");
            return;
        }

        setApplying(true);
        try {
            const { error } = await careerApi.applyForJob(selectedJob.id, userId);
            if (error) throw error;

            toast.success(`Applied to ${selectedJob.title} at ${selectedJob.company}!`);
            setApplyDialogOpen(false);
            setSelectedJob(null);
            loadApplications();
        } catch (error: any) {
            toast.error(error.message || "Failed to apply");
        } finally {
            setApplying(false);
        }
    };

    const handleWithdraw = async (applicationId: string, jobTitle: string) => {
        try {
            const { error } = await careerApi.withdrawApplication(applicationId);
            if (error) throw error;
            toast.success(`Withdrew application for ${jobTitle}`);
            loadApplications();
        } catch (error: any) {
            toast.error(error.message || "Failed to withdraw application");
        }
    };

    const filteredJobs = jobs.filter(j =>
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.company.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pendingApplications = applications.filter(a => a.status === 'pending' || a.status === 'under_review');
    const resolvedApplications = applications.filter(a => a.status === 'accepted' || a.status === 'rejected');

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">UCareer</h1>
                        <p className="text-muted-foreground">Career Services & Job Portal</p>
                    </div>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search jobs, companies..."
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
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{jobs.length}</p>
                            <p className="text-xs text-muted-foreground">Open Jobs</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Send className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{pendingApplications.length}</p>
                            <p className="text-xs text-muted-foreground">Pending</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{applications.filter(a => a.status === 'accepted').length}</p>
                            <p className="text-xs text-muted-foreground">Accepted</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{events.length}</p>
                            <p className="text-xs text-muted-foreground">Events</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="jobs">Jobs</TabsTrigger>
                    <TabsTrigger value="applications">Applications</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>

                {/* Jobs Tab */}
                <TabsContent value="jobs" className="space-y-4">
                    {/* Type Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {jobTypes.map((type) => (
                            <Button
                                key={type}
                                variant={typeFilter === type ? "default" : "outline"}
                                size="sm"
                                onClick={() => setTypeFilter(type)}
                            >
                                {type}
                            </Button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredJobs.map((job) => (
                                <Card key={job.id} className={`overflow-hidden hover:shadow-lg transition-all ${job.is_featured ? 'border-amber-500/50' : ''}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {job.is_featured && <Badge className="bg-amber-500">Featured</Badge>}
                                                    <Badge variant="outline">{job.job_type}</Badge>
                                                    {job.is_remote && <Badge variant="secondary">Remote</Badge>}
                                                </div>
                                                <h3 className="font-semibold text-lg">{job.title}</h3>
                                                <p className="text-muted-foreground flex items-center gap-1">
                                                    <Building className="h-4 w-4" />
                                                    {job.company}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-2">{job.description}</p>
                                                <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {job.location}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="h-3 w-3" />
                                                        {job.salary_range}
                                                    </span>
                                                    {job.deadline && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            Deadline: {new Date(job.deadline).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                                {job.requirements && (
                                                    <div className="flex flex-wrap gap-1 mt-3">
                                                        {job.requirements.map((req, i) => (
                                                            <Badge key={i} variant="secondary" className="text-xs">{req}</Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <Dialog open={applyDialogOpen && selectedJob?.id === job.id} onOpenChange={(open) => {
                                                setApplyDialogOpen(open);
                                                if (open) setSelectedJob(job);
                                            }}>
                                                <DialogTrigger asChild>
                                                    <Button className="flex-1">Apply Now</Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Apply for {job.title}</DialogTitle>
                                                        <DialogDescription>{job.company}</DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4 pt-4">
                                                        <div className="p-4 rounded-lg bg-muted/50">
                                                            <p className="text-sm"><strong>Position:</strong> {job.title}</p>
                                                            <p className="text-sm"><strong>Company:</strong> {job.company}</p>
                                                            <p className="text-sm"><strong>Location:</strong> {job.location}</p>
                                                            <p className="text-sm"><strong>Salary:</strong> {job.salary_range}</p>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Your profile and resume will be shared with the employer.
                                                        </p>
                                                        <Button className="w-full" onClick={handleApply} disabled={applying}>
                                                            {applying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                                                            Submit Application
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            <Button variant="outline" size="icon">
                                                <Star className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Applications Tab */}
                <TabsContent value="applications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Applications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {pendingApplications.length > 0 ? (
                                pendingApplications.map((app) => (
                                    <div key={app.id} className="p-4 rounded-lg border flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold">{app.job.title}</h3>
                                            <p className="text-muted-foreground">{app.job.company}</p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Applied: {new Date(app.applied_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={app.status === 'under_review' ? 'bg-blue-500' : 'bg-yellow-500'}>
                                                {app.status.replace('_', ' ')}
                                            </Badge>
                                            <Button size="sm" variant="destructive" onClick={() => handleWithdraw(app.id, app.job.title)}>
                                                Withdraw
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No pending applications</p>
                                    <Button className="mt-4" onClick={() => setActiveTab("jobs")}>
                                        Browse Jobs
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Events Tab */}
                <TabsContent value="events" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        {events.map((event) => (
                            <Card key={event.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-2 mb-2">
                                        <Badge variant="outline">{event.event_type}</Badge>
                                        {event.is_virtual && <Badge variant="secondary">Virtual</Badge>}
                                    </div>
                                    <h3 className="font-semibold">{event.title}</h3>
                                    <p className="text-sm text-muted-foreground">{event.description}</p>
                                    <div className="space-y-1 mt-3 text-sm text-muted-foreground">
                                        <p className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(event.start_datetime).toLocaleDateString()}
                                        </p>
                                        <p className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {event.location}
                                        </p>
                                    </div>
                                    <Button className="w-full mt-4">Register</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Card className="hover:shadow-lg transition-all cursor-pointer">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <GraduationCap className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Resume Builder</h3>
                                    <p className="text-sm text-muted-foreground">Create professional resumes</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-lg transition-all cursor-pointer">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Mock Interviews</h3>
                                    <p className="text-sm text-muted-foreground">Practice with AI interviewer</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
