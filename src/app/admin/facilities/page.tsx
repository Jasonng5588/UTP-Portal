"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Building2, Plus, Search, Calendar, User, CheckCircle, XCircle } from "lucide-react";

export default function FacilitiesAdminPage() {
    const [activeTab, setActiveTab] = useState("facilities");
    const [facilities, setFacilities] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Facilities
            const { data: facilitiesData } = await supabase
                .from('facilities')
                .select('*')
                .order('name');
            if (facilitiesData) setFacilities(facilitiesData);

            // Fetch Facility Bookings
            const { data: bookingsData } = await supabase
                .from('facility_bookings')
                .select(`
                    *,
                    facility:facilities(name, category),
                    student:profiles(full_name, student_id)
                `)
                .order('booking_date', { ascending: false });
            if (bookingsData) setBookings(bookingsData);

        } catch (error) {
            console.error('Error fetching facilities data:', error);
            toast.error("Failed to load facilities data");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBooking = async (bookingId: string, status: string) => {
        try {
            const { error } = await supabase
                .from('facility_bookings')
                .update({ status })
                .eq('id', bookingId);

            if (error) throw error;

            toast.success(`Booking ${status}`);
            fetchData();
        } catch (error: any) {
            toast.error("Failed to update booking");
        }
    };

    const filteredFacilities = facilities.filter(facility =>
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Facilities Management</h1>
                    <p className="text-muted-foreground">Manage campus facilities and bookings</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Facility
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="facilities">Facilities</TabsTrigger>
                    <TabsTrigger value="bookings">Booking Requests</TabsTrigger>
                </TabsList>

                <TabsContent value="facilities" className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search facilities..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredFacilities.map((facility) => (
                                    <TableRow key={facility.id}>
                                        <TableCell className="font-medium">{facility.name}</TableCell>
                                        <TableCell>{facility.category}</TableCell>
                                        <TableCell>{facility.location}</TableCell>
                                        <TableCell>{facility.capacity}</TableCell>
                                        <TableCell>
                                            <Badge variant={facility.is_active ? "default" : "secondary"}>
                                                {facility.is_active ? "Active" : "Closed"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="bookings" className="space-y-4">
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Facility</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Purpose</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bookings.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">{booking.facility?.name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{booking.student?.full_name}</span>
                                                <span className="text-xs text-muted-foreground">{booking.student?.student_id}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{booking.booking_date}</TableCell>
                                        <TableCell>{booking.start_time} - {booking.end_time}</TableCell>
                                        <TableCell className="max-w-xs truncate" title={booking.purpose}>{booking.purpose}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={booking.status === 'confirmed' ? "default" :
                                                    booking.status === 'cancelled' ? "destructive" : "secondary"}
                                            >
                                                {booking.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {booking.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleUpdateBooking(booking.id, 'confirmed')}>
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleUpdateBooking(booking.id, 'cancelled')}>
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
