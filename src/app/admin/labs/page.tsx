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
import { FlaskConical, Plus, Search, Calendar, User, CheckCircle, XCircle } from "lucide-react";

export default function LabsAdminPage() {
    const [activeTab, setActiveTab] = useState("labs");
    const [labs, setLabs] = useState<any[]>([]);
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
            // Fetch Labs
            const { data: labsData } = await supabase
                .from('labs')
                .select('*')
                .order('name');
            if (labsData) setLabs(labsData);

            // Fetch Lab Bookings
            const { data: bookingsData } = await supabase
                .from('lab_bookings')
                .select(`
                    *,
                    lab:labs(name, code),
                    student:profiles(full_name, student_id)
                `)
                .order('booking_date', { ascending: false });
            if (bookingsData) setBookings(bookingsData);

        } catch (error) {
            console.error('Error fetching lab data:', error);
            toast.error("Failed to load lab data");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBooking = async (bookingId: string, status: string) => {
        try {
            const { error } = await supabase
                .from('lab_bookings')
                .update({ status })
                .eq('id', bookingId);

            if (error) throw error;

            toast.success(`Booking ${status}`);
            fetchData();
        } catch (error: any) {
            toast.error("Failed to update booking");
        }
    };

    const filteredLabs = labs.filter(lab =>
        lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Labs Management</h1>
                    <p className="text-muted-foreground">Manage laboratories, equipment, and bookings</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Lab
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="labs">Laboratories</TabsTrigger>
                    <TabsTrigger value="bookings">Bookings Requests</TabsTrigger>
                </TabsList>

                <TabsContent value="labs" className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search labs..."
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
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLabs.map((lab) => (
                                    <TableRow key={lab.id}>
                                        <TableCell className="font-medium">{lab.code}</TableCell>
                                        <TableCell>{lab.name}</TableCell>
                                        <TableCell>{lab.building}, {lab.floor}</TableCell>
                                        <TableCell>{lab.capacity}</TableCell>
                                        <TableCell>
                                            <Badge variant={lab.is_active ? "default" : "secondary"}>
                                                {lab.is_active ? "Active" : "Maintenance"}
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
                                    <TableHead>Lab</TableHead>
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
                                        <TableCell className="font-medium">{booking.lab?.code}</TableCell>
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
