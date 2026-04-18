// src/contexts/SettingsContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchSettingsAPI, DEFAULT_SETTINGS } from '../services/settingsApi';

const SettingsContext = createContext({});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSettingsAPI();
        setSettings(data);
      } catch (err) {
        console.warn('Could not load site settings, using defaults.', err);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    load();
  }, []);

  const refreshSettings = async () => {
    try {
      const data = await fetchSettingsAPI();
      setSettings(data);
    } catch (err) {
      console.error('Failed to refresh settings', err);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings, refreshSettings, isLoadingSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);