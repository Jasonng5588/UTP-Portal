"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
    Send,
    Paperclip,
    Bot,
    User,
    Check,
    Loader2,
    Sparkles,
} from "lucide-react";
import type { ChatMessage, Department, Subcategory } from "@/types";

// Smart keyword classification for UTP departments
const DEPARTMENT_KEYWORDS: Record<string, string[]> = {
    "Residential Village": [
        "room", "hostel", "village", "v1", "v2", "v3", "v4", "v5", "v6", "rv",
        "fan", "air conditioner", "ac", "aircon", "aircond", "bed", "mattress", "wardrobe",
        "toilet", "bathroom", "shower", "water heater", "lamp", "light", "bulb",
        "door", "lock", "key", "window", "curtain", "leak", "leaking", "pipe",
        "sink", "floor", "ceiling", "wall", "furniture", "chair", "table",
        "roommate", "cleaning", "laundry", "pantry", "fridge", "refrigerator",
        "pest", "cockroach", "ant", "mosquito", "accommodation", "dorm", "dormitory",
        "check-in", "check-out", "residential", "housing", "broke", "broken", "faulty",
        "spoil", "rosak", "kipas", "bilik", "lampu", "tandas", "pintu"
    ],
    "IT Services": [
        "wifi", "internet", "network", "lan", "ethernet", "computer", "laptop",
        "email", "microsoft", "office", "365", "teams", "outlook", "password",
        "reset", "login", "account", "portal", "website", "system", "software",
        "printer", "printing", "scan", "scanner", "projector", "lab", "computer lab",
        "virus", "malware", "vpn", "it", "tech", "technical", "server", "slow",
        "connection", "connect", "access", "online", "download", "install", "sis"
    ],
    "Academic Registry": [
        "course", "register", "registration", "add", "drop", "withdraw", "class",
        "schedule", "timetable", "credit", "semester", "exam", "examination",
        "result", "grade", "gpa", "cgpa", "transcript", "certificate", "graduation",
        "convocation", "academic", "lecturer", "faculty", "department", "tutorial",
        "assignment", "appeal", "defer", "deferment", "supplementary", "repeat"
    ],
    "Student Affairs": [
        "student id", "matric", "card", "club", "society", "activity", "event",
        "orientation", "counseling", "counselor", "mental", "stress", "anxiety",
        "depression", "personal", "welfare", "international", "visa", "passport",
        "scholarship", "sponsorship", "ptptn", "loan", "allowance", "stipend",
        "discipline", "misconduct", "letter", "support", "ssd"
    ],
    "Finance": [
        "fee", "fees", "payment", "pay", "tuition", "invoice", "receipt", "bill",
        "refund", "financial", "aid", "sponsor", "bank", "account", "transfer",
        "outstanding", "balance", "debit", "credit", "money", "charge", "cost", "bayar"
    ],
    "Library": [
        "library", "book", "borrow", "return", "fine", "overdue", "reserve",
        "journal", "article", "database", "research", "study room", "quiet",
        "resource", "irc", "e-book", "ebook", "magazine", "newspaper", "copy", "perpustakaan"
    ],
    "Health Centre": [
        "sick", "ill", "illness", "fever", "headache", "pain", "doctor", "nurse",
        "medical", "health", "clinic", "medicine", "medication", "appointment",
        "mc", "certificate", "injury", "emergency", "ambulance", "hospital",
        "dental", "teeth", "eye", "vaccination", "vaccine", "flu", "sakit"
    ],
    "Security": [
        "security", "guard", "safe", "safety", "lost", "found", "theft", "steal",
        "stolen", "crime", "police", "emergency", "fire", "accident", "incident",
        "parking", "vehicle", "car", "motorcycle", "bike", "pass", "access card",
        "gate", "visitor", "suspicious", "report", "noise", "hilang"
    ],
    "Transportation": [
        "bus", "shuttle", "transport", "travel", "airport", "station", "schedule",
        "route", "delay", "late", "pick", "drop", "commute", "bas"
    ],
    "Facilities": [
        "building", "classroom", "lecture", "hall", "lift", "elevator", "escalator",
        "stairs", "restroom", "washroom", "cafeteria", "canteen", "food", "court",
        "renovation", "construction", "electricity", "power", "outage", "dewan"
    ]
};

