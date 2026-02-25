import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log('Running migration: Adding trips_completed column...');
    
    // Execute raw SQL to add the column
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE guides ADD COLUMN IF NOT EXISTS trips_completed INTEGER DEFAULT 0;'
    });

    if (error) {
      console.error('RPC error:', error);
      // Try alternative: use raw query through supabase-js
      // This won't work through SDK, need direct SQL
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'trips_completed column added successfully',
        data 
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500 }
    );
  }
}
