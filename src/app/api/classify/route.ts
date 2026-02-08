import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// UTP-specific department mapping with keywords
const UTP_DEPARTMENTS: Record<string, { keywords: string[]; description: string }> = {
    "Residential Village (RV)": {
        keywords: [
            "room", "hostel", "village", "v1", "v2", "v3", "v4", "v5", "v6",
            "fan", "air conditioner", "ac", "aircon", "bed", "mattress", "wardrobe",
            "toilet", "bathroom", "shower", "water heater", "lamp", "light", "bulb",
            "door", "lock", "key", "window", "curtain", "leak", "leaking", "pipe",
            "sink", "floor", "ceiling", "wall", "furniture", "chair", "table",
            "roommate", "cleaning", "laundry", "pantry", "fridge", "refrigerator",
            "pest", "cockroach", "ant", "mosquito", "accommodation", "dorm", "dormitory",
            "check-in", "check-out", "rv", "residential", "housing", "broke", "broken", "faulty"
        ],
        description: "Residential Village - room maintenance, hostel facilities, accommodation issues"
    },
    "Information Technology Services (ITS)": {
        keywords: [
            "wifi", "internet", "network", "lan", "ethernet", "computer", "laptop",
            "email", "microsoft", "office", "365", "teams", "outlook", "password",
            "reset", "login", "account", "portal", "website", "system", "software",
            "printer", "printing", "scan", "scanner", "projector", "lab", "computer lab",
            "virus", "malware", "vpn", "it", "tech", "technical", "server", "slow",
            "connection", "connect", "access", "online", "download", "install"
        ],
        description: "IT Services - network, email, software, computer-related issues"
    },
    "Academic Registry": {
        keywords: [
            "course", "register", "registration", "add", "drop", "withdraw", "class",
            "schedule", "timetable", "credit", "semester", "exam", "examination",
            "result", "grade", "gpa", "cgpa", "transcript", "certificate", "graduation",
            "convocation", "academic", "lecturer", "faculty", "department", "tutorial",
            "assignment", "appeal", "defer", "deferment", "special", "supplementary"
        ],
        description: "Academic Registry - course registration, grades, transcripts, exams"
    },
    "Student Affairs": {
        keywords: [
            "student id", "matric", "card", "club", "society", "activity", "event",
            "orientation", "counseling", "counselor", "mental", "stress", "anxiety",
            "depression", "personal", "welfare", "international", "visa", "passport",
            "scholarship", "sponsorship", "ptptn", "loan", "allowance", "stipend",
            "discipline", "misconduct", "appeal", "letter", "support", "ssd"
        ],
        description: "Student Affairs - student ID, clubs, counseling, international students"
    },
    "Finance Department": {
        keywords: [
            "fee", "fees", "payment", "pay", "tuition", "invoice", "receipt", "bill",
            "refund", "financial", "aid", "sponsor", "bank", "account", "transfer",
            "outstanding", "balance", "debit", "credit", "money", "charge", "cost"
        ],
        description: "Finance - fees, payments, refunds, financial matters"
    },
    "Information Resource Centre (Library)": {
        keywords: [
            "library", "book", "borrow", "return", "fine", "overdue", "reserve",
            "journal", "article", "database", "research", "study room", "quiet",
            "resource", "irc", "e-book", "ebook", "magazine", "newspaper", "copy"
        ],
        description: "Library/IRC - books, research resources, study spaces"
    },
    "Health Centre": {
        keywords: [
            "sick", "ill", "illness", "fever", "headache", "pain", "doctor", "nurse",
            "medical", "health", "clinic", "medicine", "medication", "appointment",
            "mc", "certificate", "injury", "emergency", "ambulance", "hospital",
            "dental", "teeth", "eye", "vaccination", "vaccine", "covid", "flu"
        ],
        description: "Health Centre - medical services, clinic, health issues"
    },
    "Security": {
        keywords: [
            "security", "guard", "safe", "safety", "lost", "found", "theft", "steal",
            "stolen", "crime", "police", "emergency", "fire", "accident", "incident",
            "parking", "vehicle", "car", "motorcycle", "bike", "pass", "access card",
            "gate", "visitor", "suspicious", "report", "complaint", "noise"
        ],
        description: "Security - campus safety, lost & found, parking, emergencies"
    },
    "Transportation": {
        keywords: [
            "bus", "shuttle", "transport", "travel", "airport", "station", "schedule",
            "route", "delay", "late", "pick", "drop", "commute"
        ],
        description: "Transportation - campus buses, shuttle services"
    },
    "Facilities Management": {
        keywords: [
            "building", "classroom", "lecture", "hall", "lab", "laboratory", "lift",
            "elevator", "escalator", "stairs", "toilet", "restroom", "washroom",
            "cafeteria", "canteen", "food", "court", "maintenance", "repair", "clean",
            "renovation", "construction", "electricity", "power", "outage"
        ],
        description: "Facilities - campus buildings, classrooms, common areas maintenance"
    }
};

