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
import { bookingApi } from "@/lib/api";
import {
    CalendarDays,
    Clock,
    MapPin,
    Users,
    Search,
    Plus,
    CheckCircle,
    XCircle,
    Loader2,
    History,
    BookOpen,
    Dumbbell,
    Music,
    Building2,
} from "lucide-react";

type Facility = {
    id: string;
    name: string;
    category: string;
    description: string | null;
    location: string | null;
    capacity: number | null;
    amenities: string[] | null;
    image_url: string | null;
    max_hours_per_booking: number;
    advance_booking_days: number;
};

type Booking = {
    id: string;
    facility_id: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    purpose: string | null;
    status: string;
    created_at: string;
    facility: Facility;
};

const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

const categoryMap: Record<string, string> = {
    "Study Room": "📚",
    "Discussion Room": "💬",
    "Sports": "🏸",
    "Hall": "🏛️",
    "Lab": "🔬",
    "Music Room": "🎵",
};

export default function UBookingPage() {
    const [activeTab, setActiveTab] = useState("facilities");
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [myBookings, setMyBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    // Booking form state
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedStartTime, setSelectedStartTime] = useState("");
    const [selectedEndTime, setSelectedEndTime] = useState("");
    const [bookingPurpose, setBookingPurpose] = useState("");
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
        loadFacilities();
    }, [categoryFilter]);

    useEffect(() => {
        if (userId) loadMyBookings();
    }, [userId]);

    const loadFacilities = async () => {
        setLoading(true);
        try {
            const { data, error } = await bookingApi.getFacilities(
                categoryFilter !== 'all' ? categoryFilter : undefined
            );
            if (error) throw error;
            setFacilities(data || []);
        } catch (error) {
            console.error('Error loading facilities:', error);
            // Fallback demo data
            setFacilities([
                { id: "1", name: "Study Room A", category: "Study Room", description: "Quiet study room with whiteboard", location: "Library Level 2", capacity: 6, amenities: ["Whiteboard", "Power outlets", "Wifi"], image_url: null, max_hours_per_booking: 3, advance_booking_days: 7 },
                { id: "2", name: "Discussion Room 1", category: "Discussion Room", description: "Group discussion room", location: "Library Level 3", capacity: 10, amenities: ["TV Screen", "Whiteboard", "Wifi"], image_url: null, max_hours_per_booking: 2, advance_booking_days: 7 },
                { id: "3", name: "Badminton Court 1", category: "Sports", description: "Indoor badminton court", location: "Sports Complex", capacity: 4, amenities: ["Lighting", "Equipment rental"], image_url: null, max_hours_per_booking: 2, advance_booking_days: 7 },
                { id: "4", name: "MPH", category: "Hall", description: "Multi-purpose hall for events", location: "Chancellor Building", capacity: 500, amenities: ["Stage", "Sound system", "Projector"], image_url: null, max_hours_per_booking: 4, advance_booking_days: 14 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const loadMyBookings = async () => {
        if (!userId) return;
        try {
            const { data, error } = await bookingApi.getMyBookings(userId);
            if (error) throw error;
            setMyBookings(data as Booking[] || []);
        } catch (error) {
            console.error('Error loading bookings:', error);
            setMyBookings([]);
        }
    };

    const handleBook = async () => {
        if (!selectedFacility || !userId) {
            toast.error("Please login to book facilities");
            return;
        }
        if (!selectedDate || !selectedStartTime || !selectedEndTime) {
            toast.error("Please select date and time");
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await bookingApi.createBooking(
                selectedFacility.id,
                userId,
                selectedDate,
                selectedStartTime,
                selectedEndTime,
                bookingPurpose
            );
            if (error) throw error;

            toast.success(`Booked ${selectedFacility.name} successfully!`);
            setBookingDialogOpen(false);
            resetBookingForm();
            loadMyBookings();
        } catch (error: any) {
            toast.error(error.message || "Failed to book facility");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelBooking = async (bookingId: string, facilityName: string) => {
        try {
            const { error } = await bookingApi.cancelBooking(bookingId);
            if (error) throw error;
            toast.success(`Cancelled booking for ${facilityName}`);
            loadMyBookings();
        } catch (error: any) {
            toast.error(error.message || "Failed to cancel booking");
        }
    };

    const resetBookingForm = () => {
        setSelectedFacility(null);
        setSelectedDate("");
        setSelectedStartTime("");
        setSelectedEndTime("");
        setBookingPurpose("");
    };

    const categories = [...new Set(facilities.map(f => f.category))];
    const filteredFacilities = facilities.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const upcomingBookings = myBookings.filter(b =>
        b.status !== 'cancelled' && new Date(b.booking_date) >= new Date()
    );
    const pastBookings = myBookings.filter(b =>
        b.status === 'completed' || new Date(b.booking_date) < new Date()
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <CalendarDays className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">UBooking</h1>
                        <p className="text-muted-foreground">Facility Booking System</p>
                    </div>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search facilities..."
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
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{facilities.length}</p>
                            <p className="text-xs text-muted-foreground">Facilities</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                            <p className="text-xs text-muted-foreground">Upcoming</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <History className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{pastBookings.length}</p>
                            <p className="text-xs text-muted-foreground">Past Bookings</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Dumbbell className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{facilities.filter(f => f.category === 'Sports').length}</p>
                            <p className="text-xs text-muted-foreground">Sports Venues</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="facilities">Facilities</TabsTrigger>
                    <TabsTrigger value="mybookings">My Bookings</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Facilities Tab */}
                <TabsContent value="facilities" className="space-y-4">
                    {/* Category Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        <Button
                            variant={categoryFilter === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCategoryFilter("all")}
                        >
                            All
                        </Button>
                        {categories.map((cat) => (
                            <Button
                                key={cat}
                                variant={categoryFilter === cat ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCategoryFilter(cat)}
                            >
                                {categoryMap[cat] || "🏢"} {cat}
                            </Button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {filteredFacilities.map((facility) => (
                                <Card key={facility.id} className="overflow-hidden hover:shadow-lg transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 flex items-center justify-center text-2xl">
                                                    {categoryMap[facility.category] || "🏢"}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{facility.name}</h3>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" /> {facility.location}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Users className="h-3 w-3" /> Capacity: {facility.capacity}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge>{facility.category}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-3">{facility.description}</p>
                                        {facility.amenities && (
                                            <div className="flex flex-wrap gap-1 mt-3">
                                                {facility.amenities.map((amenity, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">{amenity}</Badge>
                                                ))}
                                            </div>
                                        )}
                                        <Dialog open={bookingDialogOpen && selectedFacility?.id === facility.id} onOpenChange={(open) => {
                                            setBookingDialogOpen(open);
                                            if (open) setSelectedFacility(facility);
                                            else resetBookingForm();
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button className="w-full mt-4 gap-2">
                                                    <Plus className="h-4 w-4" />
                                                    Book Now
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Book {facility.name}</DialogTitle>
                                                    <DialogDescription>
                                                        Max {facility.max_hours_per_booking} hours • Book up to {facility.advance_booking_days} days ahead
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 pt-4">
                                                    <div>
                                                        <label className="text-sm font-medium">Date</label>
                                                        <Input
                                                            type="date"
                                                            value={selectedDate}
                                                            onChange={(e) => setSelectedDate(e.target.value)}
                                                            min={new Date().toISOString().split('T')[0]}
                                                            max={new Date(Date.now() + facility.advance_booking_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-sm font-medium">Start Time</label>
                                                            <Select value={selectedStartTime} onValueChange={setSelectedStartTime}>
                                                                <SelectTrigger className="mt-1">
                                                                    <SelectValue placeholder="Select" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {timeSlots.map((time) => (
                                                                        <SelectItem key={time} value={time}>{time}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium">End Time</label>
                                                            <Select value={selectedEndTime} onValueChange={setSelectedEndTime}>
                                                                <SelectTrigger className="mt-1">
                                                                    <SelectValue placeholder="Select" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {timeSlots.filter(t => t > selectedStartTime).map((time) => (
                                                                        <SelectItem key={time} value={time}>{time}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium">Purpose</label>
                                                        <Textarea
                                                            placeholder="Describe your booking purpose..."
                                                            value={bookingPurpose}
                                                            onChange={(e) => setBookingPurpose(e.target.value)}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <Button className="w-full" onClick={handleBook} disabled={submitting}>
                                                        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                        Confirm Booking
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

                {/* My Bookings Tab */}
                <TabsContent value="mybookings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Bookings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {upcomingBookings.length > 0 ? (
                                upcomingBookings.map((booking) => (
                                    <div key={booking.id} className="p-4 rounded-lg border flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-2xl">
                                                {categoryMap[booking.facility?.category] || "🏢"}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{booking.facility?.name}</h3>
                                                <p className="text-sm text-muted-foreground flex items-center gap-3">
                                                    <span className="flex items-center gap-1">
                                                        <CalendarDays className="h-3 w-3" />
                                                        {new Date(booking.booking_date).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {booking.start_time} - {booking.end_time}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={booking.status === 'confirmed' ? 'bg-green-500' : ''}>
                                                {booking.status}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleCancelBooking(booking.id, booking.facility?.name)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No upcoming bookings</p>
                                    <Button className="mt-4" onClick={() => setActiveTab("facilities")}>
                                        Book a Facility
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking History</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {pastBookings.length > 0 ? (
                                pastBookings.map((booking) => (
                                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="font-medium">{booking.facility?.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(booking.booking_date).toLocaleDateString()} • {booking.start_time} - {booking.end_time}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary">Completed</Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No booking history</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
