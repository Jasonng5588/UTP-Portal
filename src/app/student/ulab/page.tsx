"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
    FlaskConical,
    Calendar,
    Clock,
    MapPin,
    AlertTriangle,
    CheckCircle,
    Users,
    FileText,
    Download,
    Book,
    Shield,
    Beaker,
    Microscope,
    Cpu,
    Hammer,
    Search,
    CalendarDays,
    History,
    ClipboardList,
    AlertCircle,
    Loader2,
} from "lucide-react";

import type { Lab, SafetyModule, LabBooking, SafetyCompletion } from "@/types";

export default function ULabPage() {
    const [activeTab, setActiveTab] = useState("schedule");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
    const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [purpose, setPurpose] = useState("");
    const [loading, setLoading] = useState(true);

    // Data states
    const [labs, setLabs] = useState<Lab[]>([]);
    const [mySessions, setMySessions] = useState<any[]>([]);
    const [myBookings, setMyBookings] = useState<any[]>([]); // Keeping as any[] for now as it has joined data
    const [safetyModules, setSafetyModules] = useState<SafetyModule[]>([]);
    const [completions, setCompletions] = useState<Set<string>>(new Set());

    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Fetch Labs
            const { data: labsData } = await supabase
                .from('labs')
                .select('*')
                .eq('is_active', true);

            if (labsData) setLabs(labsData);

            // Fetch Safety Modules
            const { data: modulesData } = await supabase
                .from('safety_modules')
                .select('*');

            if (modulesData) setSafetyModules(modulesData);

            if (user) {
                // Fetch Safety Completions
                const { data: compData } = await supabase
                    .from('safety_completions')
                    .select('module_id')
                    .eq('student_id', user.id);

                if (compData) {
                    setCompletions(new Set(compData.map(c => c.module_id)));
                }

                // Fetch My Lab Bookings
                const { data: bookingsData } = await supabase
                    .from('lab_bookings')
                    .select(`
                        *,
                        lab:labs(name)
                    `)
                    .eq('student_id', user.id)
                    .order('booking_date', { ascending: true });

                if (bookingsData) setMyBookings(bookingsData);

                // Fetch Lab Sessions (mock for now as we don't have enrollment-based sessions logic yet)
                // In a real app, we'd query lab_sessions based on student's enrolled courses
            }
        } catch (error) {
            console.error('Error fetching lab data:', error);
            toast.error("Failed to load lab data");
        } finally {
            setLoading(false);
        }
    };

    const bookLab = async () => {
        if (!selectedDate || !selectedTime || !purpose || !selectedLab) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please login to book a lab");
                return;
            }

            // Check safety requirements
            const uncompletedRequired = safetyModules.filter(m => m.is_required && !completions.has(m.id));
            if (uncompletedRequired.length > 0) {
                toast.error("You must complete all required safety modules first!");
                return;
            }

            const { error } = await supabase
                .from('lab_bookings')
                .insert({
                    lab_id: selectedLab.id,
                    student_id: user.id,
                    booking_date: selectedDate,
                    start_time: selectedTime.split('-')[0].trim(), // Assuming format like "09:00 - 11:00"
                    end_time: selectedTime.split('-')[1]?.trim() || "12:00", // Simplified
                    purpose: purpose,
                    status: 'pending'
                });

            if (error) throw error;

            toast.success("Lab booking request submitted!");
            setBookingDialogOpen(false);
            setPurpose("");
            setSelectedDate("");
            setSelectedTime("");
            fetchData(); // Refresh bookings
        } catch (error: any) {
            toast.error(error.message || "Failed to book lab");
        }
    };

    const startSafetyModule = async (moduleId: string) => {
        toast.info("Starting training module...");

        // Simulate completing the module
        setTimeout(async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { error } = await supabase
                    .from('safety_completions')
                    .insert({
                        student_id: user.id,
                        module_id: moduleId,
                        score: 100
                    });

                if (error) {
                    if (error.code === '23505') {
                        toast.success("You have already completed this module!");
                    } else {
                        throw error;
                    }
                } else {
                    toast.success("Module completed successfully!");
                    fetchData(); // Refresh status
                }
            } catch (error) {
                console.error("Error completing module", error);
            }
        }, 1500);
    };

    // Mock data for missing parts
    const labHistory: any[] = [];
    const labResources = [
        { id: "1", name: "Lab Safety Guideline 2024", type: "PDF", size: "2.4 MB" },
        { id: "2", name: "Equipment Handling Manual", type: "PDF", size: "1.8 MB" },
        { id: "3", name: "Experiment Report Template", type: "DOCX", size: "450 KB" },
    ];

    const labCategories = [
        { name: "All", icon: FlaskConical },
        { name: "Computer", icon: Cpu },
        { name: "Physics", icon: Microscope },
        { name: "Chemistry", icon: Beaker },
        { name: "Engineering", icon: Hammer },
    ];

    const filteredLabs = labs.filter((lab) =>
        categoryFilter === "All" || lab.category === categoryFilter
    );

    const resetBookingForm = () => {
        setSelectedDate("");
        setSelectedTime("");
        setPurpose("");
    };

    const downloadResource = (resourceId: string) => {
        toast.success("Downloading resource...");
    };

    // Derived state for view
    const myLabSessions = myBookings.map(b => ({
        id: b.id,
        course: b.purpose, // Showing purpose as "course" context
        labName: b.lab?.name || "Unknown Lab",
        date: b.booking_date,
        time: `${b.start_time} - ${b.end_time}`,
        instructor: "N/A",
        status: b.status
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                        <FlaskConical className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">ULab</h1>
                        <p className="text-muted-foreground">Laboratory Services</p>
                    </div>
                </div>
            </div>

            {/* Safety Alert */}
            {safetyModules.some(m => !completions.has(m.id) && m.is_required) && (
                <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
                    <CardContent className="p-4 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <div className="flex-1">
                            <p className="font-medium text-red-700 dark:text-red-400">Safety Training Required</p>
                            <p className="text-sm text-muted-foreground">Complete all required safety modules to access labs.</p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => setActiveTab("safety")}>Complete Now</Button>
                    </CardContent>
                </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{myLabSessions.length}</p>
                            <p className="text-xs text-muted-foreground">Upcoming Sessions</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{labHistory.length}</p>
                            <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <FlaskConical className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{labs.length}</p>
                            <p className="text-xs text-muted-foreground">Labs Available</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{safetyModules.filter(m => completions.has(m.id)).length}/{safetyModules.length}</p>
                            <p className="text-xs text-muted-foreground">Safety Modules</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="labs">Labs</TabsTrigger>
                    <TabsTrigger value="bookings">Bookings</TabsTrigger>
                    <TabsTrigger value="safety">Safety</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>

                {/* Schedule Tab */}
                <TabsContent value="schedule" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Lab Sessions</CardTitle>
                            <CardDescription>Your scheduled laboratory sessions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {myLabSessions.map((session) => (
                                <div key={session.id} className="p-4 rounded-lg border">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                                <Beaker className="h-6 w-6 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{session.course}</h3>
                                                <p className="text-sm text-muted-foreground">{session.labName}</p>
                                                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{session.date}</span>
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{session.time}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">Instructor: {session.instructor}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-blue-500">{session.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Lab History</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {labHistory.map((h) => (
                                <div key={h.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">{h.labName}</p>
                                            <p className="text-sm text-muted-foreground">{h.course} • {h.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">{h.attendance}</Badge>
                                        <Badge>{h.grade}</Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Labs Tab */}
                <TabsContent value="labs" className="space-y-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {labCategories.map((cat) => (
                            <Button
                                key={cat.name}
                                variant={categoryFilter === cat.name ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCategoryFilter(cat.name)}
                                className="gap-1"
                            >
                                <cat.icon className="h-4 w-4" />
                                {cat.name}
                            </Button>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {filteredLabs.map((lab) => (
                            <Card key={lab.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <Badge variant="outline">{lab.code}</Badge>
                                        <Badge>{lab.category}</Badge>
                                    </div>
                                    <h3 className="font-semibold">{lab.name}</h3>
                                    <p className="text-sm text-muted-foreground">{lab.building}, {lab.floor}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                        <Users className="h-3 w-3" />
                                        Capacity: {lab.capacity}
                                    </p>
                                    <div className="flex gap-1 mt-2 flex-wrap">
                                        {lab.equipment?.slice(0, 3).map((eq: string) => (
                                            <Badge key={eq} variant="secondary" className="text-xs">{eq}</Badge>
                                        ))}
                                    </div>
                                    <Dialog open={bookingDialogOpen && selectedLab?.id === lab.id} onOpenChange={(open) => {
                                        setBookingDialogOpen(open);
                                        if (open) setSelectedLab(lab);
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button className="w-full mt-4" variant="outline">Book Lab</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Book {lab.name}</DialogTitle>
                                                <DialogDescription>{lab.building} • Capacity: {lab.capacity}</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 pt-4">
                                                <div>
                                                    <label className="text-sm font-medium">Date</label>
                                                    <input
                                                        type="date"
                                                        className="w-full h-10 px-3 rounded-md border bg-background mt-1"
                                                        value={selectedDate}
                                                        onChange={(e) => setSelectedDate(e.target.value)}
                                                        min={new Date().toISOString().split('T')[0]}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Time Slot</label>
                                                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select time" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="09:00-12:00">9:00 AM - 12:00 PM</SelectItem>
                                                            <SelectItem value="14:00-17:00">2:00 PM - 5:00 PM</SelectItem>
                                                            <SelectItem value="19:00-22:00">7:00 PM - 10:00 PM</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Purpose</label>
                                                    <Input
                                                        placeholder="e.g., Group project, FYP experiment"
                                                        value={purpose}
                                                        onChange={(e) => setPurpose(e.target.value)}
                                                    />
                                                </div>
                                                <Button className="w-full" onClick={bookLab}>Submit Booking</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Bookings Tab */}
                <TabsContent value="bookings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Lab Bookings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {myBookings.map((booking: any) => (
                                <div key={booking.id} className="p-4 rounded-lg border">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold">{booking.lab?.name || booking.labName || 'Lab Booking'}</h3>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{booking.booking_date}</span>
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{booking.start_time} - {booking.end_time}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">Purpose: {booking.purpose}</p>
                                        </div>
                                        <Badge className="bg-green-500">{booking.status}</Badge>
                                    </div>
                                    <Button size="sm" variant="ghost" className="mt-2" onClick={() => toast.info("Booking cancelled")}>Cancel Booking</Button>
                                </div>
                            ))}
                            {myBookings.length === 0 && (
                                <div className="text-center py-8">
                                    <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No lab bookings yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Safety Tab */}
                <TabsContent value="safety" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Safety Training Modules
                            </CardTitle>
                            <CardDescription>Complete all required modules to access laboratories</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {safetyModules.map((module) => {
                                const isCompleted = completions.has(module.id);
                                return (
                                    <div key={module.id} className="p-4 rounded-lg border flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {isCompleted ? (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                            )}
                                            <div>
                                                <p className="font-medium">{module.name}</p>
                                                {isCompleted ? (
                                                    <p className="text-sm text-muted-foreground">Completed</p>
                                                ) : (
                                                    <p className="text-sm text-yellow-600">Not completed</p>
                                                )}
                                            </div>
                                        </div>
                                        {isCompleted ? (
                                            <Badge className="bg-green-500">Completed</Badge>
                                        ) : (
                                            <Button size="sm" onClick={() => startSafetyModule(module.id)}>Start Module</Button>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lab Resources</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {labResources.map((res) => (
                                <div key={res.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{res.name}</p>
                                            <p className="text-xs text-muted-foreground">{res.type} • {res.size}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" className="gap-1" onClick={() => downloadResource(res.id)}>
                                        <Download className="h-4 w-4" />
                                        Download
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
