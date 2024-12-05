import { useEffect } from 'react';
import { useTrendingStore } from '../store/trending';
import { startOfDay, isAfter } from 'date-fns';

export function useDailyUpdate() {
  const fetchTrendingContent = useTrendingStore(state => state.fetchTrendingContent);

  useEffect(() => {
    const lastUpdate = localStorage.getItem('lastUpdate');
    const today = startOfDay(new Date());

    if (!lastUpdate || isAfter(today, new Date(lastUpdate))) {
      fetchTrendingContent();
      localStorage.setItem('lastUpdate', new Date().toISOString());
    }

    const checkForUpdate = () => {
      const lastUpdateTime = localStorage.getItem('lastUpdate');
      const now = new Date();
      if (isAfter(startOfDay(now), new Date(lastUpdateTime!))) {
        fetchTrendingContent();
        localStorage.setItem('lastUpdate', now.toISOString());
      }
    };

    const interval = setInterval(checkForUpdate, 1000 * 60 * 60); // Check every hour

    return () => clearInterval(interval);
  }, [fetchTrendingContent]);
}