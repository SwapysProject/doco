import { useEffect, useRef, useState, useCallback } from 'react';

interface SmartPollingOptions {
  intensiveInterval?: number; // Fast polling when chat is active (default: 1000ms)
  normalInterval?: number;    // Normal polling when idle (default: 5000ms)
  idleTimeout?: number;       // Time to wait before switching to normal polling (default: 30000ms)
  maxRetries?: number;        // Max retries on error (default: 3)
}

interface SmartPollingState {
  isConnected: boolean;
  isIntensiveMode: boolean;
  lastActivity: number;
  retryCount: number;
}

export function useSmartPolling(
  pollFunction: () => Promise<unknown>,
  enabled: boolean = true,
  options: SmartPollingOptions = {}
) {
  const {
    intensiveInterval = 1000,
    normalInterval = 5000,
    idleTimeout = 30000,
    maxRetries = 3
  } = options;

  const [state, setState] = useState<SmartPollingState>({
    isConnected: true,
    isIntensiveMode: false,
    lastActivity: Date.now(),
    retryCount: 0
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef(Date.now());

  // Mark activity to trigger intensive polling
  const markActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    setState(prev => ({
      ...prev,
      lastActivity: now,
      isIntensiveMode: true,
      retryCount: 0 // Reset retry count on activity
    }));
    console.log('📡 Smart Polling: Switching to INTENSIVE mode');
  }, []);

  // Check if we should switch to normal polling
  const checkPollingMode = useCallback(() => {
    const now = Date.now();
    const timeSinceActivity = now - lastActivityRef.current;
    
    if (timeSinceActivity > idleTimeout) {
      setState(prev => {
        if (prev.isIntensiveMode) {
          console.log('📡 Smart Polling: Switching to NORMAL mode (idle timeout)');
          return { ...prev, isIntensiveMode: false };
        }
        return prev;
      });
    }
  }, [idleTimeout]);

  // Execute polling with error handling
  const executePoll = useCallback(async () => {
    if (!enabled) return;

    try {
      await pollFunction();
      setState(prev => ({ ...prev, isConnected: true, retryCount: 0 }));
    } catch (error) {
      console.error('📡 Smart Polling Error:', error);
      setState(prev => {
        const newRetryCount = prev.retryCount + 1;
        const isConnected = newRetryCount < maxRetries;
        
        if (!isConnected) {
          console.warn(`📡 Smart Polling: Max retries (${maxRetries}) reached, marking as disconnected`);
        }
        
        return {
          ...prev,
          retryCount: newRetryCount,
          isConnected
        };
      });
    }
  }, [enabled, pollFunction, maxRetries]);

  // Setup polling interval
  useEffect(() => {    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const currentInterval = state.isIntensiveMode ? intensiveInterval : normalInterval;
    
    console.log(`📡 Smart Polling: Setting up ${state.isIntensiveMode ? 'INTENSIVE' : 'NORMAL'} polling (${currentInterval}ms)`);

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set new interval
    intervalRef.current = setInterval(() => {
      checkPollingMode();
      executePoll();
    }, currentInterval);

    // Initial poll
    executePoll();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, state.isIntensiveMode, executePoll, checkPollingMode, intensiveInterval, normalInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    markActivity,
    // Utility methods
    startIntensivePolling: markActivity,
    getPollingStatus: () => ({
      mode: state.isIntensiveMode ? 'intensive' : 'normal',
      interval: state.isIntensiveMode ? intensiveInterval : normalInterval,
      connected: state.isConnected,
      retryCount: state.retryCount
    })
  };
}
