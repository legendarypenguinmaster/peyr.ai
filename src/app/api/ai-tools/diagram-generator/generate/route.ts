import { NextRequest, NextResponse } from "next/server";
import { generateMermaidDiagram, DiagramType } from "@/lib/diagramGenerator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, description } = body;

    // Validate input
    if (!type || !description) {
      return NextResponse.json(
        { error: "Type and description are required" },
        { status: 400 }
      );
    }

    if (!["flowchart", "process-flow", "workflow", "mind-map", "org-chart"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid diagram type" },
        { status: 400 }
      );
    }

    if (description.trim().length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters" },
        { status: 400 }
      );
    }

    // Generate the diagram
    const result = await generateMermaidDiagram(type as DiagramType, description);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Diagram generation error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to generate diagram",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
