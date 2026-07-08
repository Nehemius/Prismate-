import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required and must be a string." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback local heuristic moderation if API key is not set
      // to keep hackathon demo resilient offline / pre-setup
      const lowerContent = content.toLowerCase();
      const suspiciousWords = ["spam", "abuse", "fuck", "shit", "bitch", "crap", "dummy", "hate"];
      const isSuspicious = suspiciousWords.some((word) => lowerContent.includes(word));
      
      const academicWords = ["chemistry", "mechanism", "reaction", "why", "how", "what", "explain", "formula", "molecule"];
      const hasAcademicContext = academicWords.some((word) => lowerContent.includes(word)) || content.length > 15;

      const decision = !isSuspicious && hasAcademicContext ? "GENUINE" : "REJECT";
      
      return NextResponse.json({
        moderation: decision,
        simulated: true,
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using gemini-2.5-flash model as requested in the specification
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1,
      },
    });

    // Exact prompt from PRISMATE Build Spec Section 2.4
    const prompt = `You are an AI moderation backend. Analyze the student comment text provided.
Flag the comment as "REJECT" if it meets any of the following:
- Unrelated to school studies or academic material.
- Unproductive spam, low-effort trolling, or repetitive filler.
- Vulgar, abusive, or inappropriate language.
Otherwise, respond strictly with "APPROVE".

Student Comment:
"${content}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim().toUpperCase();

    // Map "APPROVE" to "GENUINE" for page.tsx state checking compatibility
    const decision = text.includes("APPROVE") ? "GENUINE" : "REJECT";

    return NextResponse.json({
      moderation: decision,
      simulated: false,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Gemini Moderation Error:", error);
    return NextResponse.json(
      { error: "Failed to moderate content", details: errorMessage },
      { status: 500 }
    );
  }
}
