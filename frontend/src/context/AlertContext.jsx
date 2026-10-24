import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const AlertContext = createContext(null);

function getStorageKey(user) {
  const uid = user?._id || user?.id || user?.email || 'guest';
  return `jaldrishti_read_alerts_${uid}`;
}

function loadStoredReadIds(user) {
  if (typeof window === 'undefined' || !window.localStorage) return new Set();
  try {
    const raw = window.localStorage.getItem(getStorageKey(user));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function saveStoredReadIds(user, idSet) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const arr = Array.from(idSet);
    window.localStorage.setItem(getStorageKey(user), JSON.stringify(arr));
  } catch {
    // Ignore storage write errors
  }
}

export function AlertProvider({ children }) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [readAlertIds, setReadAlertIds] = useState(() => loadStoredReadIds(user));

  // Reload read IDs when user switches or logs in/out
  useEffect(() => {
    setReadAlertIds(loadStoredReadIds(user));
  }, [user]);

  // Fetch alerts from backend
  const refreshAlerts = useCallback(async () => {
    if (!user) {
      setAlerts([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.alerts.getAll({ limit: 100 });
      if (res?.data && Array.isArray(res.data)) {
        setAlerts(res.data);
      } else {
        setAlerts([]);
      }
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshAlerts();
  }, [refreshAlerts]);

  // Mark an individual alert as read
  const markAlertAsRead = useCallback((alertId) => {
    if (!alertId) return;
    setReadAlertIds((prev) => {
      const next = new Set(prev);
      next.add(alertId);
      saveStoredReadIds(user, next);
      return next;
    });
  }, [user]);

  // Mark all currently loaded alerts as read
  const markAllAlertsAsRead = useCallback(() => {
    setReadAlertIds((prev) => {
      const next = new Set(prev);
      alerts.forEach((a) => {
        const id = a._id || a.id;
        if (id) next.add(id);
      });
      saveStoredReadIds(user, next);
      return next;
    });
  }, [alerts, user]);

  // Acknowledge an alert (Admin action)
  const acknowledgeAlert = useCallback(async (alertId) => {
    if (!alertId) return;
    await api.alerts.acknowledge(alertId);
    markAlertAsRead(alertId);
    await refreshAlerts();
  }, [markAlertAsRead, refreshAlerts]);

  // Compute unread alert count strictly from real alerts
  const unreadCount = useMemo(() => {
    if (!alerts || alerts.length === 0) return 0;
    return alerts.filter((a) => {
      const id = a._id || a.id;
      const isAcknowledged = a.status === 'Acknowledged';
      const isMarkedRead = id && readAlertIds.has(id);
      return !isAcknowledged && !isMarkedRead;
    }).length;
  }, [alerts, readAlertIds]);

  const activeAlerts = useMemo(() => {
    return (alerts || []).filter((a) => a.status === 'Active');
  }, [alerts]);

  const recentAlerts = useMemo(() => {
    return (alerts || []).slice(0, 4);
  }, [alerts]);

  const value = useMemo(() => ({
    alerts,
    activeAlerts,
    recentAlerts,
    unreadCount,
    readAlertIds,
    loading,
    refreshAlerts,
    markAlertAsRead,
    markAllAlertsAsRead,
    acknowledgeAlert
  }), [
    alerts,
    activeAlerts,
    recentAlerts,
    unreadCount,
    readAlertIds,
    loading,
    refreshAlerts,
    markAlertAsRead,
    markAllAlertsAsRead,
    acknowledgeAlert
  ]);

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  const context = useContext(AlertContext);
  if (!context) {
    return {
      alerts: [],
      activeAlerts: [],
      recentAlerts: [],
      unreadCount: 0,
      readAlertIds: new Set(),
      loading: false,
      refreshAlerts: () => Promise.resolve(),
      markAlertAsRead: () => {},
      markAllAlertsAsRead: () => {},
      acknowledgeAlert: () => Promise.resolve()
    };
  }
  return context;
}

export default AlertContext;
