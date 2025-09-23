import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type DiagramType = "flowchart" | "process-flow" | "workflow" | "mind-map" | "org-chart";

export interface DiagramRequest {
  type: DiagramType;
  description: string;
}

export interface DiagramResponse {
  mermaidCode: string;
  title: string;
  description: string;
}

const diagramTypePrompts = {
  flowchart: `Create a Mermaid flowchart that visualizes the process described. Use standard flowchart symbols:
- Rectangles for processes
- Diamonds for decisions
- Circles for start/end points
- Arrows to show flow direction
- Use clear, concise labels`,
  
  "process-flow": `Create a Mermaid flowchart that shows a step-by-step business process. Focus on:
- Sequential steps in the process
- Decision points and branching
- Clear process flow from start to finish
- Use business-friendly terminology`,
  
  workflow: `Create a Mermaid flowchart that represents a workflow with tasks and dependencies. Include:
- Task nodes with clear names
- Dependencies between tasks
- Parallel and sequential flows
- Decision points where needed`,
  
  "mind-map": `Create a Mermaid mindmap that organizes ideas and concepts in a radial structure. Structure it as:
- Central topic in the center
- Main branches radiating outward
- Sub-branches for detailed concepts
- Use hierarchical organization`,
  
  "org-chart": `Create a Mermaid flowchart that shows an organizational hierarchy. Structure it as:
- Top-level management at the top
- Departments and teams below
- Individual roles and positions
- Clear reporting relationships`
};

export async function generateMermaidDiagram(type: DiagramType, description: string): Promise<DiagramResponse> {
  const systemPrompt = `You are an expert at creating Mermaid diagrams. Your task is to convert natural language descriptions into accurate, well-structured Mermaid diagram code.

${diagramTypePrompts[type]}

IMPORTANT RULES:
1. Return ONLY the Mermaid code, no explanations or markdown formatting
2. Use proper Mermaid syntax for the diagram type
3. Keep node labels concise but descriptive
4. Ensure the diagram is logically structured
5. Use appropriate Mermaid diagram types (flowchart, mindmap, etc.)
6. Make sure the code is valid and will render without errors

Example format for flowchart:
\`\`\`
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E
\`\`\`

Example format for mindmap:
\`\`\`
mindmap
  root((Central Topic))
    Branch 1
      Sub-branch 1.1
      Sub-branch 1.2
    Branch 2
      Sub-branch 2.1
\`\`\``;

  const userPrompt = `Create a ${type.replace("-", " ")} diagram for the following description:

"${description}"

Generate the Mermaid code that best represents this process or structure.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const mermaidCode = completion.choices[0]?.message?.content?.trim() || "";
    
    // Clean up the response (remove markdown code blocks if present)
    const cleanCode = mermaidCode.replace(/```mermaid\n?/g, "").replace(/```\n?/g, "").trim();
    
    return {
      mermaidCode: cleanCode,
      title: `${type.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())} Diagram`,
      description: `Generated from: ${description.substring(0, 100)}${description.length > 100 ? "..." : ""}`
    };
  } catch (error) {
    console.error("Error generating Mermaid diagram:", error);
    throw new Error("Failed to generate diagram. Please try again.");
  }
}

// Fallback function for client-side use (without OpenAI)
export function generateMermaidDiagramFallback(type: DiagramType): string {
  const templates = {
    flowchart: `flowchart TD
    A[Start] --> B{Decision Point}
    B -->|Yes| C[Process Step 1]
    B -->|No| D[Process Step 2]
    C --> E[End]
    D --> E`,
    
    "process-flow": `flowchart LR
    A[Step 1] --> B[Step 2]
    B --> C[Step 3]
    C --> D[Step 4]
    D --> E[Complete]`,
    
    workflow: `flowchart TD
    A[Task 1] --> B[Task 2]
    A --> C[Task 3]
    B --> D[Task 4]
    C --> D
    D --> E[Final Task]`,
    
    "mind-map": `mindmap
  root((Main Topic))
    Branch 1
      Sub-branch 1.1
      Sub-branch 1.2
    Branch 2
      Sub-branch 2.1
    Branch 3
      Sub-branch 3.1`,
    
    "org-chart": `flowchart TD
    A[CEO] --> B[Department 1]
    A --> C[Department 2]
    B --> D[Team Lead 1]
    B --> E[Team Lead 2]
    C --> F[Team Lead 3]`
  };

  return templates[type] || templates.flowchart;
}
