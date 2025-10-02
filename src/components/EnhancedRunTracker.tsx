import React, { useState, useEffect, useRef } from 'react';
import './EnhancedRunTracker.css';

interface EnhancedRunTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRun: (runData: RunData) => void;
}

interface RunData {
  id: string;
  date: string;
  distance: number;
  duration: number;
  calories: number;
  pace: number;
  route: RoutePoint[];
  newStreets: number;
  timestamp: number;
}

interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: number;
}

interface Milestone {
  id: string;
  name: string;
  distance: number; // in km
  icon: string;
  achieved: boolean;
  date?: string;
}

const MILESTONES: Milestone[] = [
  { id: 'm1', name: 'First Step', distance: 1, icon: '🎯', achieved: false },
  { id: 'm2', name: 'Warm Up', distance: 5, icon: '🔥', achieved: false },
  { id: 'm3', name: '10K Runner', distance: 10, icon: '🏃', achieved: false },
  { id: 'm4', name: 'Half Marathon', distance: 21, icon: '💪', achieved: false },
  { id: 'm5', name: 'Marathon Ready', distance: 42, icon: '🏅', achieved: false },
  { id: 'm6', name: 'Ultra Runner', distance: 50, icon: '⚡', achieved: false },
  { id: 'm7', name: 'Century', distance: 100, icon: '👑', achieved: false },
];

// Google Maps API Key - Replace with your own or set as environment variable
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const USE_GOOGLE_MAPS = GOOGLE_MAPS_API_KEY.length > 0;

