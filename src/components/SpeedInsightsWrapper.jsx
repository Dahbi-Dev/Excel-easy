import { useEffect } from 'react';
import { inject } from '@vercel/speed-insights';

export const SpeedInsightsWrapper = () => {
  useEffect(() => {
    inject();
  }, []);

  return null;
};