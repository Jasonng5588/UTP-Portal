"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
    User,
    Mail,
    Phone,
    IdCard,
    Camera,
    Loader2,
    Save,
} from "lucide-react";
import type { Profile } from "@/types";

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        student_id: "",
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

                if (data) {
                    setProfile(data as Profile);
                    setFormData({
                        full_name: data.full_name || "",
                        phone: data.phone || "",
                        student_id: data.student_id || "",
                    });
                }
            }

            setIsLoading(false);
        };

        fetchProfile();
    }, []);

    const handleSave = async () => {
        if (!profile) return;

        setIsSaving(true);
        const supabase = createClient();

        const { error } = await supabase
            .from("profiles")
            .update({
                full_name: formData.full_name,
                phone: formData.phone,
                student_id: formData.student_id,
            })
            .eq("id", profile.id);

        if (error) {
            toast.error("Failed to update profile");
        } else {
            toast.success("Profile updated successfully");
            setProfile({ ...profile, ...formData });
        }

        setIsSaving(false);
    };

    const getInitials = (name: string | null) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-2xl mx-auto">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-64" />
                <Skeleton className="h-48" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Profile</h1>
                <p className="text-muted-foreground">
                    Manage your account information
                </p>
            </div>

            {/* Avatar Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={profile?.avatar_url || ""} />
                                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                    {getInitials(profile?.full_name ?? null)}
                                </AvatarFallback>
                            </Avatar>
                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors">
                                <Camera className="h-4 w-4" />
                            </button>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">{profile?.full_name || "User"}</h2>
                            <p className="text-muted-foreground">{profile?.email}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Member since {new Date(profile?.created_at || "").toLocaleDateString("en-MY", {
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Profile Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                        Update your personal details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="full_name"
                                placeholder="Your full name"
                                className="pl-10"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                value={profile?.email || ""}
                                disabled
                                className="pl-10 bg-muted"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Email cannot be changed
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    placeholder="+60 12-345 6789"
                                    className="pl-10"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="student_id">Student ID</Label>
                            <div className="relative">
                                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="student_id"
                                    placeholder="20001234"
                                    className="pl-10"
                                    value={formData.student_id}
                                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
