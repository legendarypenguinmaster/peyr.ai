import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; documentId: string }> }
) {
  const { workspaceId, documentId } = await params;
  return NextResponse.json({ 
    message: 'Route is working', 
    workspaceId, 
    documentId 
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; documentId: string }> }
) {
  try {
    const { workspaceId, documentId } = await params;
    console.log('DELETE request received for document:', documentId, 'in workspace:', workspaceId);
    console.log('Request URL:', request.url);
    
    const supabase = await createClient();

    // Verify user has access to workspace
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User ID:', user.id);

    const { data: member } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!member) {
      console.log('User is not a member of workspace');
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    console.log('User role:', member.role);

    // Get document to check ownership and get file info
    const { data: document, error: fetchError } = await supabase
      .from('workspace_documents')
      .select('id, file_url, created_by')
      .eq('id', documentId)
      .eq('workspace_id', workspaceId)
      .single();

    if (fetchError || !document) {
      console.log('Document not found or error:', fetchError);
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    console.log('Found document:', document);

    // Check if user can delete (owner or admin)
    if (document.created_by !== user.id && member.role !== 'admin') {
      console.log('Permission denied - user is not owner or admin');
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Delete from workspace_documents table
    console.log('Deleting document from database...');
    const { data: deleteData, error: deleteError } = await supabase
      .from('workspace_documents')
      .delete()
      .eq('id', documentId)
      .select();

    console.log('Delete operation result:', { deleteData, deleteError });

    if (deleteError) {
      console.error('Error deleting document:', deleteError);
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }

    if (!deleteData || deleteData.length === 0) {
      console.log('No rows were deleted - document may not exist or RLS blocked deletion');
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    console.log('Successfully deleted document from database:', deleteData);
    return NextResponse.json({ success: true, deletedDocument: deleteData[0] });
  } catch (error) {
    console.error('Error in documents DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
