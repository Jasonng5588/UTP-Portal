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
import { facilityApi } from "@/lib/api";
import {
    Building2,
    MapPin,
    Send,
    Clock,
    AlertTriangle,
    CheckCircle,
    Zap,
    Droplets,
    Wind,
    Wifi,
    Loader2,
    History,
    Plus,
    XCircle,
} from "lucide-react";

type MaintenanceRequest = {
    id: string;
    category: string;
    building: string;
    room_location: string | null;
    description: string;
    priority: string;
    status: string;
    assigned_to: string | null;
    resolution_notes: string | null;
    created_at: string;
    resolved_at: string | null;
};

const buildings = [
    "Residential Village 1 (V1)",
    "Residential Village 2 (V2)",
    "Residential Village 3 (V3)",
    "Residential Village 4 (V4)",
    "Residential Village 5 (V5)",
    "Residential Village 6 (V6)",
    "Academic Block 1",
    "Academic Block 2",
    "Academic Block 3",
    "Library",
    "Chancellor Hall",
    "Sports Complex",
];

const categories = [
    "Electrical", "Plumbing", "Air Conditioning", "Furniture",
    "Cleaning", "Pest Control", "General Maintenance", "Internet/WiFi"
];

const priorityColors: Record<string, string> = {
    low: "bg-gray-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    urgent: "bg-red-500"
};

const statusColors: Record<string, string> = {
    pending: "bg-yellow-500",
    in_progress: "bg-blue-500",
    completed: "bg-green-500",
    cancelled: "bg-gray-500"
};

// Simulated utility status
const utilityStatus = [
    { name: "Electricity", icon: Zap, status: "operational", color: "text-green-500" },
    { name: "Water Supply", icon: Droplets, status: "operational", color: "text-green-500" },
    { name: "HVAC System", icon: Wind, status: "maintenance", color: "text-yellow-500" },
    { name: "Internet", icon: Wifi, status: "operational", color: "text-green-500" },
];

export default function UFacilityPage() {
    const [activeTab, setActiveTab] = useState("status");
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    // Request form state
    const [requestDialogOpen, setRequestDialogOpen] = useState(false);
    const [formCategory, setFormCategory] = useState("");
    const [formBuilding, setFormBuilding] = useState("");
    const [formRoom, setFormRoom] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formPriority, setFormPriority] = useState("medium");
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
        if (userId) loadRequests();
    }, [userId]);

    const loadRequests = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const { data, error } = await facilityApi.getMyRequests(userId);
            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error('Error loading requests:', error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitRequest = async () => {
        if (!userId) {
            toast.error("Please login to submit requests");
            return;
        }
        if (!formCategory || !formBuilding || !formDescription) {
            toast.error("Please fill in all required fields");
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await facilityApi.submitRequest(
                userId,
                formCategory,
                formBuilding,
                formRoom,
                formDescription,
                formPriority
            );
            if (error) throw error;

            toast.success("Maintenance request submitted successfully!");
            setRequestDialogOpen(false);
            resetForm();
            loadRequests();
        } catch (error: any) {
            toast.error(error.message || "Failed to submit request");
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormCategory("");
        setFormBuilding("");
        setFormRoom("");
        setFormDescription("");
        setFormPriority("medium");
    };

    const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'in_progress');
    const resolvedRequests = requests.filter(r => r.status === 'completed');

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">UFacility</h1>
                        <p className="text-muted-foreground">Facilities & Maintenance</p>
                    </div>
                </div>
                <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Request
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Submit Maintenance Request</DialogTitle>
                            <DialogDescription>
                                Describe the issue and we'll handle it promptly
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div>
                                <label className="text-sm font-medium">Category *</label>
                                <Select value={formCategory} onValueChange={setFormCategory}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Building *</label>
                                <Select value={formBuilding} onValueChange={setFormBuilding}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select building" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {buildings.map((bld) => (
                                            <SelectItem key={bld} value={bld}>{bld}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Room/Location</label>
                                <Input
                                    placeholder="e.g., Room 123, Level 2"
                                    value={formRoom}
                                    onChange={(e) => setFormRoom(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Priority</label>
                                <Select value={formPriority} onValueChange={setFormPriority}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low - Not urgent</SelectItem>
                                        <SelectItem value="medium">Medium - Normal</SelectItem>
                                        <SelectItem value="high">High - Needs attention</SelectItem>
                                        <SelectItem value="urgent">Urgent - Safety issue</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description *</label>
                                <Textarea
                                    placeholder="Describe the issue in detail..."
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    rows={4}
                                    className="mt-1"
                                />
                            </div>
                            <Button className="w-full" onClick={handleSubmitRequest} disabled={submitting}>
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                                Submit Request
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Utility Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {utilityStatus.map((utility) => (
                    <Card key={utility.name}>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center`}>
                                <utility.icon className={`h-5 w-5 ${utility.color}`} />
                            </div>
                            <div>
                                <p className="font-medium text-sm">{utility.name}</p>
                                <p className={`text-xs capitalize ${utility.color}`}>{utility.status}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="status">Status Dashboard</TabsTrigger>
                    <TabsTrigger value="myrequests">My Requests</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Status Dashboard */}
                <TabsContent value="status" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Campus Announcements</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-yellow-600">Scheduled Maintenance</h3>
                                        <p className="text-sm text-muted-foreground">
                                            HVAC system maintenance in Academic Block 2 on Feb 10, 2025 from 10:00 AM - 2:00 PM
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-green-600">All Systems Operational</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Campus utilities are running normally. No major disruptions expected.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-4 rounded-lg bg-muted/50">
                                    <p className="text-3xl font-bold text-yellow-600">{pendingRequests.length}</p>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50">
                                    <p className="text-3xl font-bold text-blue-600">{requests.filter(r => r.status === 'in_progress').length}</p>
                                    <p className="text-sm text-muted-foreground">In Progress</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50">
                                    <p className="text-3xl font-bold text-green-600">{resolvedRequests.length}</p>
                                    <p className="text-sm text-muted-foreground">Resolved</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* My Requests */}
                <TabsContent value="myrequests" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Requests</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : pendingRequests.length > 0 ? (
                                pendingRequests.map((request) => (
                                    <div key={request.id} className="p-4 rounded-lg border">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">{request.category}</h3>
                                                    <Badge className={priorityColors[request.priority]}>{request.priority}</Badge>
                                                    <Badge className={statusColors[request.status]}>{request.status.replace('_', ' ')}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {request.building} {request.room_location && `- ${request.room_location}`}
                                                </p>
                                                <p className="text-sm mt-2">{request.description}</p>
                                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Submitted: {new Date(request.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                                    <p className="text-muted-foreground">No active requests</p>
                                    <Button className="mt-4" onClick={() => setRequestDialogOpen(true)}>
                                        Submit a Request
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* History */}
                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resolved Requests</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {resolvedRequests.length > 0 ? (
                                resolvedRequests.map((request) => (
                                    <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="font-medium">{request.category}</p>
                                                <p className="text-sm text-muted-foreground">{request.building}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Resolved: {request.resolved_at ? new Date(request.resolved_at).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-500">Completed</Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No history yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
