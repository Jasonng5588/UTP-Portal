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
import { printApi } from "@/lib/api";
import {
    Printer,
    Upload,
    Clock,
    MapPin,
    DollarSign,
    CheckCircle,
    XCircle,
    Loader2,
    History,
    Wallet,
    CreditCard,
    FileText,
    Copy,
    RefreshCw,
} from "lucide-react";

type PrintJob = {
    id: string;
    file_name: string;
    pages: number;
    copies: number;
    is_color: boolean;
    paper_size: string;
    is_double_sided: boolean;
    station_id: string | null;
    cost: number;
    status: string;
    created_at: string;
    printed_at: string | null;
};

type PrintStation = {
    id: string;
    name: string;
    location: string;
    status: string;
    queue_count: number;
    has_color: boolean;
};

type PrintBalance = {
    id: string;
    balance: number;
    last_topup_at: string | null;
    last_topup_amount: number | null;
};

const pricing = {
    bw: { a4: 0.05, a3: 0.10 },
    color: { a4: 0.30, a3: 0.50 }
};

export default function UPrintPage() {
    const [activeTab, setActiveTab] = useState("print");
    const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
    const [stations, setStations] = useState<PrintStation[]>([]);
    const [balance, setBalance] = useState<PrintBalance | null>(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    // Print job form
    const [printDialogOpen, setPrintDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [pages, setPages] = useState(1);
    const [copies, setCopies] = useState(1);
    const [isColor, setIsColor] = useState(false);
    const [paperSize, setPaperSize] = useState("A4");
    const [isDoubleSided, setIsDoubleSided] = useState(false);
    const [selectedStation, setSelectedStation] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Top up
    const [topupDialogOpen, setTopupDialogOpen] = useState(false);
    const [topupAmount, setTopupAmount] = useState(10);

    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUser();
    }, []);

    useEffect(() => {
        loadStations();
    }, []);

    useEffect(() => {
        if (userId) {
            loadBalance();
            loadPrintJobs();
        }
    }, [userId]);

    const loadStations = async () => {
        try {
            const { data, error } = await printApi.getPrintStations();
            if (error) throw error;
            setStations(data || []);
        } catch (error) {
            // Fallback demo data
            setStations([
                { id: "1", name: "Library Print Station", location: "Library Level 1", status: "online", queue_count: 2, has_color: true },
                { id: "2", name: "Academic Block 1", location: "AB1 Level 2", status: "online", queue_count: 0, has_color: true },
                { id: "3", name: "V1 Print Kiosk", location: "Village 1 Common Room", status: "online", queue_count: 3, has_color: false },
                { id: "4", name: "V5 Print Kiosk", location: "Village 5 Common Room", status: "offline", queue_count: 0, has_color: false },
            ]);
        }
    };

    const loadBalance = async () => {
        if (!userId) return;
        try {
            const { data, error } = await printApi.getBalance(userId);
            if (error && error.code !== 'PGRST116') throw error; // Ignore not found
            setBalance(data || { id: "", balance: 15.50, last_topup_at: null, last_topup_amount: null });
        } catch (error) {
            setBalance({ id: "", balance: 15.50, last_topup_at: null, last_topup_amount: null });
        }
    };

    const loadPrintJobs = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const { data, error } = await printApi.getMyPrintJobs(userId);
            if (error) throw error;
            setPrintJobs(data || []);
        } catch (error) {
            console.error('Error loading print jobs:', error);
            setPrintJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateCost = () => {
        const pricePerPage = isColor
            ? pricing.color[paperSize.toLowerCase() as keyof typeof pricing.color] || 0.30
            : pricing.bw[paperSize.toLowerCase() as keyof typeof pricing.bw] || 0.05;
        const totalPages = isDoubleSided ? Math.ceil(pages / 2) : pages;
        return pricePerPage * totalPages * copies;
    };

    const handleSubmitPrintJob = async () => {
        if (!userId || !selectedFile) {
            toast.error("Please select a file");
            return;
        }
        if (!selectedStation) {
            toast.error("Please select a print station");
            return;
        }

        const cost = calculateCost();
        if (balance && cost > balance.balance) {
            toast.error("Insufficient balance. Please top up first.");
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await printApi.submitPrintJob(
                userId,
                selectedFile.name,
                pages,
                copies,
                isColor,
                paperSize,
                selectedStation,
                cost
            );
            if (error) throw error;

            toast.success("Print job submitted successfully!");
            setPrintDialogOpen(false);
            resetPrintForm();
            loadPrintJobs();
            loadBalance();
        } catch (error: any) {
            toast.error(error.message || "Failed to submit print job");
        } finally {
            setSubmitting(false);
        }
    };

    const handleTopUp = async () => {
        if (!userId) return;
        try {
            const { error } = await printApi.topUpBalance(userId, topupAmount);
            if (error) throw error;
            toast.success(`Topped up RM ${topupAmount.toFixed(2)} successfully!`);
            setTopupDialogOpen(false);
            loadBalance();
        } catch (error: any) {
            toast.error(error.message || "Failed to top up");
        }
    };

    const handleCancelJob = async (jobId: string) => {
        try {
            const { error } = await printApi.cancelPrintJob(jobId);
            if (error) throw error;
            toast.success("Print job cancelled");
            loadPrintJobs();
        } catch (error: any) {
            toast.error(error.message || "Failed to cancel job");
        }
    };

    const resetPrintForm = () => {
        setSelectedFile(null);
        setPages(1);
        setCopies(1);
        setIsColor(false);
        setPaperSize("A4");
        setIsDoubleSided(false);
        setSelectedStation("");
    };

    const pendingJobs = printJobs.filter(j => j.status === 'queued' || j.status === 'printing');
    const completedJobs = printJobs.filter(j => j.status === 'completed');

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                        <Printer className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">UPrint</h1>
                        <p className="text-muted-foreground">Campus Print Services</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Dialog open={topupDialogOpen} onOpenChange={setTopupDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Wallet className="h-4 w-4" />
                                Top Up
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Top Up Print Balance</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="p-4 rounded-lg bg-muted/50 text-center">
                                    <p className="text-sm text-muted-foreground">Current Balance</p>
                                    <p className="text-3xl font-bold">RM {balance?.balance.toFixed(2) || "0.00"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Amount (RM)</label>
                                    <Select value={topupAmount.toString()} onValueChange={(v) => setTopupAmount(parseInt(v))}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">RM 5.00</SelectItem>
                                            <SelectItem value="10">RM 10.00</SelectItem>
                                            <SelectItem value="20">RM 20.00</SelectItem>
                                            <SelectItem value="50">RM 50.00</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button className="w-full gap-2" onClick={handleTopUp}>
                                    <CreditCard className="h-4 w-4" />
                                    Pay & Top Up
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Upload className="h-4 w-4" />
                                New Print Job
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Submit Print Job</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div>
                                    <label className="text-sm font-medium">File</label>
                                    <Input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        className="mt-1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Pages</label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={pages}
                                            onChange={(e) => setPages(parseInt(e.target.value) || 1)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Copies</label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={copies}
                                            onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Paper Size</label>
                                        <Select value={paperSize} onValueChange={setPaperSize}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A4">A4</SelectItem>
                                                <SelectItem value="A3">A3</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Print Station</label>
                                        <Select value={selectedStation} onValueChange={setSelectedStation}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {stations.filter(s => s.status === 'online').map(station => (
                                                    <SelectItem key={station.id} value={station.id}>
                                                        {station.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isColor}
                                            onChange={(e) => setIsColor(e.target.checked)}
                                            className="rounded"
                                        />
                                        <span className="text-sm">Color</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isDoubleSided}
                                            onChange={(e) => setIsDoubleSided(e.target.checked)}
                                            className="rounded"
                                        />
                                        <span className="text-sm">Double-sided</span>
                                    </label>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Estimated Cost:</span>
                                        <span className="font-bold">RM {calculateCost().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Balance After:</span>
                                        <span>RM {((balance?.balance || 0) - calculateCost()).toFixed(2)}</span>
                                    </div>
                                </div>
                                <Button className="w-full" onClick={handleSubmitPrintJob} disabled={submitting}>
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Printer className="h-4 w-4 mr-2" />}
                                    Submit Print Job
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Balance Card */}
            <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100">Print Balance</p>
                            <p className="text-4xl font-bold">RM {balance?.balance.toFixed(2) || "0.00"}</p>
                            {balance?.last_topup_at && (
                                <p className="text-blue-100 text-sm mt-1">
                                    Last top-up: RM {balance.last_topup_amount?.toFixed(2)} on {new Date(balance.last_topup_at).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        <Wallet className="h-16 w-16 text-blue-200" />
                    </div>
                </CardContent>
            </Card>

            {/* Print Stations */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stations.map((station) => (
                    <Card key={station.id}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${station.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-xs capitalize">{station.status}</span>
                            </div>
                            <h3 className="font-semibold text-sm">{station.name}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {station.location}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">{station.queue_count} in queue</span>
                                {station.has_color && <Badge variant="outline" className="text-xs">Color</Badge>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="print">Active Jobs</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                </TabsList>

                {/* Active Jobs */}
                <TabsContent value="print" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Print Queue</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : pendingJobs.length > 0 ? (
                                pendingJobs.map((job) => (
                                    <div key={job.id} className="p-4 rounded-lg border flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <FileText className="h-8 w-8 text-blue-500" />
                                            <div>
                                                <h3 className="font-semibold">{job.file_name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {job.pages} pages × {job.copies} copies • {job.is_color ? "Color" : "B&W"} • {job.paper_size}
                                                </p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(job.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="font-semibold">RM {job.cost.toFixed(2)}</p>
                                                <Badge className={job.status === 'printing' ? 'bg-blue-500' : 'bg-yellow-500'}>
                                                    {job.status}
                                                </Badge>
                                            </div>
                                            <Button size="sm" variant="destructive" onClick={() => handleCancelJob(job.id)}>
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Printer className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No active print jobs</p>
                                    <Button className="mt-4" onClick={() => setPrintDialogOpen(true)}>
                                        Submit Print Job
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
                            <CardTitle>Print History</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {completedJobs.length > 0 ? (
                                completedJobs.map((job) => (
                                    <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="font-medium">{job.file_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {job.pages} pages • RM {job.cost.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-500">Completed</Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No print history</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Pricing */}
                <TabsContent value="pricing" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing Guide</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-3">Type</th>
                                            <th className="text-right p-3">A4</th>
                                            <th className="text-right p-3">A3</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="p-3">Black & White</td>
                                            <td className="text-right p-3">RM 0.05</td>
                                            <td className="text-right p-3">RM 0.10</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3">Color</td>
                                            <td className="text-right p-3">RM 0.30</td>
                                            <td className="text-right p-3">RM 0.50</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-sm text-muted-foreground mt-4">
                                * Double-sided printing calculates per sheet, not per page
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
