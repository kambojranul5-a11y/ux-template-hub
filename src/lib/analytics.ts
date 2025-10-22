// Analytics tracking utilities
import { supabase } from '@/integrations/supabase/client';

// Generate or retrieve session ID
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  
  return sessionId;
};

// Track page view
export const trackPageView = async (pageUrl: string) => {
  try {
    const sessionId = getSessionId();
    const referrer = document.referrer || 'direct';
    const userAgent = navigator.userAgent;

    // Insert page view
    await supabase.from('page_views').insert({
      session_id: sessionId,
      page_url: pageUrl,
      referrer: referrer,
      user_agent: userAgent,
    });

    // Update or create session
    const { data: existingSession } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (existingSession) {
      // Update existing session
      const newPageCount = (existingSession.page_count || 0) + 1;
      await supabase
        .from('sessions')
        .update({
          last_activity_at: new Date().toISOString(),
          page_count: newPageCount,
          is_bounce: newPageCount === 1, // Not a bounce if more than 1 page
        })
        .eq('session_id', sessionId);
    } else {
      // Create new session
      await supabase.from('sessions').insert({
        session_id: sessionId,
        first_page: pageUrl,
        started_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        page_count: 1,
        is_bounce: true, // Initially true, will be updated if they view more pages
      });
    }

    console.log('📊 Page view tracked:', pageUrl);
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

// Track session activity (call periodically to keep session alive)
export const updateSessionActivity = async () => {
  try {
    const sessionId = getSessionId();
    
    await supabase
      .from('sessions')
      .update({
        last_activity_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId);
  } catch (error) {
    console.error('Failed to update session activity:', error);
  }
};

// End session (call when user leaves or closes tab)
export const endSession = async () => {
  try {
    const sessionId = getSessionId();
    
    await supabase
      .from('sessions')
      .update({
        ended_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId);
    
    console.log('📊 Session ended:', sessionId);
  } catch (error) {
    console.error('Failed to end session:', error);
  }
};
