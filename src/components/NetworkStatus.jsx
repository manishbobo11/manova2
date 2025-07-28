import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

const NetworkStatus = ({ networkMonitor }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!networkMonitor) return;

    const handleNetworkChange = (online) => {
      setIsOnline(online);
      setShowStatus(!online);
      
      if (online) {
        // Hide status after 3 seconds when back online
        setTimeout(() => setShowStatus(false), 3000);
      }
    };

    // Set initial state
    setIsOnline(networkMonitor.getStatus());
    setShowStatus(!networkMonitor.getStatus());

    // Add listener
    networkMonitor.addListener(handleNetworkChange);

    return () => {
      networkMonitor.removeListener(handleNetworkChange);
    };
  }, [networkMonitor]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    // Trigger a page refresh or retry operation
    window.location.reload();
  };

  if (!showStatus) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 max-w-md mx-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                {isOnline ? 'Connection Restored' : 'Network Connection Lost'}
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {isOnline 
                  ? 'Your connection has been restored. Data will sync automatically.'
                  : 'Unable to connect to our servers. Some features may be unavailable.'
                }
              </p>
            </div>
            {!isOnline && (
              <button
                onClick={handleRetry}
                className="flex-shrink-0 p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                title="Retry connection"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {!isOnline && (
            <div className="mt-3 pt-3 border-t border-red-200">
              <div className="flex items-center space-x-2 text-xs text-red-600">
                <AlertTriangle className="h-3 w-3" />
                <span>Retry attempts: {retryCount}</span>
              </div>
              <p className="text-xs text-red-600 mt-1">
                Check your internet connection and try again.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NetworkStatus; 