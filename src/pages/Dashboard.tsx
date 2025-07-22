import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  FileText,
  Copy,
  Trash2,
  Grid,
  List,
  Sparkles,
  Wand2,
  TrendingUp,
  Clock,
  BarChart3,
  Activity,
  Play,
  Edit3,
  Download,
  Share2,
  Star,
  FolderPlus,
  Eye,
  ArrowRight
} from 'lucide-react';
import ProjectContext from '../components/ProjectContext';
import { ScriptProject } from '../types/user';
import { projectManager } from '../services/projectManager';

// Extended local interface for Dashboard-specific fields
interface DashboardProject extends ScriptProject {
  title?: string; // For backward compatibility
  lastEdited?: Date;
  created?: Date;
  sceneCount?: number;
  wordCount?: number;
  estimatedDuration?: string;
  platform?: string;
  version?: number;
}

interface CreationStats {
  totalProjects: number;
  totalWords: number;
  thisWeekProjects: number;
  avgCompletionTime: string;
  mostUsedGenre: string;
  totalDuration: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [stats, setStats] = useState<CreationStats | null>(null);
  
  // Using the singleton project manager

  // Load project data from API
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        // Force clear any existing Chinese data and use English samples
        // This ensures a clean start with English interface
        localStorage.removeItem('scriptProjects');
        console.log('Cleared old project data to ensure English interface');
        
        // Initial example data
        const exampleProjects: ScriptProject[] = [
            {
              id: '1',
              title: 'Coffee Shop Encounter',
              content: `INT. COFFEE SHOP - DAY\n\nA busy coffee shop. ALEX (25) waits in line, looking nervous...\n\nALEX\nI'll have a latte, please.\n\n(Accidentally bumps into someone behind)\n\nSorry!`,
              lastEdited: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
              created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
              sceneCount: 3,
              wordCount: 245,
              estimatedDuration: '2:30',
              genre: 'Comedy',
              platform: 'tiktok',
              status: 'draft',
              tags: ['Short Video', 'Daily Life', 'Casual'],
              version: 1
            },
            {
              id: '2',
              title: 'AI Awakening',
              content: `INT. TECH OFFICE - NIGHT\n\nProgrammer MAYA (30) works alone. AI code displays on screen...\n\nMAYA\n(To screen)\nCan you really understand what I'm saying?\n\nSudenly, screen flickers, text appears: "More than you think."`,
              lastEdited: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
              created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
              sceneCount: 5,
              wordCount: 487,
              estimatedDuration: '4:15',
              genre: 'Sci-Fi',
              platform: 'youtube',
              status: 'in_progress',
              tags: ['Technology', 'Suspense', 'AI'],
              version: 3
            },
            {
              id: '3',
              title: 'Startup Pitch',
              content: `INT. CONFERENCE ROOM - DAY\n\nInvestors sit in a row. TOM (28) stands in front, palms sweating...\n\nTOM\nOur product will revolutionize the entire industry!\n\n(Remote falls to the ground)\n\nUh... let me start over.`,
              lastEdited: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
              created: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
              sceneCount: 2,
              wordCount: 156,
              estimatedDuration: '1:45',
              genre: 'Business',
              platform: 'general',
              status: 'complete',
              tags: ['Business', 'Presentation', 'Startup'],
              version: 2
            }
          ];
        setProjects(exampleProjects);
        localStorage.setItem('scriptProjects', JSON.stringify(exampleProjects));

        // Calculate statistics
        const totalWords = exampleProjects.reduce((sum, p) => sum + p.wordCount, 0);
        const thisWeek = exampleProjects.filter(p => 
          new Date(p.created) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;
        
        const genreCounts = exampleProjects.reduce((acc: Record<string, number>, p) => {
          acc[p.genre] = (acc[p.genre] || 0) + 1;
          return acc;
        }, {});
        const mostUsedGenre = Object.keys(genreCounts).reduce((a, b) => 
          genreCounts[a] > genreCounts[b] ? a : b, 'Comedy'
        );

        setStats({
          totalProjects: exampleProjects.length,
          totalWords,
          thisWeekProjects: thisWeek,
          avgCompletionTime: '2.5 hours',
          mostUsedGenre,
          totalDuration: '12:30'
        });

      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'published':
        return 'bg-purple-100 text-purple-800';
      case 'draft':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete': return 'Complete';
      case 'in_progress': return 'In Progress';
      case 'published': return 'Published';
      case 'draft': return 'Draft';
      default: return 'Draft';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return '1 day ago';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
    return `${Math.floor(diffInHours / 168)} weeks ago`;
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleProjectAction = (projectId: string, action: 'edit' | 'duplicate' | 'delete' | 'doctor') => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    switch (action) {
      case 'edit':
        // Pass project data to Studio and navigate
        localStorage.setItem('editingProject', JSON.stringify(project));
        navigate('/studio');
        break;
      case 'duplicate':
        const duplicatedProject: ScriptProject = {
          ...project,
          id: Date.now().toString(),
          title: `${project.title} (Copy)`,
          created: new Date(),
          lastEdited: new Date(),
          version: 1
        };
        const newProjects = [...projects, duplicatedProject];
        setProjects(newProjects);
        localStorage.setItem('scriptProjects', JSON.stringify(newProjects));
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this project?')) {
          const filtered = projects.filter(p => p.id !== projectId);
          setProjects(filtered);
          localStorage.setItem('scriptProjects', JSON.stringify(filtered));
        }
        break;
      case 'doctor':
        // Pass project data to ScriptDoctor
        localStorage.setItem('doctorProject', JSON.stringify(project));
        navigate('/script-doctor');
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-4"
          >
            <Sparkles className="h-8 w-8 text-blue-500" />
          </motion.div>
          <p className="text-gray-600">Loading Creation Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Context */}
        <ProjectContext />
        
