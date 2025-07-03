import { useEffect, useState, useCallback } from 'react';
import { Ride } from '../types/rider';

interface UseRideSearchingProps {
  online: boolean;
  acceptedRide: Ride | null;
  availableRides: Ride[];
  loading?: boolean;
}

export const useRideSearching = ({ 
  online, 
  acceptedRide, 
  availableRides, 
  loading = false 
}: UseRideSearchingProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearchTime, setLastSearchTime] = useState<Date | null>(null);

  useEffect(() => {
    let searchTimeout: ReturnType<typeof setTimeout>;
    let pauseTimeout: ReturnType<typeof setTimeout>;

    const startSearchCycle = () => {
      if (!online || acceptedRide || loading) {
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setLastSearchTime(new Date());

      // Active search for 30 seconds
      searchTimeout = setTimeout(() => {
        setIsSearching(false);
        
        // Pause for 4.5 minutes, then start again
        pauseTimeout = setTimeout(() => {
          // Only restart if conditions are still met
          if (online && !acceptedRide && !loading && availableRides.length === 0) {
            startSearchCycle();
          }
        }, 4.5 * 60 * 1000); 
      }, 30 * 1000); 
    };

    if (online && !acceptedRide && !loading) {
      if (availableRides.length > 0) {
        setIsSearching(true);
        setLastSearchTime(new Date());
      } else {
        startSearchCycle();
      }
    } else {
      setIsSearching(false);
    }

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
      if (pauseTimeout) clearTimeout(pauseTimeout);
    };
  }, [online, acceptedRide, availableRides.length, loading]);

  return {
    isSearching,
    lastSearchTime,
  };
};