export const EnhancedRunTracker: React.FC<EnhancedRunTrackerProps> = ({ isOpen, onClose, onSaveRun }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>(MILESTONES);
  const [totalLifetimeDistance, setTotalLifetimeDistance] = useState(0);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [newMilestone, setNewMilestone] = useState<Milestone | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);
  const heatmapLayerRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load saved milestone progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('run_milestones');
    if (saved) {
      try {
        setMilestones(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load milestones:', e);
      }
    }

    const savedDistance = localStorage.getItem('total_lifetime_distance');
    if (savedDistance) {
      setTotalLifetimeDistance(parseFloat(savedDistance) || 0);
    }

    const allRuns = localStorage.getItem('all_runs_history');
    if (allRuns && USE_GOOGLE_MAPS) {
      try {
        const runs = JSON.parse(allRuns);
        initializeHeatmap(runs);
      } catch (e) {
        console.error('Failed to load runs history:', e);
      }
    }
  }, []);

  // Initialize Google Map
  useEffect(() => {
    if (isOpen && mapRef.current && USE_GOOGLE_MAPS && !googleMapRef.current) {
      googleMapRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: 0, lng: 0 },
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          googleMapRef.current?.setCenter(center);
        });
      }
    }
  }, [isOpen]);

  // Initialize heatmap with all previous runs
  const initializeHeatmap = (runs: RunData[]) => {
    if (!googleMapRef.current || !USE_GOOGLE_MAPS) return;

    const allPoints: google.maps.LatLng[] = [];
    runs.forEach(run => {
      run.route.forEach(point => {
        allPoints.push(new google.maps.LatLng(point.lat, point.lng));
      });
    });

    if (heatmapLayerRef.current) {
      heatmapLayerRef.current.setMap(null);
    }

    heatmapLayerRef.current = new google.maps.visualization.HeatmapLayer({
      data: allPoints,
      map: googleMapRef.current,
      radius: 20,
      opacity: 0.6,
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPoint: RoutePoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
        };

        setRoute((prev) => {
          const updated = [...prev, newPoint];

          // Calculate distance
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const additionalDistance = calculateDistance(last.lat, last.lng, newPoint.lat, newPoint.lng);
            setDistance((d) => d + additionalDistance);
          }

          // Update map
          if (USE_GOOGLE_MAPS && googleMapRef.current) {
            const path = updated.map(p => new google.maps.LatLng(p.lat, p.lng));

            if (routePolylineRef.current) {
              routePolylineRef.current.setPath(path);
            } else {
              routePolylineRef.current = new google.maps.Polyline({
                path,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 4,
                map: googleMapRef.current,
              });
            }

            googleMapRef.current.setCenter(new google.maps.LatLng(newPoint.lat, newPoint.lng));
          }

          return updated;
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    // Update duration timer
    intervalRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000));
    }, 1000);
  };

  const pauseTracking = () => {
    setIsPaused(true);
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    pausedTimeRef.current += Date.now() - startTimeRef.current;
  };

  const resumeTracking = () => {
    setIsPaused(false);
    startTimeRef.current = Date.now();
    startTracking();
  };

  const finishRun = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const newTotalDistance = totalLifetimeDistance + distance / 1000;
    setTotalLifetimeDistance(newTotalDistance);
    localStorage.setItem('total_lifetime_distance', newTotalDistance.toString());

    // Check for new milestones
    const updatedMilestones = milestones.map(m => {
      if (!m.achieved && newTotalDistance >= m.distance) {
        setNewMilestone(m);
        setShowMilestoneModal(true);
        return { ...m, achieved: true, date: new Date().toISOString() };
      }
      return m;
    });
    setMilestones(updatedMilestones);
    localStorage.setItem('run_milestones', JSON.stringify(updatedMilestones));

    // Save run
    const runData: RunData = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      distance,
      duration,
      calories: Math.round(0.063 * 70 * (distance / 1000)),
      pace: distance > 0 ? (duration / 60) / (distance / 1000) : 0,
      route,
      newStreets: 0,
      timestamp: Date.now(),
    };

    // Save to history for heatmap
    const allRuns = JSON.parse(localStorage.getItem('all_runs_history') || '[]');
    allRuns.push(runData);
    localStorage.setItem('all_runs_history', JSON.stringify(allRuns));

    onSaveRun(runData);

    // Reset
    setIsTracking(false);
    setIsPaused(false);
    setDistance(0);
    setDuration(0);
    setRoute([]);
    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number): string => {
    return (meters / 1000).toFixed(2);
  };

  const formatPace = (): string => {
    if (distance === 0) return '--:--';
    const paceMinPerKm = (duration / 60) / (distance / 1000);
    const mins = Math.floor(paceMinPerKm);
    const secs = Math.floor((paceMinPerKm - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="enhanced-run-tracker-overlay">
      <div className="enhanced-run-tracker">
        <div className="tracker-header">
          <h2>GPS Run Tracker</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="map-container">
          {USE_GOOGLE_MAPS ? (
            <div ref={mapRef} className="google-map" />
          ) : (
            <div className="map-placeholder">
              <div className="placeholder-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <p>Google Maps Preview</p>
                <small>Add VITE_GOOGLE_MAPS_API_KEY to .env to enable maps</small>
                {route.length > 0 && (
                  <div className="fallback-stats">
                    <div>📍 {route.length} GPS points tracked</div>
                    <div>🗺️ Route recording active</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="stats-panel">
          <div className="stat-box">
            <div className="stat-value">{formatDistance(distance)} km</div>
            <div className="stat-label">Distance</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{formatTime(duration)}</div>
            <div className="stat-label">Time</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{formatPace()}</div>
            <div className="stat-label">Pace (min/km)</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{Math.round(0.063 * 70 * (distance / 1000))}</div>
            <div className="stat-label">Calories</div>
          </div>
        </div>

        <div className="tracker-controls">
          {!isTracking && (
            <button className="control-btn start-btn" onClick={startTracking}>
              Start Run
            </button>
          )}

          {isTracking && !isPaused && (
            <>
              <button className="control-btn pause-btn" onClick={pauseTracking}>
                Pause
              </button>
              <button className="control-btn finish-btn" onClick={finishRun}>
                Finish Run
              </button>
            </>
          )}

          {isTracking && isPaused && (
            <>
              <button className="control-btn resume-btn" onClick={resumeTracking}>
                Resume
              </button>
              <button className="control-btn finish-btn" onClick={finishRun}>
                Finish Run
              </button>
            </>
          )}
        </div>

        <div className="milestones-section">
          <h3>Distance Milestones</h3>
          <div className="lifetime-progress">
            <div className="progress-label">Lifetime Distance</div>
            <div className="progress-value">{totalLifetimeDistance.toFixed(1)} km</div>
          </div>
          <div className="milestones-grid">
            {milestones.map(milestone => (
              <div
                key={milestone.id}
                className={`milestone-card ${milestone.achieved ? 'achieved' : ''}`}
              >
                <div className="milestone-icon">{milestone.icon}</div>
                <div className="milestone-info">
                  <div className="milestone-name">{milestone.name}</div>
                  <div className="milestone-distance">{milestone.distance} km</div>
                </div>
                {milestone.achieved && (
                  <div className="milestone-badge">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showMilestoneModal && newMilestone && (
        <div className="milestone-modal-overlay">
          <div className="milestone-modal">
            <div className="milestone-celebration">
              <div className="celebration-icon">{newMilestone.icon}</div>
              <h2>Milestone Achieved!</h2>
              <h3>{newMilestone.name}</h3>
              <p>You've completed {newMilestone.distance} km total distance!</p>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowMilestoneModal(false);
                  setNewMilestone(null);
                }}
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedRunTracker;