const PRIORITY_KEYWORDS: Record<string, string[]> = {
    urgent: ["urgent", "emergency", "immediately", "asap", "critical", "dangerous", "fire", "flood", "security", "theft", "accident", "cannot", "locked out", "no water", "no electricity"],
    high: ["important", "soon", "tomorrow", "deadline", "exam", "broken", "not working", "stuck", "need help", "broke"],
    medium: ["issue", "problem", "help", "request", "need", "want", "would like"],
    low: ["question", "inquiry", "wondering", "curious", "when", "how to", "information", "feedback", "suggestion"]
};

function smartClassify(text: string): { department: string; priority: string; confidence: number } {
    const lowerText = text.toLowerCase();

    // Score each department
    const scores: Record<string, number> = {};
    for (const [dept, keywords] of Object.entries(DEPARTMENT_KEYWORDS)) {
        scores[dept] = keywords.filter(kw => lowerText.includes(kw)).length;
    }

    // Find best match
    let bestDept = "Student Affairs";
    let bestScore = 0;
    for (const [dept, score] of Object.entries(scores)) {
        if (score > bestScore) {
            bestScore = score;
            bestDept = dept;
        }
    }

    // Determine priority
    let priority = "medium";
    for (const [prio, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
        if (keywords.some(kw => lowerText.includes(kw))) {
            priority = prio;
            break;
        }
    }

    const confidence = bestScore > 0 ? Math.min(0.95, 0.5 + bestScore * 0.15) : 0.3;

    return { department: bestDept, priority, confidence };
}

interface CollectedData {
    description: string;
    department_id: string | null;
    department_name: string | null;
    subcategory_id: string | null;
    subcategory_name: string | null;
    priority: string;
    title: string;
}

export default function NewReportPage() {
    const router = useRouter();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stage, setStage] = useState<"greeting" | "collecting" | "subcategory" | "confirming" | "done">("greeting");
    const [departments, setDepartments] = useState<Department[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

    // Use ref to store data to avoid async state issues
    const dataRef = useRef<CollectedData>({
        description: "",
        department_id: null,
        department_name: null,
        subcategory_id: null,
        subcategory_name: null,
        priority: "medium",
        title: "",
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadDepartments = async () => {
            const supabase = createClient();
            const { data } = await supabase.from("departments").select("*").eq("is_active", true).order("name");
            if (data) setDepartments(data as Department[]);
        };
        loadDepartments();

        // Initial greeting
        setTimeout(() => {
            addBotMessage("Hi! 👋 I'm your intelligent AI assistant.\n\nJust tell me your problem in natural language - I'll automatically understand and route it to the right department.\n\n**Examples:**\n• \"My room fan is not working\"\n• \"Cannot connect to WiFi\"\n• \"Need to check my exam results\"\n\nWhat issue can I help you with today?");
            setStage("collecting");
        }, 500);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const addBotMessage = (content: string) => {
        setMessages(prev => [...prev, { role: "assistant", content, timestamp: new Date() }]);
    };

    const addUserMessage = (content: string) => {
        setMessages(prev => [...prev, { role: "user", content, timestamp: new Date() }]);
    };

    const loadSubcategories = async (departmentId: string) => {
        const supabase = createClient();
        const { data } = await supabase.from("subcategories").select("*").eq("department_id", departmentId).eq("is_active", true).order("name");
        if (data) setSubcategories(data as Subcategory[]);
        return data || [];
    };

    const generateSmartTitle = (text: string): string => {
        const cleaned = text.replace(/[^\w\s]/g, ' ').trim();
        const words = cleaned.split(/\s+/).slice(0, 8);
        let title = words.join(' ');
        if (title.length > 60) title = title.substring(0, 57) + "...";
        return title.charAt(0).toUpperCase() + title.slice(1);
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userInput = inputValue.trim();
        addUserMessage(userInput);
        setInputValue("");
        setIsTyping(true);

        if (stage === "collecting") {
            // SMART AUTO-CLASSIFICATION
            const classification = smartClassify(userInput);

            // Match to database department
            const matchedDept = departments.find(d => {
                const deptLower = d.name.toLowerCase();
                const classLower = classification.department.toLowerCase();
                return deptLower.includes(classLower) ||
                    classLower.includes(deptLower.split(' ')[0]) ||
                    deptLower.split('(')[0].trim().toLowerCase().includes(classLower.split(' ')[0]);
            }) || departments[0];

            const title = generateSmartTitle(userInput);
            const deptName = matchedDept?.name || classification.department;
            const deptId = matchedDept?.id || null;

            // Store in ref immediately (sync)
            dataRef.current = {
                description: userInput,
                department_id: deptId,
                department_name: deptName,
                subcategory_id: null,
                subcategory_name: null,
                priority: classification.priority,
                title: title,
            };

            // Simulate AI thinking
            await new Promise(r => setTimeout(r, 800));
            setIsTyping(false);

            // Show classification result
            const priorityEmoji = { urgent: "🔴", high: "🟠", medium: "🟡", low: "🟢" }[classification.priority] || "🟡";

            addBotMessage(`✨ **I understood your issue!**\n\n📋 **Issue:** ${title}\n🏢 **Department:** ${deptName}\n${priorityEmoji} **Priority:** ${classification.priority.charAt(0).toUpperCase() + classification.priority.slice(1)}\n\n_I've automatically analyzed your request and determined the best department to handle it._`);

            // Load subcategories
            if (deptId) {
                const subs = await loadSubcategories(deptId);
                if (subs.length > 0) {
                    setTimeout(() => {
                        addBotMessage("To help us serve you better, what specific type of issue is this?");
                        setStage("subcategory");
                    }, 1200);
                } else {
                    setTimeout(() => showConfirmation(), 1200);
                }
            } else {
                setTimeout(() => showConfirmation(), 1200);
            }

        } else if (stage === "subcategory") {
            const matchedSub = subcategories.find(s =>
                s.name.toLowerCase().includes(userInput.toLowerCase()) ||
                userInput.toLowerCase().includes(s.name.toLowerCase().split(' ')[0])
            );

            if (matchedSub) {
                dataRef.current.subcategory_id = matchedSub.id;
                dataRef.current.subcategory_name = matchedSub.name;
            }

            setIsTyping(false);
            showConfirmation();

        } else if (stage === "confirming") {
            const lower = userInput.toLowerCase();
            if (lower.includes("yes") || lower.includes("confirm") || lower.includes("submit") || lower.includes("ok")) {
                setIsTyping(false);
                await handleCreateTicket();
            } else if (lower.includes("no") || lower.includes("cancel") || lower.includes("start over")) {
                setIsTyping(false);
                resetConversation();
            } else {
                // User adding more details
                dataRef.current.description += "\n\nAdditional details: " + userInput;
                setIsTyping(false);
                addBotMessage("I've added your additional details. Ready to submit?");
            }
        }
    };

    const showConfirmation = () => {
        const data = dataRef.current;
        const priorityDisplay = data.priority.charAt(0).toUpperCase() + data.priority.slice(1);
        const summary = `📝 **Ready to Submit Your Ticket**\n\n**Title:** ${data.title}\n**Description:** ${data.description}\n**Department:** ${data.department_name}${data.subcategory_name ? `\n**Category:** ${data.subcategory_name}` : ""}\n**Priority:** ${priorityDisplay}\n\nClick **Submit** to create your ticket, or type any additional details.`;
        addBotMessage(summary);
        setStage("confirming");
    };

    const resetConversation = () => {
        setMessages([]);
        setStage("greeting");
        dataRef.current = {
            description: "", department_id: null, department_name: null,
            subcategory_id: null, subcategory_name: null, priority: "medium", title: "",
        };
        setTimeout(() => {
            addBotMessage("No problem! Let's start fresh. What's your issue?");
            setStage("collecting");
        }, 300);
    };

    const handleCreateTicket = async () => {
        setIsSubmitting(true);
        const data = dataRef.current;

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please log in");
                setIsSubmitting(false);
                return;
            }

            const { data: ticket, error } = await supabase.from("tickets").insert({
                user_id: user.id,
                title: data.title,
                description: data.description,
                department_id: data.department_id,
                subcategory_id: data.subcategory_id,
                priority: data.priority,
                status: "open",
            }).select().single();

            if (error) {
                toast.error("Failed: " + error.message);
                setIsSubmitting(false);
                return;
            }

            await supabase.from("messages").insert({
                ticket_id: ticket.id,
                sender_id: user.id,
                message_type: "user",
                content: data.description,
            });

            setStage("done");
            addBotMessage(`🎉 **Success!**\n\n**Ticket #${ticket.ticket_number}** has been created!\n\nOur ${data.department_name} team will respond soon. You can track your ticket in "My Reports".\n\nThank you for using UTP Support!`);
            toast.success("Ticket created!");
            setTimeout(() => router.push(`/student/reports/${ticket.id}`), 3000);
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubcategoryClick = (sub: Subcategory) => {
        addUserMessage(sub.name);
        dataRef.current.subcategory_id = sub.id;
        dataRef.current.subcategory_name = sub.name;
        setTimeout(() => showConfirmation(), 500);
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    Smart AI Assistant
                </h1>
                <p className="text-muted-foreground">Just describe your issue - I'll handle the rest! 🤖</p>
            </div>

            <Card className="min-h-[600px] flex flex-col">
                <CardHeader className="border-b bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">UTP Smart Assistant</CardTitle>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                Intelligent Auto-Classification
                            </p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex items-start gap-3 animate-fade-in ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary" : "bg-gradient-to-br from-blue-500 to-indigo-600"}`}>
                                {msg.role === "user" ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4 text-white" />}
                            </div>
                            <div className={`max-w-[80%] ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"} px-4 py-3`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div className="chat-bubble-ai px-4 py-3">
                                <div className="flex gap-1 items-center">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">Analyzing your request...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Subcategory quick buttons */}
                    {stage === "subcategory" && subcategories.length > 0 && !isTyping && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {subcategories.map((sub) => (
                                <Button key={sub.id} variant="outline" size="sm" onClick={() => handleSubcategoryClick(sub)}
                                    className="hover:bg-primary hover:text-primary-foreground transition-all">
                                    {sub.name}
                                </Button>
                            ))}
                            <Button variant="ghost" size="sm" onClick={() => showConfirmation()}>Skip →</Button>
                        </div>
                    )}

                    {/* Confirm buttons */}
                    {stage === "confirming" && !isTyping && !isSubmitting && (
                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleCreateTicket} disabled={isSubmitting} className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                Submit Ticket
                            </Button>
                            <Button variant="outline" onClick={resetConversation}>Start Over</Button>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </CardContent>

                <div className="border-t p-4">
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
                        <Button type="button" variant="ghost" size="icon" className="shrink-0">
                            <Paperclip className="h-5 w-5" />
                        </Button>
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={stage === "done" ? "Ticket created!" : "Describe your issue here..."}
                            disabled={isTyping || isSubmitting || stage === "done"}
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled={!inputValue.trim() || isTyping || stage === "done"}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600">
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
