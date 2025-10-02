import React, { useState, useEffect, useRef } from 'react';
import './RunTracker.css';

interface RunTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRun: (runData: RunData) => void;
}

interface RunData {
  id: string;
  date: string;
  distance: number; // in meters
  duration: number; // in seconds
  calories: number;
  pace: number; // min/km
  route: RoutePoint[];
  newStreets: number;
  timestamp: number;
}

interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: number;
}

interface Stats {
  distance: number;
  duration: number;
  pace: number;
  calories: number;
}

export const RunTracker: React.FC<RunTrackerProps> = ({ isOpen, onClose, onSaveRun }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState<Stats>({
    distance: 0,
    duration: 0,
    pace: 0,
    calories: 0,
  });
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate distance between two GPS points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Calculate calories burned (rough estimate: 0.063 * weight_kg * distance_km)
  const calculateCalories = (distanceMeters: number): number => {
    const averageWeight = 70; // kg
    const distanceKm = distanceMeters / 1000;
    return Math.round(0.063 * averageWeight * distanceKm);
  };

  // Update stats every second
  useEffect(() => {
    if (isTracking && !isPaused) {
      intervalRef.current = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000);

        setStats((prev) => {
          const distanceKm = prev.distance / 1000;
          const durationMinutes = elapsedSeconds / 60;
          const pace = distanceKm > 0 ? durationMinutes / distanceKm : 0;
          const calories = calculateCalories(prev.distance);

          return {
            ...prev,
            duration: elapsedSeconds,
            pace,
            calories,
          };
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTracking, isPaused]);

  // Start GPS tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('GPS not supported on this device');
      return;
    }

    setError(null);
    setIsTracking(true);
    startTimeRef.current = Date.now();

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPoint: RoutePoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
        };

        setRoute((prevRoute) => {
          const updatedRoute = [...prevRoute, newPoint];

          // Calculate distance if we have previous point
          if (prevRoute.length > 0) {
            const lastPoint = prevRoute[prevRoute.length - 1];
            const segmentDistance = calculateDistance(
              lastPoint.lat,
              lastPoint.lng,
              newPoint.lat,
              newPoint.lng
            );

            setStats((prev) => ({
              ...prev,
              distance: prev.distance + segmentDistance,
            }));
          }

          return updatedRoute;
        });
      },
      (err) => {
        setError(`GPS error: ${err.message}`);
        stopTracking();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );
  };

  // Pause tracking
  const pauseTracking = () => {
    setIsPaused(true);
    pausedTimeRef.current = Date.now();
  };

  // Resume tracking
  const resumeTracking = () => {
    setIsPaused(false);
    const pauseDuration = Date.now() - pausedTimeRef.current;
    startTimeRef.current += pauseDuration;
  };

  // Stop tracking
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setIsPaused(false);
  };

  // Save and finish run
  const finishRun = () => {
    if (stats.distance < 100) {
      setError('Run too short! Walk at least 100 meters to save.');
      return;
    }

    stopTracking();

    const runData: RunData = {
      id: `run_${Date.now()}`,
      date: new Date().toISOString(),
      distance: stats.distance,
      duration: stats.duration,
      calories: stats.calories,
      pace: stats.pace,
      route,
      newStreets: 0, // Will be calculated later with street data
      timestamp: Date.now(),
    };

    onSaveRun(runData);
    resetRun();
    onClose();
  };

  // Reset all state
  const resetRun = () => {
    stopTracking();
    setStats({ distance: 0, duration: 0, pace: 0, calories: 0 });
    setRoute([]);
    setError(null);
    startTimeRef.current = 0;
    pausedTimeRef.current = 0;
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format distance (meters to km)
  const formatDistance = (meters: number): string => {
    return (meters / 1000).toFixed(2);
  };

  // Format pace (min/km)
  const formatPace = (pace: number): string => {
    if (!isFinite(pace) || pace === 0) return '--:--';
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="run-tracker-overlay" onClick={onClose}>
      <div className="run-tracker" onClick={(e) => e.stopPropagation()}>
        <div className="run-tracker__header">
          <h2 className="run-tracker__title">🏃 Run Tracker</h2>
          <button className="run-tracker__close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && (
          <div className="run-tracker__error">
            {error}
          </div>
        )}

        <div className="run-tracker__stats">
          <div className="run-stat">
            <div className="run-stat__value">{formatDistance(stats.distance)}</div>
            <div className="run-stat__label">KM</div>
          </div>

          <div className="run-stat">
            <div className="run-stat__value">{formatTime(stats.duration)}</div>
            <div className="run-stat__label">TIME</div>
          </div>

          <div className="run-stat">
            <div className="run-stat__value">{formatPace(stats.pace)}</div>
            <div className="run-stat__label">PACE /KM</div>
          </div>

          <div className="run-stat">
            <div className="run-stat__value">{stats.calories}</div>
            <div className="run-stat__label">KCAL</div>
          </div>
        </div>

        <div className="run-tracker__map">
          <div className="run-tracker__map-placeholder">
            {route.length === 0 ? (
              <p>🗺️ GPS map will appear here once you start tracking</p>
            ) : (
              <div className="run-tracker__route-info">
                <p>📍 {route.length} GPS points recorded</p>
                <p className="run-tracker__note">
                  Full map visualization coming soon!
                  <br />
                  Currently tracking your route coordinates.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="run-tracker__controls">
          {!isTracking ? (
            <button className="run-tracker__btn run-tracker__btn--start" onClick={startTracking}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Start Run
            </button>
          ) : (
            <>
              {!isPaused ? (
                <button className="run-tracker__btn run-tracker__btn--pause" onClick={pauseTracking}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  Pause
                </button>
              ) : (
                <button className="run-tracker__btn run-tracker__btn--resume" onClick={resumeTracking}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Resume
                </button>
              )}

              <button className="run-tracker__btn run-tracker__btn--finish" onClick={finishRun}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Finish & Save
              </button>

              <button className="run-tracker__btn run-tracker__btn--cancel" onClick={resetRun}>
                ×
              </button>
            </>
          )}
        </div>

        <div className="run-tracker__info">
          <p>💡 <strong>Explore Mode:</strong> Discover new streets and track your exploration!</p>
          <p>🏆 Badges unlock as you hit distance milestones and explore new areas.</p>
        </div>
      </div>
    </div>
  );
};
