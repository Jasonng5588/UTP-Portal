"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { eventApi } from "@/lib/api";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Search,
    Ticket,
    CheckCircle,
    Star,
    Loader2,
    History,
    PartyPopper,
    Filter,
    QrCode,
} from "lucide-react";

type Event = {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    organizer: string | null;
    location: string | null;
    start_datetime: string;
    end_datetime: string | null;
    cover_image: string | null;
    capacity: number | null;
    registered_count: number;
    is_featured: boolean;
    registration_deadline: string | null;
};

type EventRegistration = {
    id: string;
    event_id: string;
    ticket_number: string | null;
    qr_code: string | null;
    status: string;
    registered_at: string;
    checked_in_at: string | null;
    event: Event;
};

const categories = ["All", "Academic", "Sports", "Cultural", "Workshop", "Career", "Social"];

const categoryEmoji: Record<string, string> = {
    Academic: "📚",
    Sports: "⚽",
    Cultural: "🎭",
    Workshop: "🔧",
    Career: "💼",
    Social: "🎉",
};

export default function UEventPage() {
    const [activeTab, setActiveTab] = useState("browse");
    const [events, setEvents] = useState<Event[]>([]);
    const [myRegistrations, setMyRegistrations] = useState<EventRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [registering, setRegistering] = useState(false);
    const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
    const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
    const [viewingTicket, setViewingTicket] = useState<EventRegistration | null>(null);

    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUser();
    }, []);

    useEffect(() => {
        loadEvents();
    }, [categoryFilter]);

    useEffect(() => {
        if (userId) loadMyRegistrations();
    }, [userId]);

    const loadEvents = async () => {
        setLoading(true);
        try {
            const { data, error } = await eventApi.getEvents(
                categoryFilter !== 'All' ? categoryFilter : undefined
            );
            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error('Error loading events:', error);
            // Fallback demo data
            setEvents([
                { id: "1", title: "Career Fair 2025", description: "Annual career fair with top companies", category: "Career", organizer: "Career Services", location: "Chancellor Hall", start_datetime: "2025-03-05T09:00:00", end_datetime: "2025-03-06T17:00:00", cover_image: null, capacity: 1000, registered_count: 450, is_featured: true, registration_deadline: "2025-03-01T23:59:59" },
                { id: "2", title: "Hackathon 2025", description: "48-hour coding competition", category: "Academic", organizer: "GDSC UTP", location: "Pocket D", start_datetime: "2025-03-01T08:00:00", end_datetime: "2025-03-02T20:00:00", cover_image: null, capacity: 200, registered_count: 150, is_featured: true, registration_deadline: "2025-02-25T23:59:59" },
                { id: "3", title: "Cultural Night 2025", description: "Showcase of diverse cultures", category: "Cultural", organizer: "International Students", location: "DeTAR Putra", start_datetime: "2025-04-15T19:00:00", end_datetime: "2025-04-15T22:00:00", cover_image: null, capacity: 500, registered_count: 200, is_featured: false, registration_deadline: "2025-04-10T23:59:59" },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const loadMyRegistrations = async () => {
        if (!userId) return;
        try {
            const { data, error } = await eventApi.getMyRegistrations(userId);
            if (error) throw error;
            setMyRegistrations(data as EventRegistration[] || []);
        } catch (error) {
            console.error('Error loading registrations:', error);
            setMyRegistrations([]);
        }
    };

    const handleRegister = async () => {
        if (!userId || !selectedEvent) {
            toast.error("Please login to register");
            return;
        }

        // Check if already registered
        if (myRegistrations.some(r => r.event_id === selectedEvent.id && r.status === 'registered')) {
            toast.error("You're already registered for this event");
            return;
        }

        setRegistering(true);
        try {
            const { error } = await eventApi.registerForEvent(selectedEvent.id, userId);
            if (error) throw error;

            toast.success(`Registered for ${selectedEvent.title}!`);
            setRegisterDialogOpen(false);
            setSelectedEvent(null);
            loadMyRegistrations();
            loadEvents();
        } catch (error: any) {
            toast.error(error.message || "Failed to register");
        } finally {
            setRegistering(false);
        }
    };

    const handleCancelRegistration = async (registrationId: string, eventTitle: string) => {
        try {
            const { error } = await eventApi.cancelRegistration(registrationId);
            if (error) throw error;
            toast.success(`Cancelled registration for ${eventTitle}`);
            loadMyRegistrations();
        } catch (error: any) {
            toast.error(error.message || "Failed to cancel registration");
        }
    };

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const upcomingRegistrations = myRegistrations.filter(r =>
        r.status === 'registered' && new Date(r.event.start_datetime) >= new Date()
    );
    const pastRegistrations = myRegistrations.filter(r =>
        r.status === 'attended' || new Date(r.event.start_datetime) < new Date()
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                        <PartyPopper className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">UEvent</h1>
                        <p className="text-muted-foreground">Campus Events & Activities</p>
                    </div>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search events..."
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
                        <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-pink-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{events.length}</p>
                            <p className="text-xs text-muted-foreground">Upcoming Events</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <Ticket className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{upcomingRegistrations.length}</p>
                            <p className="text-xs text-muted-foreground">My Registrations</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Star className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{events.filter(e => e.is_featured).length}</p>
                            <p className="text-xs text-muted-foreground">Featured</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <History className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{pastRegistrations.length}</p>
                            <p className="text-xs text-muted-foreground">Attended</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="browse">Browse Events</TabsTrigger>
                    <TabsTrigger value="mytickets">My Tickets</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Browse Events */}
                <TabsContent value="browse" className="space-y-4">
                    {/* Category Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {categories.map((cat) => (
                            <Button
                                key={cat}
                                variant={categoryFilter === cat ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCategoryFilter(cat)}
                            >
                                {categoryEmoji[cat] || "📋"} {cat}
                            </Button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredEvents.map((event) => (
                                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all">
                                    <div className="h-32 bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-900 dark:to-rose-800 relative flex items-center justify-center">
                                        <PartyPopper className="h-12 w-12 text-pink-600 dark:text-pink-300" />
                                        {event.is_featured && (
                                            <Badge className="absolute top-2 right-2 bg-yellow-500">Featured</Badge>
                                        )}
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline">{categoryEmoji[event.category || ""] || "📋"} {event.category}</Badge>
                                        </div>
                                        <h3 className="font-semibold">{event.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                                        <div className="space-y-1 mt-3 text-sm text-muted-foreground">
                                            <p className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(event.start_datetime).toLocaleDateString()}
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {event.location}
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {event.registered_count}/{event.capacity} registered
                                            </p>
                                        </div>
                                        <Dialog open={registerDialogOpen && selectedEvent?.id === event.id} onOpenChange={(open) => {
                                            setRegisterDialogOpen(open);
                                            if (open) setSelectedEvent(event);
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button className="w-full mt-4">
                                                    Register Now
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Register for Event</DialogTitle>
                                                    <DialogDescription>{event.title}</DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 pt-4">
                                                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                                                        <p className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(event.start_datetime).toLocaleDateString()}
                                                        </p>
                                                        <p className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4" />
                                                            {new Date(event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                        <p className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4" />
                                                            {event.location}
                                                        </p>
                                                    </div>
                                                    <Button className="w-full" onClick={handleRegister} disabled={registering}>
                                                        {registering ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ticket className="h-4 w-4 mr-2" />}
                                                        Confirm Registration
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* My Tickets */}
                <TabsContent value="mytickets" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Event Tickets</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {upcomingRegistrations.length > 0 ? (
                                upcomingRegistrations.map((reg) => (
                                    <div key={reg.id} className="p-4 rounded-lg border">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold">{reg.event.title}</h3>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(reg.event.start_datetime).toLocaleDateString()}
                                                    <Clock className="h-3 w-3 ml-2" />
                                                    {new Date(reg.event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {reg.event.location}
                                                </p>
                                                {reg.ticket_number && (
                                                    <p className="text-sm font-mono mt-2">Ticket: {reg.ticket_number}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Badge className="bg-green-500">Registered</Badge>
                                                <Dialog open={ticketDialogOpen && viewingTicket?.id === reg.id} onOpenChange={(open) => {
                                                    setTicketDialogOpen(open);
                                                    if (open) setViewingTicket(reg);
                                                }}>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="outline" className="gap-1">
                                                            <QrCode className="h-4 w-4" />
                                                            View Ticket
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Event Ticket</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="text-center py-4">
                                                            <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center mb-4">
                                                                <QrCode className="h-24 w-24 text-muted-foreground" />
                                                            </div>
                                                            <h3 className="font-semibold text-lg">{reg.event.title}</h3>
                                                            <p className="text-muted-foreground">{new Date(reg.event.start_datetime).toLocaleDateString()}</p>
                                                            <p className="font-mono mt-2">{reg.ticket_number}</p>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                                <Button size="sm" variant="destructive" onClick={() => handleCancelRegistration(reg.id, reg.event.title)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No upcoming registrations</p>
                                    <Button className="mt-4" onClick={() => setActiveTab("browse")}>
                                        Browse Events
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
                            <CardTitle>Event History</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {pastRegistrations.length > 0 ? (
                                pastRegistrations.map((reg) => (
                                    <div key={reg.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="font-medium">{reg.event.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(reg.event.start_datetime).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary">Attended</Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No event history</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
