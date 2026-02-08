import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { messages, title, description } = await request.json();

        let textToSummarize = "";

        if (messages && messages.length > 0) {
            // Summarize conversation
            textToSummarize = messages.map((m: { role: string; content: string }) =>
                `${m.role.toUpperCase()}: ${m.content}`
            ).join("\n");
        } else if (title && description) {
            // Summarize ticket
            textToSummarize = `Title: ${title}\n\nDescription: ${description}`;
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a support ticket summarizer. Create a brief, professional summary of the ticket or conversation provided. 
The summary should:
1. Be 2-3 sentences maximum
2. Capture the main issue or request
3. Note any important details or deadlines mentioned
4. Be written in third person
5. Be clear and actionable for support staff`,
                },
                {
                    role: "user",
                    content: `Please summarize the following:\n\n${textToSummarize}`,
                },
            ],
            max_tokens: 150,
            temperature: 0.5,
        });

        const summary = completion.choices[0].message.content;

        return NextResponse.json({ summary });
    } catch (error: any) {
        console.error("Summarization error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to summarize" },
            { status: 500 }
        );
    }
}
