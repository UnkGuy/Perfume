import { useState, useEffect } from 'react';

const BASE_URL = 'https://psgc.gitlab.io/api';

export const usePSGC = () => {
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // 1. Fetch Regions on mount
  useEffect(() => {
    fetch(`${BASE_URL}/regions/`)
      .then(res => res.json())
      .then(data => setRegions(data.sort((a, b) => a.name.localeCompare(b.name))))
      .catch(console.error);
  }, []);

  // 2. Fetch Provinces (or Cities if NCR)
  const getProvinces = async (regionCode) => {
    setIsFetchingLocation(true);
    try {
      const res = await fetch(`${BASE_URL}/regions/${regionCode}/provinces/`);
      const data = await res.json();
      
      // NCR Edge Case: It returns an empty array for provinces. 
      // If so, we skip to fetching cities for that region.
      if (data.length === 0) {
        setProvinces([]);
        const cityRes = await fetch(`${BASE_URL}/regions/${regionCode}/cities-municipalities/`);
        const cityData = await cityRes.json();
        setCities(cityData.sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        setProvinces(data.sort((a, b) => a.name.localeCompare(b.name)));
        setCities([]); // Clear cities until province is picked
      }
      setBarangays([]); // Clear barangays
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingLocation(false);
    }
  };

  // 3. Fetch Cities based on Province
  const getCities = async (provinceCode) => {
    setIsFetchingLocation(true);
    try {
      const res = await fetch(`${BASE_URL}/provinces/${provinceCode}/cities-municipalities/`);
      const data = await res.json();
      setCities(data.sort((a, b) => a.name.localeCompare(b.name)));
      setBarangays([]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingLocation(false);
    }
  };

  // 4. Fetch Barangays based on City
  const getBarangays = async (cityCode) => {
    setIsFetchingLocation(true);
    try {
      const res = await fetch(`${BASE_URL}/cities-municipalities/${cityCode}/barangays/`);
      const data = await res.json();
      setBarangays(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingLocation(false);
    }
  };

  return { 
    regions, provinces, cities, barangays, 
    getProvinces, getCities, getBarangays, 
    isFetchingLocation 
  };
};