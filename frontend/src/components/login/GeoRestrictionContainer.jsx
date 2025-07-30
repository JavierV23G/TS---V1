import React, { useState, useEffect } from 'react';
import GeoRestrictionModal from './GeoRestrictionModal';
import GeolocationService from '../../services/GeolocationService';

const GeoRestrictionContainer = () => {
  const [geoState, setGeoState] = useState({
    isOpen: false,
    isChecking: true,
    locationData: null
  });
  
  const checkGeolocation = async () => {
    try {
      setGeoState(prev => ({
        ...prev,
        isChecking: true
      }));
      
      const geoResult = await GeolocationService.verifyLocationAccess();
      
      if (!geoResult.allowed) {
        setGeoState({
          isOpen: true,
          isChecking: false,
          locationData: geoResult.location
        });
        
      } else {
        setGeoState({
          isOpen: false,
          isChecking: false,
          locationData: geoResult.location
        });
      }
    } catch (error) {
      setGeoState({
        isOpen: true,
        isChecking: false,
        locationData: null,
        error: error.message
      });
    }
  };
  
  useEffect(() => {
    checkGeolocation();
  }, []);
  
  const handleRetry = () => {
    checkGeolocation();
  };
  
  const handleClose = () => {
    setGeoState(prev => ({
      ...prev,
      isOpen: false
    }));
  };
  
  return (
    <GeoRestrictionModal
      isOpen={geoState.isOpen}
      locationData={geoState.locationData}
      onRetry={handleRetry}
      onClose={handleClose}
    />
  );
};

export default GeoRestrictionContainer;