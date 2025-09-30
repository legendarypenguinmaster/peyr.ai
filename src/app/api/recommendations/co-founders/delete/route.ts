import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function DELETE() {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all existing recommendations for the user
    const { error: deleteError } = await supabase
      .from('co_founder_recommendations')
      .delete()
      .eq('founder_id', user.id);

    if (deleteError) {
      console.error('Error deleting recommendations:', deleteError);
      return NextResponse.json({ error: 'Failed to delete recommendations' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Recommendations deleted successfully' 
    });

  } catch (error) {
    console.error('Error in delete recommendations API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
