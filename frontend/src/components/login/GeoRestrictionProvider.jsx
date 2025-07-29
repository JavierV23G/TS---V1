import React, { createContext, useContext, useState, useEffect } from 'react';
import GeolocationService from './GeolocationService';
import GeoRestrictionModal from './GeoRestrictionModal';

const GeoRestrictionContext = createContext();

export const useGeoRestriction = () => useContext(GeoRestrictionContext);

export const GeoRestrictionProvider = ({ children }) => {
  const [geoState, setGeoState] = useState({
    isRestricted: false,
    isChecking: true,
    locationData: null,
    error: null
  });
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    locationData: null
  });
  
  const checkGeolocation = async () => {
    try {
      setGeoState(prev => ({
        ...prev,
        isChecking: true,
        error: null
      }));
      
      const geoResult = await GeolocationService.verifyLocationAccess();
      
      setGeoState({
        isRestricted: !geoResult.allowed,
        isChecking: false,
        locationData: geoResult.location,
        error: null
      });
      
      if (!geoResult.allowed) {
        setModalState({
          isOpen: true,
          locationData: geoResult.location
        });
        
      }
      
      return geoResult;
    } catch (error) {
      
      setGeoState({
        isRestricted: true, // Por precaución, restringir en caso de error
        isChecking: false,
        locationData: null,
        error: error.message
      });
      
      setModalState({
        isOpen: true,
        locationData: null,
        error: error.message
      });
      
      return {
        allowed: false,
        reason: 'Error verifying location',
        error: error.message
      };
    }
  };
  
  useEffect(() => {
    checkGeolocation();
  }, []);
  
  const handleRetry = () => {
    checkGeolocation();
  };
  
  const handleClose = () => {
    setModalState(prev => ({
      ...prev,
      isOpen: false
    }));
  };
  
  return (
    <GeoRestrictionContext.Provider 
      value={{
        isRestricted: geoState.isRestricted,
        isChecking: geoState.isChecking,
        locationData: geoState.locationData,
        error: geoState.error,
        checkGeolocation
      }}
    >
      {children}
      
      <GeoRestrictionModal
        isOpen={modalState.isOpen}
        locationData={modalState.locationData}
        error={geoState.error}
        onRetry={handleRetry}
        onClose={handleClose}
      />
    </GeoRestrictionContext.Provider>
  );
};

export default GeoRestrictionProvider;