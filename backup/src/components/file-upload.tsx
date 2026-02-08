"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Paperclip, X, FileText, Image, File, Loader2 } from "lucide-react";

interface FileUploadProps {
    ticketId: string;
    messageId?: string;
    onUploadComplete?: (attachment: { file_name: string; file_url: string; file_type: string; file_size: number }) => void;
    disabled?: boolean;
}

export function FileUpload({ ticketId, messageId, onUploadComplete, disabled }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size must be less than 10MB");
            return;
        }

        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            toast.error("You must be logged in to upload files");
            setIsUploading(false);
            return;
        }

        try {
            // Generate unique file path
            const fileExt = selectedFile.name.split(".").pop();
            const fileName = `${ticketId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("attachments")
                .upload(fileName, selectedFile);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from("attachments")
                .getPublicUrl(fileName);

            // Save attachment record
            const { error: dbError } = await supabase.from("attachments").insert({
                ticket_id: ticketId,
                message_id: messageId || null,
                file_name: selectedFile.name,
                file_url: urlData.publicUrl,
                file_type: selectedFile.type,
                file_size: selectedFile.size,
                uploaded_by: user.id,
            });

            if (dbError) throw dbError;

            toast.success("File uploaded successfully");
            setSelectedFile(null);

            if (onUploadComplete) {
                onUploadComplete({
                    file_name: selectedFile.name,
                    file_url: urlData.publicUrl,
                    file_type: selectedFile.type,
                    file_size: selectedFile.size,
                });
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.message || "Failed to upload file");
        }

        setIsUploading(false);
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith("image/")) return Image;
        if (type.includes("pdf") || type.includes("document")) return FileText;
        return File;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="flex items-center gap-2">
            <Input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            />

            {selectedFile ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                    {(() => {
                        const Icon = getFileIcon(selectedFile.type);
                        return <Icon className="h-4 w-4 text-muted-foreground" />;
                    })()}
                    <span className="text-sm truncate max-w-32">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setSelectedFile(null)}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleUpload}
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
                    </Button>
                </div>
            ) : (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                >
                    <Paperclip className="h-5 w-5" />
                </Button>
            )}
        </div>
    );
}
