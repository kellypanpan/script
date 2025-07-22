import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, FileText, Wand2, Edit3, Download, AlertCircle } from 'lucide-react';

interface ProjectContextProps {
  currentProject?: any;
  className?: string;
}

const ProjectContext: React.FC<ProjectContextProps> = ({ currentProject, className = '' }) => {
  const location = useLocation();
  
  // Don't show on landing page
  if (location.pathname === '/') {
    return null;
  }

  const isStudio = location.pathname === '/studio';
  const isDoctor = location.pathname === '/script-doctor';
  const isDashboard = location.pathname === '/dashboard';

  // Workflow steps with status
  const workflowSteps = [
    {
      id: 'create',
      name: 'Create',
      description: 'Generate or write your script',
      icon: FileText,
      href: '/studio',
      status: currentProject ? 'completed' : (isStudio ? 'current' : 'upcoming'),
      disabled: false
    },
    {
      id: 'improve',
      name: 'Improve',
      description: 'AI analysis and optimization',
      icon: Wand2,
      href: '/script-doctor',
      status: currentProject ? (isDoctor ? 'current' : 'available') : 'disabled',
      disabled: !currentProject
    },
    {
      id: 'manage',
      name: 'Manage',
      description: 'Save, organize, and export',
      icon: Edit3,
      href: '/dashboard',
      status: currentProject ? (isDashboard ? 'current' : 'available') : 'disabled',
      disabled: !currentProject
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'current':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'available':
        return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200';
      case 'disabled':
        return 'bg-gray-50 text-gray-400 border-gray-100';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className={`bg-white border-b border-gray-100 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Current Project Info */}
        {currentProject && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-blue-900">{currentProject.title}</h4>
                  <p className="text-sm text-blue-700">
                    {currentProject.wordCount} words • {currentProject.estimatedDuration}
                  </p>
                </div>
              </div>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                v{currentProject.version}
              </span>
            </div>
          </div>
        )}

        {/* Workflow Progress */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Creative Workflow</h3>
          
          {!currentProject && (
            <div className="flex items-center space-x-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              <AlertCircle className="h-3 w-3" />
              <span>Start by creating a script</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {workflowSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              {step.disabled ? (
                <div 
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border cursor-not-allowed ${getStatusColor(step.status)}`}
                  title={`${step.name} - ${step.description}${step.disabled ? ' (Complete previous step first)' : ''}`}
                >
                  <step.icon className="h-4 w-4" />
                  <div className="text-left">
                    <div className="text-sm font-medium">{step.name}</div>
                    <div className="text-xs opacity-75">{step.description}</div>
                  </div>
                </div>
              ) : (
                <Link
                  to={step.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${getStatusColor(step.status)}`}
                  title={`${step.name} - ${step.description}`}
                >
                  <step.icon className="h-4 w-4" />
                  <div className="text-left">
                    <div className="text-sm font-medium">{step.name}</div>
                    <div className="text-xs opacity-75">{step.description}</div>
                  </div>
                </Link>
              )}
              
              {index < workflowSteps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
          
          {/* Quick Export Action */}
          {currentProject && (
            <>
              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <button
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border bg-green-100 text-green-800 border-green-200 hover:bg-green-200 transition-colors"
                title="Export your script"
              >
                <Download className="h-4 w-4" />
                <div className="text-left">
                  <div className="text-sm font-medium">Export</div>
                  <div className="text-xs opacity-75">PDF, FDX, TXT</div>
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectContext;