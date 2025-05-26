// libs/supabase.ts
import { createClient } from '@supabase/supabase-js';

// スパベースの設定
export const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
