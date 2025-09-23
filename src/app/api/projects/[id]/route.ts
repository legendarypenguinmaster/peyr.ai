import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check if supabase client is properly initialized
    if (!supabase || !supabase.from) {
      console.error("Supabase client not properly initialized");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const { data: project, error } = await supabase
      .from("projects")
      .select(`
        *,
        profiles!projects_author_id_fkey (
          id,
          name,
          email,
          avatar_url,
          role
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching project:", error);
      
      // If the table doesn't exist yet, return 404
      if (error.message?.includes("relation \"projects\" does not exist") || 
          error.message?.includes("does not exist") ||
          error.code === "PGRST116") {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Transform the data to match the frontend interface
    const transformedProject = {
      id: project.id,
      title: project.title,
      description: project.description,
      fullDescription: project.full_description,
      industry: project.industry,
      stage: project.stage,
      commitment: project.commitment,
      roleNeeded: project.role_needed,
      requiredSkills: project.required_skills,
      status: project.status,
      budget: project.budget,
      deadline: project.deadline,
      keywords: project.keywords,
      createdAt: project.created_at,
      author: {
        id: project.profiles?.id,
        name: project.profiles?.name || "Anonymous",
        email: project.profiles?.email,
        avatar: project.profiles?.avatar_url,
        role: project.profiles?.role
      }
    };

    return NextResponse.json({ project: transformedProject });

  } catch (error) {
    console.error("Project detail API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
