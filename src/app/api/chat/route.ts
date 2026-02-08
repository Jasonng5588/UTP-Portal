import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize inside handler to prevent build errors if key is missing
function getOpenAIClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not set in environment variables");
    }
    return new OpenAI({ apiKey });
}

export async function POST(request: Request) {
    try {
        const { messages, context } = await request.json();

        const systemPrompt = `You are a helpful AI assistant for UTP (Universiti Teknologi PETRONAS) Customer Support System.

Your role is to:
1. Help students report issues and create support tickets
2. Guide them through describing their problem clearly
3. Suggest the most appropriate department for their issue
4. Be friendly, professional, and empathetic

Available departments and their areas:
- IT Services: Computer labs, network, email, software, hardware issues
- Academic Affairs: Course registration, grades, transcripts, academic calendar
- Finance Department: Fees, payments, scholarships, refunds
- Student Affairs: Accommodation, student activities, counseling, welfare
- Facilities Management: Buildings, maintenance, parking, transportation
- Library Services: Books, resources, library access, study spaces
- Security: Campus security, lost items, access cards

${context ? `Additional context: ${context}` : ""}

Guidelines:
- Ask clarifying questions when the issue is unclear
- Be concise but thorough
- Use a friendly, supportive tone
- If unsure about department, ask more about the specific issue
- Help categorize the severity (low/medium/high/urgent) based on impact`;

        const openai = getOpenAIClient();
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages,
            ],
            max_tokens: 500,
            temperature: 0.7,
        });

        const reply = completion.choices[0].message.content;

        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error("OpenAI error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to get AI response" },
            { status: 500 }
        );
    }
}
