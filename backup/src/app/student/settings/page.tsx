"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Bell, Mail, Moon, Sun, Globe, Shield } from "lucide-react";
import { useTheme } from "next-themes";

export default function StudentSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const { theme, setTheme } = useTheme();
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        ticketUpdates: true,
        marketingEmails: false,
    });

    useEffect(() => {
        setIsLoading(false);
    }, []);

    const handleToggle = (key: keyof typeof settings) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
        toast.success("Settings updated");
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your preferences</p>
            </div>

            <div className="grid gap-6 max-w-2xl">
                {/* Appearance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                            Appearance
                        </CardTitle>
                        <CardDescription>Customize the look of the application</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Dark Mode</Label>
                                <p className="text-sm text-muted-foreground">Use dark theme</p>
                            </div>
                            <Switch
                                checked={theme === "dark"}
                                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>Configure how you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Email Notifications</Label>
                                <p className="text-sm text-muted-foreground">Receive updates via email</p>
                            </div>
                            <Switch
                                checked={settings.emailNotifications}
                                onCheckedChange={() => handleToggle("emailNotifications")}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Push Notifications</Label>
                                <p className="text-sm text-muted-foreground">Browser push notifications</p>
                            </div>
                            <Switch
                                checked={settings.pushNotifications}
                                onCheckedChange={() => handleToggle("pushNotifications")}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Ticket Updates</Label>
                                <p className="text-sm text-muted-foreground">Get notified when tickets are updated</p>
                            </div>
                            <Switch
                                checked={settings.ticketUpdates}
                                onCheckedChange={() => handleToggle("ticketUpdates")}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Privacy
                        </CardTitle>
                        <CardDescription>Manage your privacy settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Marketing Emails</Label>
                                <p className="text-sm text-muted-foreground">Receive promotional content</p>
                            </div>
                            <Switch
                                checked={settings.marketingEmails}
                                onCheckedChange={() => handleToggle("marketingEmails")}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
