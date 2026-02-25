import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  role: 'admin' | 'guide';
  created_at: string;
  updated_at: string;
};

export type Guide = {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  email: string;
  location: string;
  languages: string[]; // Array of languages instead of single language
  profile_picture_url: string | null;
  document_url: string | null;
  document_type: 'aadhar' | 'driving_licence';
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  is_deactivated: boolean; // For approved guides - deactivated by admin
  deactivation_reason: string | null; // Reason for deactivation
  is_resubmitted: boolean; // Flag to show if guide resubmitted after rejection
  created_at: string;
  updated_at: string;
};

export type GuideAvailability = {
  id: string;
  guide_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
};

export type GuideItinerary = {
  id: string;
  guide_id: string;
  user_id: string;
  number_of_days: number;
  timings: string;
  description: string;
  places_to_visit: string;
  instructions: string | null;
  image_1_url: string | null;
  image_2_url: string | null;
  price: number;
  price_type: 'per_day' | 'per_trip';
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: string;
  tourist_id: string;
  guide_id: string;
  itinerary_id: string;
  booking_date: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed' | 'past';
  price: number;
  price_type: 'per_day' | 'per_trip';
  created_at: string;
  updated_at: string;
};
