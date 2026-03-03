import { createClient } from '@supabase/supabase-js';

// Các biến môi trường này sẽ được thiết lập sau.
// Nếu chưa có, Supabase JS sẽ văng màn hình trắng. Mình thêm logic báo lỗi mềm.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
