import { useEffect, useState, useCallback } from 'react';
import { Ride } from '../types/rider';

interface UseRideSearchingProps {
  online: boolean;
  acceptedRide: Ride | null;
  availableRides: Ride[];
  loading?: boolean;
}

interface SearchConfig {
  searchDuration: number; // Active search time in ms
  pauseDuration: number;  // Pause between searches in ms
  maxSearchTime: number;  // Maximum time to search before giving up
}

export const useRideSearching = ({ 
  online, 
  acceptedRide, 
  availableRides,
  loading = false 
}: UseRideSearchingProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearchTime, setLastSearchTime] = useState<Date | null>(null);
  const [searchStartTime, setSearchStartTime] = useState<Date | null>(null);
  const [searchCycleCount, setSearchCycleCount] = useState(0);
  const [hasAvailableRides, setHasAvailableRides] = useState(false);

  // Configurable search parameters
  const searchConfig: SearchConfig = {
    searchDuration: 30 * 1000,     // 30 seconds active search
    pauseDuration: 4.5 * 60 * 1000, // 4.5 minutes pause
    maxSearchTime: 15 * 60 * 1000   // 15 minutes total search time
  };

  // Track when rides become available
  useEffect(() => {
    const ridesAvailable = availableRides.length > 0;
    setHasAvailableRides(ridesAvailable);
    
    if (ridesAvailable && online && !acceptedRide) {
      setIsSearching(true);
      setLastSearchTime(new Date());
    }
  }, [availableRides.length, online, acceptedRide]);

  const startSearchCycle = useCallback(() => {
    if (!online || acceptedRide) {
      setIsSearching(false);
      return;
    }

    // Check if we've exceeded maximum search time
    if (searchStartTime) {
      const elapsed = Date.now() - searchStartTime.getTime();
      if (elapsed > searchConfig.maxSearchTime) {
        console.log('Maximum search time exceeded, stopping search');
        setIsSearching(false);
        setSearchStartTime(null);
        setSearchCycleCount(0);
        return;
      }
    } else {
      setSearchStartTime(new Date());
    }

    setIsSearching(true);
    setLastSearchTime(new Date());
    setSearchCycleCount(prev => prev + 1);

    // Active search phase
    const searchTimeout = setTimeout(() => {
      setIsSearching(false);
      
      // Pause phase before next search cycle
      const pauseTimeout = setTimeout(() => {
        if (online && !acceptedRide && !hasAvailableRides) {
          startSearchCycle();
        }
      }, searchConfig.pauseDuration);

      return () => clearTimeout(pauseTimeout);
    }, searchConfig.searchDuration);

    return () => clearTimeout(searchTimeout);
  }, [online, acceptedRide, hasAvailableRides, searchStartTime, searchConfig]);

  // Reset search when driver goes offline or accepts a ride
  useEffect(() => {
    if (!online || acceptedRide) {
      setIsSearching(false);
      setSearchStartTime(null);
      setSearchCycleCount(0);
    }
  }, [online, acceptedRide]);

  // Start search cycle when going online
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (online && !acceptedRide && !loading) {
      if (availableRides.length > 0) {
        setIsSearching(true);
        setLastSearchTime(new Date());
      } else {
        cleanup = startSearchCycle();
      }
    } else {
      setIsSearching(false);
    }

    return cleanup;
  }, [online, acceptedRide, availableRides.length, loading, startSearchCycle]);

  // Calculate search statistics
  const getSearchStats = useCallback(() => {
    if (!searchStartTime) {
      return {
        totalSearchTime: 0,
        searchCycles: searchCycleCount,
        isMaxTimeReached: false
      };
    }

    const totalSearchTime = Date.now() - searchStartTime.getTime();
    const isMaxTimeReached = totalSearchTime > searchConfig.maxSearchTime;

    return {
      totalSearchTime,
      searchCycles: searchCycleCount,
      isMaxTimeReached
    };
  }, [searchStartTime, searchCycleCount, searchConfig.maxSearchTime]);

  // Get time until next search cycle
  const getTimeUntilNextSearch = useCallback(() => {
    if (!lastSearchTime || isSearching || hasAvailableRides) {
      return 0;
    }

    const elapsed = Date.now() - lastSearchTime.getTime();
    const timeUntilNext = Math.max(0, searchConfig.pauseDuration - elapsed);
    
    return timeUntilNext;
  }, [lastSearchTime, isSearching, hasAvailableRides, searchConfig.pauseDuration]);

  // Manual search control
  const forceSearch = useCallback(() => {
    if (online && !acceptedRide && !loading) {
      setIsSearching(true);
      setLastSearchTime(new Date());
      if (!searchStartTime) {
        setSearchStartTime(new Date());
      }
    }
  }, [online, acceptedRide, loading, searchStartTime]);

  const stopSearch = useCallback(() => {
    setIsSearching(false);
    setSearchStartTime(null);
    setSearchCycleCount(0);
  }, []);

  return {
    isSearching,
    lastSearchTime,
    hasAvailableRides,
    searchStats: getSearchStats(),
    timeUntilNextSearch: getTimeUntilNextSearch(),
    
    // Manual controls
    forceSearch,
    stopSearch,
    
    // Search state indicators
    canSearch: online && !acceptedRide && !loading,
    isWaitingForRides: online && !acceptedRide && !isSearching && !hasAvailableRides,
    isMaxSearchTimeReached: getSearchStats().isMaxTimeReached
  };
};
