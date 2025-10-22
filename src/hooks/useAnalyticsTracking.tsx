import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Generate a unique session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Get country from browser (simple approach - in production use IP geolocation API)
const getCountry = async (): Promise<string> => {
  try {
    // Try to get country from browser timezone/locale
    const locale = navigator.language;
    
    // Simple mapping based on locale
    if (locale.includes('CA') || locale.includes('en-CA') || locale.includes('fr-CA')) {
      return 'Canada';
    } else if (locale.includes('US') || locale.includes('en-US')) {
      return 'United States';
    } else if (locale.includes('IN') || locale.includes('hi-IN')) {
      return 'India';
    }
    
    // For better accuracy, use a free IP geolocation API
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return data.country_name || 'Others';
    } catch {
      return 'Others';
    }
  } catch {
    return 'Others';
  }
};

export const useAnalyticsTracking = (pageName: string) => {
  const hasTracked = useRef(false);

  useEffect(() => {
    const trackSession = async () => {
      // Only track once per component mount
      if (hasTracked.current) return;
      hasTracked.current = true;

      try {
        const sessionId = getSessionId();
        const country = await getCountry();

        // Check if session already exists
        const { data: existingSession } = await supabase
          .from('sessions')
          .select('id, page_count')
          .eq('session_id', sessionId)
          .single();

        if (existingSession) {
          // Update existing session
          await supabase
            .from('sessions')
            .update({
              last_activity_at: new Date().toISOString(),
              page_count: existingSession.page_count + 1,
              is_bounce: existingSession.page_count + 1 > 1 ? false : true,
            })
            .eq('session_id', sessionId);
        } else {
          // Create new session
          await supabase
            .from('sessions')
            .insert({
              session_id: sessionId,
              first_page: pageName,
              country: country,
              page_count: 1,
              is_bounce: true,
            });
        }

        // Track page view
        await supabase
          .from('page_views')
          .insert({
            session_id: sessionId,
            page_url: pageName,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            country: country,
          });

        console.log(`📊 Tracked: Session ${sessionId} | Page: ${pageName} | Country: ${country}`);
      } catch (error) {
        console.error('Error tracking analytics:', error);
      }
    };

    trackSession();
  }, [pageName]);
};
