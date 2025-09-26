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

    const { data: meetings, error } = await supabase
      .from("workspace_meetings")
      .select("*")
      .eq("workspace_id", id)
      .gte("meeting_time", new Date().toISOString())
      .order("meeting_time", { ascending: true });

    if (error) {
      console.error("Error fetching meetings:", error);
      return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 });
    }

    return NextResponse.json(meetings);
  } catch (error) {
    console.error("Meetings API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
