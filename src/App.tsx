import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';

function App() {
  const { initializeApp, isLoading, userProgress } = useStore();

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  if (isLoading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h1 style={{ fontSize: '32px', letterSpacing: '3px' }}>THE BLUEPRINT</h1>
        <p style={{ fontSize: '12px', letterSpacing: '1px', color: 'var(--text-accent)', marginTop: '8px' }}>it takes just 30 days</p>
        <p style={{ marginTop: '20px', color: 'var(--text-accent)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            !userProgress?.onboarding_completed ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
