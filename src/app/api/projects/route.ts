import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get("industry");
    const stage = searchParams.get("stage");
    const commitment = searchParams.get("commitment");
    const roleNeeded = searchParams.get("roleNeeded");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from("projects")
      .select(`
        *,
        profiles!projects_author_id_fkey (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false });

    // Apply filters
    if (industry && industry !== "all") {
      query = query.eq("industry", industry);
    }
    
    if (stage && stage !== "any") {
      query = query.eq("stage", stage);
    }
    
    if (commitment && commitment !== "any") {
      query = query.eq("commitment", commitment);
    }
    
    if (roleNeeded) {
      query = query.ilike("role_needed", `%${roleNeeded}%`);
    }

    // Apply search
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,keywords.cs.{${search}}`);
    }

    // Get total count for pagination
    const { count, error: countError } = await query.select("*", { count: "exact", head: true });
    
    if (countError) {
      console.error("Projects API: Count error:", countError);
      return NextResponse.json({ error: "Failed to get project count", details: countError.message }, { status: 500 });
    }
    
    // Apply pagination
    const { data: projects, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Projects API: Query error:", error);
      
      // If the table doesn't exist yet, return empty results instead of error
      if (error.message?.includes("relation \"projects\" does not exist") || 
          error.message?.includes("does not exist") ||
          error.code === "PGRST116") {
        return NextResponse.json({
          projects: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        });
      }
      
      return NextResponse.json({ error: "Failed to fetch projects", details: error.message }, { status: 500 });
    }

    // Transform the data to match the frontend interface
    const transformedProjects = projects?.map(project => ({
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
        avatar: project.profiles?.avatar_url
      }
    })) || [];

    return NextResponse.json({
      projects: transformedProjects,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error("Projects API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json({ 
        error: "Server configuration error", 
        details: "Missing Supabase environment variables" 
      }, { status: 500 });
    }
    
    const supabase = await createClient();
    
    // Check if supabase client is properly initialized
    if (!supabase || !supabase.auth) {
      console.error("Supabase client not properly initialized");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      fullDescription,
      industry,
      stage,
      commitment,
      roleNeeded,
      requiredSkills,
      status = "planning",
      budget,
      deadline,
      keywords = []
    } = body;

    // Validate required fields
    if (!title || !description || !industry || !stage || !commitment || !roleNeeded || !requiredSkills?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert the project
    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        author_id: user.id,
        title,
        description,
        full_description: fullDescription,
        industry,
        stage,
        commitment,
        role_needed: roleNeeded,
        required_skills: requiredSkills,
        status,
        budget: budget || null,
        deadline: deadline || null,
        keywords
      })
      .select(`
        *,
        profiles!projects_author_id_fkey (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error("Error creating project:", error);
      return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }

    // Transform the response
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
        avatar: project.profiles?.avatar_url
      }
    };

    return NextResponse.json({ project: transformedProject }, { status: 201 });

  } catch (error) {
    console.error("Create project API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
