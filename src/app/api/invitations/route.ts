import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { projectId, coFounderId, message } = await request.json();

    if (!projectId || !coFounderId || !message) {
      return NextResponse.json(
        { error: "Project ID, co-founder ID, and message are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if invitation already exists
    const { data: existingInvitation } = await supabase
      .from("project_invitations")
      .select("id")
      .eq("project_id", projectId)
      .eq("invited_user_id", coFounderId)
      .eq("inviter_id", user.id)
      .single();

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Invitation already sent" },
        { status: 400 }
      );
    }

    // Create the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from("project_invitations")
      .insert({
        project_id: projectId,
        inviter_id: user.id,
        invited_user_id: coFounderId,
        message: message,
        status: "pending"
      })
      .select()
      .single();

    if (invitationError) {
      console.error("Error creating invitation:", invitationError);
      return NextResponse.json(
        { error: "Failed to send invitation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      invitation,
      message: "Invitation sent successfully"
    });

  } catch (error) {
    console.error("Error sending invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'received'; // 'sent' or 'received'

    let query;
    if (type === 'sent') {
      query = supabase
        .from("project_invitations")
        .select(`
          *,
          projects!project_invitations_project_id_fkey (
            id,
            title,
            description,
            industry
          ),
          profiles!project_invitations_invited_user_id_fkey (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq("inviter_id", user.id);
    } else {
      query = supabase
        .from("project_invitations")
        .select(`
          *,
          projects!project_invitations_project_id_fkey (
            id,
            title,
            description,
            industry
          ),
          profiles!project_invitations_inviter_id_fkey (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq("invited_user_id", user.id);
    }

    const { data: invitations, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching invitations:", error);
      return NextResponse.json(
        { error: "Failed to fetch invitations" },
        { status: 500 }
      );
    }

    return NextResponse.json({ invitations });

  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
