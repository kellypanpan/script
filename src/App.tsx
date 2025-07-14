import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import ScriptGenerator from './pages/ScriptGenerator';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/generate" element={<ScriptGenerator />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;