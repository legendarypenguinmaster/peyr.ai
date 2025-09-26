import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: diagrams, error } = await supabase
      .from("workspace_diagrams")
      .select("*")
      .eq("workspace_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching diagrams:", error);
      return NextResponse.json({ error: "Failed to fetch diagrams" }, { status: 500 });
    }

    return NextResponse.json(diagrams);
  } catch (error) {
    console.error("Diagrams API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