        {/* Header with Welcome Message */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Creation Center
              </h1>
              <p className="text-lg text-gray-600">
                Welcome back! Manage your script projects and track creative progress
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6 lg:mt-0">
              <Link
                to="/studio"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Create New Script</span>
              </Link>
              <Link
                to="/script-doctor"
                className="bg-white border border-gray-300 hover:border-green-400 text-gray-700 hover:text-green-700 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
              >
                <Wand2 className="h-5 w-5" />
                <span>Script Doctor</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProjects}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.thisWeekProjects}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Words</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalWords.toLocaleString()}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Top Genre</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.mostUsedGenre}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Start</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/studio?template=tiktok"
              className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-pink-100 p-2 rounded-lg group-hover:bg-pink-200 transition-colors">
                  <Play className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">TikTok Videos</h4>
                  <p className="text-sm text-gray-600">15-60s vertical content</p>
                </div>
              </div>
            </Link>

            <Link
              to="/studio?template=youtube"
              className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg group-hover:bg-red-200 transition-colors">
                  <Play className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">YouTube Shorts</h4>
                  <p className="text-sm text-gray-600">1-5 minute content</p>
                </div>
              </div>
            </Link>

            <Link
              to="/studio?template=commercial"
              className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Commercial Ads</h4>
                  <p className="text-sm text-gray-600">Product promo videos</p>
                </div>
              </div>
            </Link>

            <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow group cursor-pointer opacity-50">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <FolderPlus className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-600">More Templates</h4>
                  <p className="text-sm text-gray-500">Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search project titles, genres, or tags..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="complete">Complete</option>
              <option value="published">Published</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        <AnimatePresence mode="wait">
          {filteredProjects.length > 0 ? (
            viewMode === 'grid' ? (
              <motion.div 
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 group border border-gray-100 hover:border-blue-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {getStatusText(project.status)}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            v{project.version}
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                          <button
                            onClick={() => handleProjectAction(project.id, 'edit')}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleProjectAction(project.id, 'doctor')}
                            className="p-1 text-gray-400 hover:text-green-600 rounded"
                            title="AI Diagnosis"
                          >
                            <Wand2 className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {project.title}
                    </h3>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <span>{project.genre}</span>
                      <span>•</span>
                      <span>{project.platform}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(project.lastEdited)}</span>
                      <span className="mx-2">•</span>
                      <span>{project.wordCount} words</span>
                      <span className="mx-2">•</span>
                      <span>{project.estimatedDuration}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleProjectAction(project.id, 'edit')}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleProjectAction(project.id, 'duplicate')}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleProjectAction(project.id, 'delete')}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors group"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-gray-600 group-hover:text-red-600" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
              >
                <div className="divide-y divide-gray-200">
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{project.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <span>{project.genre}</span>
                              <span>•</span>
                              <span>{project.platform}</span>
                              <span>•</span>
                              <span>{formatDate(project.lastEdited)}</span>
                              <span>•</span>
                              <span>{project.wordCount} words</span>
                              <span>•</span>
                              <span>{project.estimatedDuration}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                            {getStatusText(project.status)}
                          </span>
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleProjectAction(project.id, 'edit')}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1"
                            >
                              <Edit3 className="h-4 w-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleProjectAction(project.id, 'doctor')}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-1"
                            >
                              <Wand2 className="h-4 w-4" />
                              <span>Diagnose</span>
                            </button>
                            <button
                              onClick={() => handleProjectAction(project.id, 'duplicate')}
                              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleProjectAction(project.id, 'delete')}
                              className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors group"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-gray-600 group-hover:text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="bg-gray-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'No matching projects found' : 'No projects yet'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search terms or filters'
                  : 'Create your first script project and begin your creative journey'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/studio"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all inline-flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create New Project</span>
                </Link>
                {(searchTerm || filterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                    className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;