// Hook for tracking analytics across the app
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, updateSessionActivity, endSession } from '@/lib/analytics';

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on mount and route change
    const currentPath = location.pathname + location.search;
    trackPageView(currentPath);

    // Update session activity every 30 seconds to keep session alive
    const activityInterval = setInterval(() => {
      updateSessionActivity();
    }, 30000); // 30 seconds

    // Cleanup
    return () => {
      clearInterval(activityInterval);
    };
  }, [location]);

  useEffect(() => {
    // End session when user leaves the page
    const handleBeforeUnload = () => {
      endSession();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        endSession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};