// Priority keywords
const PRIORITY_KEYWORDS: Record<string, string[]> = {
    urgent: [
        "urgent", "emergency", "immediately", "asap", "critical", "dangerous",
        "fire", "flood", "leak", "security", "theft", "accident", "cannot access",
        "locked out", "no water", "no electricity", "deadline today"
    ],
    high: [
        "important", "soon", "tomorrow", "deadline", "exam", "cannot work",
        "cannot study", "blocking", "stuck", "not working", "broken"
    ],
    medium: [
        "issue", "problem", "help", "request", "need", "want", "would like"
    ],
    low: [
        "question", "inquiry", "wondering", "curious", "when", "how to",
        "information", "general", "feedback", "suggestion"
    ]
};

function classifyLocally(text: string): { department: string; priority: string; confidence: number } {
    const lowerText = text.toLowerCase();
    let bestMatch = { department: "Student Affairs", score: 0 };

    // Find best matching department
    for (const [dept, config] of Object.entries(UTP_DEPARTMENTS)) {
        const matchCount = config.keywords.filter(kw => lowerText.includes(kw)).length;
        if (matchCount > bestMatch.score) {
            bestMatch = { department: dept, score: matchCount };
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

    const confidence = bestMatch.score > 0 ? Math.min(0.9, 0.3 + bestMatch.score * 0.15) : 0.3;

    return {
        department: bestMatch.department,
        priority,
        confidence
    };
}

export async function POST(request: Request) {
    try {
        const { description, title } = await request.json();
        const text = `${title || ""} ${description}`.toLowerCase();

        // First try local classification
        const localResult = classifyLocally(text);

        // If we have OpenAI API key and low confidence, use AI
        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your_openai_api_key_here") {
            try {
                const deptList = Object.entries(UTP_DEPARTMENTS)
                    .map(([name, config]) => `- ${name}: ${config.description}`)
                    .join("\n");

                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: `You are a UTP (Universiti Teknologi PETRONAS) support ticket classifier. 
Given a student's issue description, classify it into the most appropriate department.

Available UTP Departments:
${deptList}

IMPORTANT CLASSIFICATION RULES:
- Room issues (fan, AC, furniture, leaks, etc.) → Residential Village (RV)
- Network/WiFi/Computer issues → Information Technology Services (ITS)
- Course/Grades/Exam issues → Academic Registry
- Medical/Health issues → Health Centre
- Lost items/Security concerns → Security
- Building/Classroom maintenance → Facilities Management

Also assess priority:
- urgent: emergencies, safety issues, no access to essential services
- high: blocking issues affecting studies/work
- medium: regular problems needing attention
- low: questions, suggestions, non-urgent inquiries

Respond ONLY with valid JSON:
{"department": "[exact department name from list]", "priority": "[low|medium|high|urgent]", "category": "[specific issue type]", "confidence": 0.0-1.0}`
                        },
                        {
                            role: "user",
                            content: `Title: ${title || "No title"}\nDescription: ${description}`,
                        },
                    ],
                    max_tokens: 100,
                    temperature: 0.2,
                });

                const aiResponse = completion.choices[0].message.content;
                const classification = JSON.parse(aiResponse || "{}");

                return NextResponse.json({
                    ...classification,
                    source: "ai"
                });
            } catch (aiError) {
                console.error("AI classification error, using local:", aiError);
            }
        }

        // Return local classification
        return NextResponse.json({
            ...localResult,
            category: "General",
            source: "local"
        });

    } catch (error: any) {
        console.error("Classification error:", error);
        return NextResponse.json(
            { department: "Student Affairs", priority: "medium", category: "General", confidence: 0.3 },
            { status: 200 }
        );
    }
}
