import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  List
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const scripts = [
    {
      id: 1,
      title: 'Coffee Shop Encounter',
      lastEdited: '2 hours ago',
      sceneCount: 3,
      genre: 'Comedy',
      status: 'Draft'
    },
    {
      id: 2,
      title: 'The Night Shift',
      lastEdited: '1 day ago',
      sceneCount: 5,
      genre: 'Thriller',
      status: 'Complete'
    },
    {
      id: 3,
      title: 'Tech Startup Pitch',
      lastEdited: '3 days ago',
      sceneCount: 2,
      genre: 'Drama',
      status: 'In Progress'
    },
    {
      id: 4,
      title: 'Morning Routine',
      lastEdited: '1 week ago',
      sceneCount: 1,
      genre: 'Documentary',
      status: 'Draft'
    },
    {
      id: 5,
      title: 'First Date Disaster',
      lastEdited: '2 weeks ago',
      sceneCount: 4,
      genre: 'Romance',
      status: 'Complete'
    },
    {
      id: 6,
      title: 'Product Demo Video',
      lastEdited: '3 weeks ago',
      sceneCount: 3,
      genre: 'Commercial',
      status: 'In Progress'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredScripts = scripts.filter(script =>
    script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Scripts</h1>
            <p className="text-gray-600">Manage and organize your screenplay projects</p>
          </div>
          <Link
            to="/generate"
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 w-fit"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Script</span>
          </Link>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search scripts by title or genre..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter Button */}
            <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">Filter</span>
            </button>

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

        {/* Scripts Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScripts.map((script) => (
              <div key={script.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(script.status)}`}>
                      {script.status}
                    </span>
                  </div>
                  <div className="relative">
                    <button className="text-gray-400 hover:text-gray-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{script.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{script.genre}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{script.lastEdited}</span>
                  <span className="mx-2">•</span>
                  <span>{script.sceneCount} scenes</span>
                </div>
                
                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Open
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Copy className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Trash2 className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredScripts.map((script) => (
                <div key={script.id} className="p-6 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{script.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{script.genre}</span>
                          <span>•</span>
                          <span>{script.lastEdited}</span>
                          <span>•</span>
                          <span>{script.sceneCount} scenes</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(script.status)}`}>
                        {script.status}
                      </span>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                          Open
                        </button>
                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Copy className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Trash2 className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredScripts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scripts found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first script to get started'}
            </p>
            <Link
              to="/generate"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create New Script</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;