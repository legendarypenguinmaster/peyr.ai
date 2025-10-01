import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const supabase = await createClient();

    // Verify user has access to workspace
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: member } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch documents (no joins to avoid FK hint issues)
    const { data: docs, error } = await supabase
      .from('workspace_documents')
      .select('id, title, type, project_id, created_by, updated_at, file_url, content, size_bytes')
      .eq('workspace_id', workspaceId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }

    const documents = docs || [];

    // Also fetch stored files (only doc type) from workspace_documents_meta for this workspace
    const { data: metaDocs } = await supabase
      .from('workspace_documents_meta')
      .select('path, uploader_id, created_at, workspace_id, project_id, file_type')
      .eq('workspace_id', workspaceId)
      .eq('file_type', 'doc');

    // Build preliminary combined list with placeholders for enrichment
    const metaAsDocs = (metaDocs || []).map((m: { path: string; uploader_id: string | null; created_at: string; project_id: string | null }) => {
      // derive title from filename
      const parts = m.path.split('/')
      const fileName = parts[parts.length - 1] || 'document';
      const { data: pub } = supabase.storage.from('workspace_documents').getPublicUrl(m.path);
      return {
        id: m.path, // path as stable id for meta-backed docs
        title: fileName,
        type: 'document' as string,
        project_id: m.project_id,
        created_by: m.uploader_id || '',
        updated_at: m.created_at,
        file_url: pub?.publicUrl || null,
        content: null as string | null,
        size_bytes: null as number | null,
        __source: 'meta' as 'meta' | 'db'
      };
    });

    const baseDocs = documents.map(d => ({ ...d, __source: 'db' as const }));
    const combined = [...baseDocs, ...metaAsDocs];

    const creatorIds = Array.from(new Set(combined.map(d => d.created_by).filter(Boolean))) as string[];
    const projectIds = Array.from(new Set(combined.map(d => d.project_id).filter(Boolean))) as string[];

    // Fetch creators from profiles
    const profilesMap: Record<string, { name: string | null; avatar_url: string | null }> = {};
    if (creatorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', creatorIds);
      (profiles || []).forEach((p: { id: string; name: string | null; avatar_url: string | null }) => {
        profilesMap[p.id] = { name: p.name, avatar_url: p.avatar_url };
      });
    }

    // Fetch project names
    const projectsMap: Record<string, { name: string | null }> = {};
    if (projectIds.length > 0) {
      const { data: projects } = await supabase
        .from('workspace_projects')
        .select('id, name')
        .in('id', projectIds);
      (projects || []).forEach((p: { id: string; name: string | null }) => {
        projectsMap[p.id] = { name: p.name };
      });
    }

    const transformedDocuments = combined.map(d => ({
      id: d.id,
      title: d.title,
      type: d.type,
      project_id: d.project_id,
      project_name: d.project_id ? (projectsMap[d.project_id]?.name || null) : null,
      created_by: d.created_by,
      creator_name: profilesMap[d.created_by]?.name || null,
      creator_avatar_url: profilesMap[d.created_by]?.avatar_url || null,
      updated_at: d.updated_at,
      file_url: d.file_url,
      content: d.content,
      size_bytes: d.size_bytes,
    }));

    // Sort by updated_at desc
    transformedDocuments.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return NextResponse.json({ documents: transformedDocuments });
  } catch (error) {
    console.error('Error in documents GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const supabase = await createClient();

    // Verify user has access to workspace
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: member } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const project_id = formData.get('project_id') as string;
    const file = formData.get('file') as File | null;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    let file_url = null;
    
    // Handle file upload if provided
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${workspaceId}/documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('workspace_documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('workspace_documents')
        .getPublicUrl(filePath);

      file_url = publicUrl;

      // Also add to workspace_documents_meta for consistency
      try {
        await supabase.from('workspace_documents_meta').upsert({
          path: filePath,
          uploader_id: user.id,
          size_bytes: file.size,
          created_at: new Date().toISOString(),
          file_type: 'doc',
          workspace_id: workspaceId,
          project_id: project_id || null,
        }, { onConflict: 'path' });
      } catch (metaError) {
        console.error('Error updating file metadata:', metaError);
        // Don't fail the whole operation if metadata update fails
      }
    }

    // Create document record
    const { data: document, error: insertError } = await supabase
      .from('workspace_documents')
      .insert({
        workspace_id: workspaceId,
        title: title.trim(),
        content: description || null,
        type: type || 'document',
        project_id: project_id || null,
        file_url,
        size_bytes: file ? file.size : null,
        created_by: user.id,
        status: 'draft',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating document:', insertError);
      return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
    }

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Error in documents POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

