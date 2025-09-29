import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      purpose,
      description,
      aiFeatures,
      coFounderInvites,
      trustAgreement,
      equitySplit,
      generateContract
    } = body;

    // Validate required fields
    if (!name || !purpose) {
      return NextResponse.json({ error: 'Name and purpose are required' }, { status: 400 });
    }

    // Create workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name,
        purpose,
        description: description || null,
        creator_id: user.id,
        ai_features: (Array.isArray(aiFeatures) ? aiFeatures : []).filter((f: { id: string; enabled: boolean }) => f && f.enabled).map((f: { id: string; enabled: boolean }) => f.id),
        trust_agreement: trustAgreement || null,
        equity_split: equitySplit || null,
        generate_contract: generateContract || false,
        status: 'active'
      })
      .select()
      .single();

    if (workspaceError) {
      console.error('Error creating workspace:', workspaceError);
      return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
    }

    // Add creator as workspace member
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: 'owner',
        status: 'active'
      });

    if (memberError) {
      console.error('Error adding creator as member:', memberError);
      // If adding the creator fails, we should clean up the workspace
      await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspace.id);
      return NextResponse.json({ error: 'Failed to add creator as workspace member' }, { status: 500 });
    }

    // Handle co-founder invitations for shared workspaces
    if (purpose === 'shared' && coFounderInvites && coFounderInvites.length > 0) {
      for (const invite of coFounderInvites) {
        // Check if user exists by email
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('email', invite.email)
          .single();

        if (existingUser) {
          // Create invitation for existing user
          const { error: inviteError } = await supabase
            .from('workspace_invitations')
            .insert({
              workspace_id: workspace.id,
              invited_user_id: existingUser.id,
              invited_by: user.id,
              message: invite.message || null,
              status: 'pending'
            });

          if (inviteError) {
            console.error('Error creating invitation:', inviteError);
          }
        } else {
          // Create pending invitation for non-existing user
          const { error: inviteError } = await supabase
            .from('workspace_invitations')
            .insert({
              workspace_id: workspace.id,
              invited_email: invite.email,
              invited_by: user.id,
              message: invite.message || null,
              status: 'pending'
            });

          if (inviteError) {
            console.error('Error creating invitation:', inviteError);
          }
        }
      }
    }

    // Generate founder contract if requested
    if (generateContract && purpose === 'shared' && trustAgreement) {
      try {
        const contractPrompt = `Generate a lightweight founder agreement based on the following trust agreement: "${trustAgreement}". 
        
        The agreement should include:
        1. Basic equity split terms
        2. Decision-making process
        3. Intellectual property rights
        4. Exit clauses
        5. Dispute resolution
        
        Keep it concise but legally sound. Format as a markdown document.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a legal assistant specializing in startup founder agreements. Generate clear, concise legal documents."
            },
            {
              role: "user",
              content: contractPrompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.3
        });

        const contractContent = completion.choices[0]?.message?.content;

        if (contractContent) {
          // Save contract to workspace
          const { error: contractError } = await supabase
            .from('workspace_documents')
            .insert({
              workspace_id: workspace.id,
              title: 'Founder Agreement',
              content: contractContent,
              type: 'contract',
              created_by: user.id,
              status: 'draft'
            });

          if (contractError) {
            console.error('Error saving contract:', contractError);
          }
        }
      } catch (contractError) {
        console.error('Error generating contract:', contractError);
      }
    }

    // Log workspace creation in Trust Ledger
    if (purpose === 'shared') {
      const { error: ledgerError } = await supabase
        .from('trust_ledger_entries')
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          action: 'workspace_created',
          description: `Created shared workspace "${name}"`,
          trust_points: 5,
          metadata: {
            workspace_name: name,
            co_founder_count: coFounderInvites?.length || 0
          }
        });

      if (ledgerError) {
        console.error('Error logging to trust ledger:', ledgerError);
      }
    }

    return NextResponse.json({ 
      workspace,
      message: 'Workspace created successfully',
      redirectUrl: `/workspace-hub/${workspace.id}`
    });

  } catch (error) {
    console.error('Error in workspace creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's workspaces
    const { data: workspaces, error: workspacesError } = await supabase
      .from('workspace_members')
      .select(`
        workspace_id,
        role,
        status,
        workspaces (
          id,
          name,
          purpose,
          description,
          ai_features,
          created_at,
          status
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (workspacesError) {
      console.error('Error fetching workspaces:', workspacesError);
      return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 });
    }

    // Get member counts and project counts for each workspace
    const workspaceIds = workspaces?.map(w => w.workspace_id) || [];
    
    // Get member counts
    const { data: memberCounts } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .in('workspace_id', workspaceIds)
      .eq('status', 'active');

    // Get project counts
    const { data: projectCounts } = await supabase
      .from('workspace_projects')
      .select('workspace_id')
      .in('workspace_id', workspaceIds);

    // Count members and projects per workspace
    const memberCountMap: Record<string, number> = {};
    const projectCountMap: Record<string, number> = {};

    memberCounts?.forEach(member => {
      memberCountMap[member.workspace_id] = (memberCountMap[member.workspace_id] || 0) + 1;
    });

    projectCounts?.forEach(project => {
      projectCountMap[project.workspace_id] = (projectCountMap[project.workspace_id] || 0) + 1;
    });

    // Transform the data to include counts
    const workspacesWithCounts = workspaces?.map(workspace => {
      const workspaceData = Array.isArray(workspace.workspaces) ? workspace.workspaces[0] : workspace.workspaces;
      return {
        id: workspaceData?.id,
        name: workspaceData?.name,
        description: workspaceData?.description,
        purpose: workspaceData?.purpose,
        role: workspace.role,
        member_count: memberCountMap[workspace.workspace_id] || 0,
        project_count: projectCountMap[workspace.workspace_id] || 0,
        ai_features: workspaceData?.ai_features,
        created_at: workspaceData?.created_at,
        status: workspaceData?.status
      };
    }).filter(ws => ws.id) || [];

    return NextResponse.json({ workspaces: workspacesWithCounts });

  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
