/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const PackagesContext = createContext(null);

const STORAGE_KEY = 'bukain-recommendations';

export function PackagesProvider({ children }) {
  const [recommendations, setRecommendations] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [selectedPackageId, setSelectedPackageId] = useState(() => {
    try {
      return localStorage.getItem(`${STORAGE_KEY}-selected`) || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recommendations));
    } catch {
      // ignore
    }
  }, [recommendations]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}-selected`, selectedPackageId);
    } catch {
      // ignore
    }
  }, [selectedPackageId]);

  const selectedPackage = useMemo(() => {
    return recommendations.find((pkg) => pkg.id === selectedPackageId);
  }, [recommendations, selectedPackageId]);

  const value = {
    recommendations,
    setRecommendations,
    selectedPackageId,
    setSelectedPackageId,
    selectedPackage,
    clear: () => {
      setRecommendations([]);
      setSelectedPackageId('');
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(`${STORAGE_KEY}-selected`);
      } catch {
        // ignore
      }
    }
  };

  return <PackagesContext.Provider value={value}>{children}</PackagesContext.Provider>;
}

export function usePackages() {
  const ctx = useContext(PackagesContext);
  if (!ctx) {
    throw new Error('usePackages must be used within PackagesProvider');
  }
  return ctx;
}
