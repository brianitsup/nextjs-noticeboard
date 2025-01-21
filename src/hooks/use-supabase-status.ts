import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useSupabaseStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const checkConnection = async () => {
      try {
        const { error } = await supabase
          .from('categories')
          .select('count')
          .limit(1)
          .single();

        if (mounted) {
          setIsOnline(!error);
        }
      } catch (error) {
        if (mounted) {
          setIsOnline(false);
        }
      }
    };

    // Initial check
    void checkConnection();

    // Set up periodic checks
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return isOnline;
} 