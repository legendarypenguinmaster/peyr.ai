import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { title, industry, description } = await request.json();

    if (!title || !industry || !description) {
      return NextResponse.json(
        { error: "Title, industry, and description are required" },
        { status: 400 }
      );
    }

    const prompt = `You are a startup project description generator. Based on the following information, create a comprehensive and engaging full description for a project posting:

Project Title: ${title}
Industry: ${industry}
Short Description: ${description}

Please generate a detailed full description that includes:
1. A compelling overview of the project
2. The problem being solved
3. The solution approach
4. Target market and potential impact
5. What the team is looking for in a co-founder
6. The opportunity and vision

IMPORTANT: Format your response using HTML tags for proper styling:
- Use <h2> tags for section headers (like "Overview:", "The Problem:", etc.)
- Use <strong> tags for bold text and emphasis
- Use <em> tags for italic text
- Use <p> tags for paragraphs
- Use <ul> and <li> tags for lists when appropriate
- Use <blockquote> tags for important quotes or highlights
- Use <u> tags for underlined text when needed
- Make key phrases and important terms bold using <strong>
- Use <em> for subtle emphasis on important concepts

Make it professional, engaging, and around 200-300 words. Focus on attracting the right co-founder who would be excited about this opportunity. Return only the HTML content without any markdown formatting.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert startup consultant who helps create compelling project descriptions for co-founder matching platforms. Always format your responses using proper HTML tags for rich text display. Never use markdown formatting - only HTML tags."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const generatedDescription = completion.choices[0]?.message?.content;

    if (!generatedDescription) {
      throw new Error("Failed to generate description");
    }

    return NextResponse.json({
      description: generatedDescription.trim()
    });

  } catch (error) {
    console.error("Error generating description:", error);
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 }
    );
  }
}
