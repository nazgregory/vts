import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VisualizationDashboard from './components/VisualizationDashboard';
import TrackingProvider from './components/TrackingProvider';
import './index.css';

function App() {
  return (
    <TrackingProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<VisualizationDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </TrackingProvider>
  );
}

export default App;