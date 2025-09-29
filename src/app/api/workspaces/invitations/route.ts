import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workspaceId, userIds = [], emails = [], message } = await request.json();
    if (!workspaceId || (!Array.isArray(userIds) && !Array.isArray(emails))) {
      return NextResponse.json({ error: "workspaceId and recipients are required" }, { status: 400 });
    }

    // Filter out self
    const targets: string[] = (userIds || []).filter((id: string) => id && id !== user.id);
    const emailTargets: string[] = (emails || []).map((e: string) => String(e).trim().toLowerCase()).filter(Boolean);
    if (targets.length === 0 && emailTargets.length === 0) return NextResponse.json({ inserted: 0, invitations: [] }, { status: 200 });

    // Fetch existing invitations to avoid duplicates
    const { data: existing, error: existingError } = await supabase
      .from('workspace_invitations')
      .select('invited_user_id, invited_email')
      .eq('workspace_id', workspaceId)
      .or([
        targets.length ? `invited_user_id.in.(${targets.join(',')})` : 'invited_user_id.is.null',
        emailTargets.length ? `invited_email.in.(${emailTargets.map(e => `'${e}'`).join(',')})` : 'invited_email.is.null'
      ].join(','))
      .eq('invited_by', user.id);

    if (existingError) {
      console.error('Error checking existing invitations:', existingError);
    }

    const alreadyUsers = new Set((existing || []).map(r => r.invited_user_id).filter(Boolean));
    const alreadyEmails = new Set((existing || []).map(r => r.invited_email).filter(Boolean));
    const toInsertUsers = targets
      .filter(id => !alreadyUsers.has(id))
      .map(id => ({ workspace_id: workspaceId, invited_user_id: id, invited_by: user.id, message: message || null, status: 'pending' }));
    const toInsertEmails = emailTargets
      .filter(e => !alreadyEmails.has(e))
      .map(e => ({ workspace_id: workspaceId, invited_email: e, invited_by: user.id, message: message || null, status: 'pending' }));
    const toInsert = [...toInsertUsers, ...toInsertEmails];

    if (toInsert.length === 0) return NextResponse.json({ inserted: 0, invitations: [] }, { status: 200 });

    const { data: inserted, error: insertError } = await supabase
      .from('workspace_invitations')
      .insert(toInsert)
      .select('*');

    if (insertError) {
      console.error('Error inserting invitations:', insertError);
      return NextResponse.json({ error: 'Failed to create invitations' }, { status: 500 });
    }

    return NextResponse.json({ inserted: inserted?.length || 0, invitations: inserted }, { status: 201 });
  } catch (e) {
    console.error('Error in workspace invitations:', e as Error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const { data, error } = await supabase
      .from('workspace_invitations')
      .select('id, workspace_id, invited_user_id, invited_by, status, message, created_at, workspaces(name)')
      .eq('invited_user_id', user.id)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const invitations = (data || []) as unknown as { id: string; workspace_id: string; invited_user_id: string | null; invited_by: string; status: string; message: string | null; created_at: string; workspaces?: { name: string } | null }[];

    // Fetch inviter profiles in a second query (RLS-safe against public.profiles)
    const inviterIds = Array.from(new Set(invitations.map((i) => i.invited_by).filter(Boolean)));
    const invitersById: Record<string, { id: string; name: string | null; email: string | null }> = {};
    if (inviterIds.length > 0) {
      const { data: inviters } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', inviterIds);
      (inviters || []).forEach((p: { id: string; name: string | null; email: string | null }) => { invitersById[p.id] = { id: p.id, name: p.name || null, email: p.email || null }; });
    }

    const enriched = invitations.map((inv) => ({
      ...inv,
      invited_by_profile: invitersById[inv.invited_by] || null,
    }));

    return NextResponse.json({ invitations: enriched });
  } catch (e) {
    console.error('Error listing invitations:', e as Error);
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { invitationId, action } = await request.json();
    if (!invitationId || !['accept','decline'].includes(action)) {
      return NextResponse.json({ error: 'invitationId and valid action required' }, { status: 400 });
    }

    // Fetch invitation to validate
    const { data: inv, error: invErr } = await supabase
      .from('workspace_invitations')
      .select('id, workspace_id, invited_user_id, status')
      .eq('id', invitationId)
      .single();
    if (invErr || !inv) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    if (inv.invited_user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (inv.status !== 'pending') return NextResponse.json({ error: 'Invitation not pending' }, { status: 400 });

    if (action === 'accept') {
      // Add member (idempotent) then mark accepted
      const { error: memErr } = await supabase
        .from('workspace_members')
        .upsert({ workspace_id: inv.workspace_id, user_id: user.id, role: 'member', status: 'active' }, { onConflict: 'workspace_id,user_id' });
      if (memErr) {
        console.error('Error adding member:', memErr);
        // If duplicate (23505) or similar, continue to mark accepted
      }
      const { error: upErr } = await supabase
        .from('workspace_invitations')
        .update({ status: 'accepted' })
        .eq('id', inv.id);
      if (upErr) throw upErr;
      return NextResponse.json({ ok: true });
    } else {
      const { error: upErr } = await supabase
        .from('workspace_invitations')
        .update({ status: 'declined' })
        .eq('id', inv.id);
      if (upErr) throw upErr;
      return NextResponse.json({ ok: true });
    }
  } catch (e) {
    console.error('Error updating invitation:', e as Error);
    return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 });
  }
}


