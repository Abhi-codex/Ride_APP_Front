import { useEffect, useState } from 'react';

interface UseRideSearchingProps {
  online: boolean;
  acceptedRide: any;
  availableRides: any[];
}

export const useRideSearching = ({ online, acceptedRide, availableRides }: UseRideSearchingProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearchTime, setLastSearchTime] = useState<Date | null>(null);

  useEffect(() => {
    let pauseTimeout: ReturnType<typeof setTimeout>;

    const startSearchCycle = () => {
      if (!online || acceptedRide) {
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setLastSearchTime(new Date());

      pauseTimeout = setTimeout(() => {
        setIsSearching(false);
        
        setTimeout(() => {
          if (online && !acceptedRide) {
            startSearchCycle();
          }
        }, 4.5 * 60 * 1000); 
      }, 30 * 1000); 
    };

    if (online && !acceptedRide) {
      if (availableRides.length > 0) {
        setIsSearching(true);
      } else {
        startSearchCycle();
      }
    } else {
      setIsSearching(false);
    }

    return () => {
      if (pauseTimeout) clearTimeout(pauseTimeout);
    };
  }, [online, acceptedRide, availableRides.length]);

  return {
    isSearching,
    lastSearchTime,
  };
};
