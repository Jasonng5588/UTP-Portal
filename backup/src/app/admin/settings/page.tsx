"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
    Settings,
    Bell,
    Clock,
    Shield,
    Palette,
    Mail,
    Save,
    Loader2,
} from "lucide-react";
import type { Profile } from "@/types";

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);

    const [settings, setSettings] = useState({
        // Notifications
        emailNotifications: true,
        slackNotifications: false,
        ticketAssignedEmail: true,
        ticketResolvedEmail: true,
        dailyDigest: false,

        // SLA
        slaLowHours: 72,
        slaMediumHours: 48,
        slaHighHours: 24,
        slaUrgentHours: 4,
        slaWarningThreshold: 80,

        // General
        autoAssign: true,
        businessHoursOnly: true,
        businessStart: "09:00",
        businessEnd: "18:00",
        timezone: "Asia/Kuala_Lumpur",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (data) setProfile(data as Profile);
            }

            setIsLoading(false);
        };

        fetchProfile();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);

        // Simulate saving settings
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast.success("Settings saved successfully");
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-4xl">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                    <p className="text-muted-foreground">
                        Configure system preferences and behavior
                    </p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    Save Changes
                </Button>
            </div>

            {/* Notification Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications
                    </CardTitle>
                    <CardDescription>
                        Configure how you receive notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive notifications via email
                            </p>
                        </div>
                        <Switch
                            checked={settings.emailNotifications}
                            onCheckedChange={(checked) =>
                                setSettings({ ...settings, emailNotifications: checked })
                            }
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Ticket Assigned</Label>
                            <p className="text-sm text-muted-foreground">
                                Get notified when a ticket is assigned to you
                            </p>
                        </div>
                        <Switch
                            checked={settings.ticketAssignedEmail}
                            onCheckedChange={(checked) =>
                                setSettings({ ...settings, ticketAssignedEmail: checked })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Ticket Resolved</Label>
                            <p className="text-sm text-muted-foreground">
                                Get notified when a ticket is resolved
                            </p>
                        </div>
                        <Switch
                            checked={settings.ticketResolvedEmail}
                            onCheckedChange={(checked) =>
                                setSettings({ ...settings, ticketResolvedEmail: checked })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Daily Digest</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive a daily summary of ticket activity
                            </p>
                        </div>
                        <Switch
                            checked={settings.dailyDigest}
                            onCheckedChange={(checked) =>
                                setSettings({ ...settings, dailyDigest: checked })
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* SLA Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        SLA Configuration
                    </CardTitle>
                    <CardDescription>
                        Set response time targets for different priority levels
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="slaLow">Low Priority (hours)</Label>
                            <Input
                                id="slaLow"
                                type="number"
                                value={settings.slaLowHours}
                                onChange={(e) => setSettings({ ...settings, slaLowHours: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slaMedium">Medium Priority (hours)</Label>
                            <Input
                                id="slaMedium"
                                type="number"
                                value={settings.slaMediumHours}
                                onChange={(e) => setSettings({ ...settings, slaMediumHours: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slaHigh">High Priority (hours)</Label>
                            <Input
                                id="slaHigh"
                                type="number"
                                value={settings.slaHighHours}
                                onChange={(e) => setSettings({ ...settings, slaHighHours: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slaUrgent">Urgent Priority (hours)</Label>
                            <Input
                                id="slaUrgent"
                                type="number"
                                value={settings.slaUrgentHours}
                                onChange={(e) => setSettings({ ...settings, slaUrgentHours: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label htmlFor="slaWarning">SLA Warning Threshold (%)</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                            Show warning when this percentage of SLA time has elapsed
                        </p>
                        <Input
                            id="slaWarning"
                            type="number"
                            value={settings.slaWarningThreshold}
                            onChange={(e) => setSettings({ ...settings, slaWarningThreshold: parseInt(e.target.value) })}
                            className="w-32"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* General Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        General
                    </CardTitle>
                    <CardDescription>
                        System-wide preferences
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Auto-assign Tickets</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically assign new tickets to available agents
                            </p>
                        </div>
                        <Switch
                            checked={settings.autoAssign}
                            onCheckedChange={(checked) =>
                                setSettings({ ...settings, autoAssign: checked })
                            }
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Business Hours Only</Label>
                            <p className="text-sm text-muted-foreground">
                                Only count SLA time during business hours
                            </p>
                        </div>
                        <Switch
                            checked={settings.businessHoursOnly}
                            onCheckedChange={(checked) =>
                                setSettings({ ...settings, businessHoursOnly: checked })
                            }
                        />
                    </div>

                    {settings.businessHoursOnly && (
                        <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-muted">
                            <div className="space-y-2">
                                <Label htmlFor="businessStart">Start Time</Label>
                                <Input
                                    id="businessStart"
                                    type="time"
                                    value={settings.businessStart}
                                    onChange={(e) => setSettings({ ...settings, businessStart: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="businessEnd">End Time</Label>
                                <Input
                                    id="businessEnd"
                                    type="time"
                                    value={settings.businessEnd}
                                    onChange={(e) => setSettings({ ...settings, businessEnd: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
