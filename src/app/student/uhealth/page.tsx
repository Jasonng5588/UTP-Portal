"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { healthApi } from "@/lib/api";
import {
    Heart,
    Calendar,
    Clock,
    User,
    Phone,
    FileText,
    Pill,
    AlertCircle,
    CheckCircle,
    Loader2,
    History,
    Plus,
    Stethoscope,
    Activity,
} from "lucide-react";

type Appointment = {
    id: string;
    doctor_name: string;
    department: string;
    appointment_date: string;
    appointment_time: string;
    reason: string | null;
    status: string;
    notes: string | null;
    created_at: string;
};

type HealthRecord = {
    id: string;
    record_type: string;
    title: string;
    description: string | null;
    doctor_name: string | null;
    visit_date: string;
    attachments: string[] | null;
};

type Prescription = {
    id: string;
    medication_name: string;
    dosage: string;
    frequency: string;
    start_date: string;
    end_date: string | null;
    doctor_name: string;
    instructions: string | null;
    status: string;
};

const departments = [
    "General Medicine",
    "Dental",
    "Mental Health",
    "Physiotherapy",
    "Women's Health",
    "Eye Care",
];

const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
];

export default function UHealthPage() {
    const [activeTab, setActiveTab] = useState("appointments");
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [records, setRecords] = useState<HealthRecord[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    // Booking form
    const [bookDialogOpen, setBookDialogOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUser();
    }, []);

    useEffect(() => {
        if (userId) {
            loadAppointments();
            loadRecords();
            loadPrescriptions();
        }
    }, [userId]);

    const loadAppointments = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const { data, error } = await healthApi.getMyAppointments(userId);
            if (error) throw error;
            setAppointments(data || []);
        } catch (error) {
            console.error('Error loading appointments:', error);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const loadRecords = async () => {
        if (!userId) return;
        try {
            const { data, error } = await healthApi.getMyRecords(userId);
            if (error) throw error;
            setRecords(data || []);
        } catch (error) {
            console.error('Error loading records:', error);
            setRecords([]);
        }
    };

    const loadPrescriptions = async () => {
        if (!userId) return;
        try {
            const { data, error } = await healthApi.getMyPrescriptions(userId);
            if (error) throw error;
            setPrescriptions(data || []);
        } catch (error) {
            console.error('Error loading prescriptions:', error);
            setPrescriptions([]);
        }
    };

    const handleBookAppointment = async () => {
        if (!userId) {
            toast.error("Please login to book appointments");
            return;
        }
        if (!selectedDept || !selectedDate || !selectedTime) {
            toast.error("Please fill in all fields");
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await healthApi.bookAppointment(
                userId,
                selectedDept,
                selectedDate,
                selectedTime,
                reason
            );
            if (error) throw error;

            toast.success("Appointment booked successfully!");
            setBookDialogOpen(false);
            resetForm();
            loadAppointments();
        } catch (error: any) {
            toast.error(error.message || "Failed to book appointment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelAppointment = async (id: string) => {
        try {
            const { error } = await healthApi.cancelAppointment(id);
            if (error) throw error;
            toast.success("Appointment cancelled");
            loadAppointments();
        } catch (error: any) {
            toast.error(error.message || "Failed to cancel appointment");
        }
    };

    const resetForm = () => {
        setSelectedDept("");
        setSelectedDate("");
        setSelectedTime("");
        setReason("");
    };

    const upcomingAppointments = appointments.filter(a =>
        a.status !== 'cancelled' && new Date(a.appointment_date) >= new Date()
    );
    const pastAppointments = appointments.filter(a =>
        a.status === 'completed' || new Date(a.appointment_date) < new Date()
    );
    const activePrescriptions = prescriptions.filter(p => p.status === 'active');

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                        <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">UHealth</h1>
                        <p className="text-muted-foreground">Campus Health Services</p>
                    </div>
                </div>
                <Dialog open={bookDialogOpen} onOpenChange={setBookDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Book Appointment
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Book Appointment</DialogTitle>
                            <DialogDescription>Schedule a visit to the health clinic</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div>
                                <label className="text-sm font-medium">Department</label>
                                <Select value={selectedDept} onValueChange={setSelectedDept}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Date</label>
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Time</label>
                                <Select value={selectedTime} onValueChange={setSelectedTime}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timeSlots.map((time) => (
                                            <SelectItem key={time} value={time}>{time}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Reason (optional)</label>
                                <Textarea
                                    placeholder="Describe your symptoms or reason for visit..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <Button className="w-full" onClick={handleBookAppointment} disabled={submitting}>
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Calendar className="h-4 w-4 mr-2" />}
                                Confirm Booking
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                            <p className="text-xs text-muted-foreground">Upcoming</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <Pill className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{activePrescriptions.length}</p>
                            <p className="text-xs text-muted-foreground">Active Rx</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{records.length}</p>
                            <p className="text-xs text-muted-foreground">Records</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <History className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{pastAppointments.length}</p>
                            <p className="text-xs text-muted-foreground">Past Visits</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                    <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                    <TabsTrigger value="records">Records</TabsTrigger>
                    <TabsTrigger value="emergency">Emergency</TabsTrigger>
                </TabsList>

                {/* Appointments Tab */}
                <TabsContent value="appointments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Appointments</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : upcomingAppointments.length > 0 ? (
                                upcomingAppointments.map((apt) => (
                                    <div key={apt.id} className="p-4 rounded-lg border flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                                <Stethoscope className="h-6 w-6 text-red-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{apt.department}</h3>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(apt.appointment_date).toLocaleDateString()}
                                                    <Clock className="h-3 w-3 ml-2" />
                                                    {apt.appointment_time}
                                                </p>
                                                {apt.doctor_name && (
                                                    <p className="text-sm text-muted-foreground">Dr. {apt.doctor_name}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={apt.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}>
                                                {apt.status}
                                            </Badge>
                                            <Button size="sm" variant="destructive" onClick={() => handleCancelAppointment(apt.id)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No upcoming appointments</p>
                                    <Button className="mt-4" onClick={() => setBookDialogOpen(true)}>
                                        Book Appointment
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Prescriptions Tab */}
                <TabsContent value="prescriptions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Prescriptions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {activePrescriptions.length > 0 ? (
                                activePrescriptions.map((rx) => (
                                    <div key={rx.id} className="p-4 rounded-lg border">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                    <Pill className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{rx.medication_name}</h3>
                                                    <p className="text-sm text-muted-foreground">{rx.dosage} - {rx.frequency}</p>
                                                    <p className="text-sm text-muted-foreground">Prescribed by: Dr. {rx.doctor_name}</p>
                                                    {rx.instructions && (
                                                        <p className="text-sm mt-2 p-2 bg-muted/50 rounded">{rx.instructions}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge className="bg-green-500">Active</Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No active prescriptions</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Records Tab */}
                <TabsContent value="records" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Health Records</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {records.length > 0 ? (
                                records.map((record) => (
                                    <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="font-medium">{record.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {record.record_type} • {new Date(record.visit_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline">View</Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No health records</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Emergency Tab */}
                <TabsContent value="emergency" className="space-y-4">
                    <Card className="border-red-500/50 bg-red-500/5">
                        <CardHeader>
                            <CardTitle className="text-red-600 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                Emergency Contacts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-lg border border-red-500/30 bg-background">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">UTP Health Centre</h3>
                                        <p className="text-sm text-muted-foreground">24/7 Emergency Line</p>
                                    </div>
                                    <Button variant="destructive" className="gap-2">
                                        <Phone className="h-4 w-4" />
                                        05-368 8888
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg border border-red-500/30 bg-background">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">Ambulance</h3>
                                        <p className="text-sm text-muted-foreground">National Emergency</p>
                                    </div>
                                    <Button variant="destructive" className="gap-2">
                                        <Phone className="h-4 w-4" />
                                        999
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg border border-red-500/30 bg-background">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">Security</h3>
                                        <p className="text-sm text-muted-foreground">UTP Security Office</p>
                                    </div>
                                    <Button variant="outline" className="gap-2">
                                        <Phone className="h-4 w-4" />
                                        05-368 7777
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
