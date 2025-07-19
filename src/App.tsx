import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import FeedbackWidget from './components/FeedbackWidget';
import Landing from './pages/Landing';
import ScriptGenerator from './pages/ScriptGenerator';
import ScriptDoctor from './pages/ScriptDoctor';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/generate" element={<ScriptGenerator />} />
          <Route path="/script-doctor" element={<ScriptDoctor />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
        <FeedbackWidget />
      </Layout>
    </Router>
  );
}

export default App;