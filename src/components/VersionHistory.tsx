import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  GitBranch, 
  GitCommit, 
  Clock, 
  User, 
  Tag, 
  Download, 
  Upload,
  RotateCcw,
  Eye,
  Trash2,
  Plus,
  Minus,
  FileText,
  Save,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { 
  ScriptVersion, 
  VersionDiff, 
  VersionHistoryManager 
} from '../utils/versionHistory';

interface VersionHistoryProps {
  projectId: string;
  userId: string;
  currentContent: string;
  currentTitle: string;
  onRestoreVersion: (content: string, title: string) => void;
  onShowDiff?: (oldVersion: ScriptVersion, newVersion?: ScriptVersion) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({
  projectId,
  userId,
  currentContent,
  currentTitle,
  onRestoreVersion,
  onShowDiff
}) => {
  const [versions, setVersions] = useState<ScriptVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ScriptVersion | null>(null);
  const [showDiff, setShowDiff] = useState<VersionDiff | null>(null);
  const [compareVersion, setCompareVersion] = useState<ScriptVersion | null>(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);

  // Load versions
  useEffect(() => {
    loadVersions();
  }, [projectId]);

  const loadVersions = () => {
    const projectVersions = VersionHistoryManager.getVersions(projectId);
    setVersions(projectVersions);
  };

  const handleSaveVersion = (isMajorVersion = false) => {
    const newVersion = VersionHistoryManager.saveVersion(
      projectId,
      userId,
      currentContent,
      currentTitle,
      commitMessage || undefined,
      false,
      isMajorVersion
    );
    
    setVersions(prev => [newVersion, ...prev]);
    setCommitMessage('');
    setShowCommitDialog(false);
  };

  const handleRestoreVersion = (version: ScriptVersion) => {
    if (confirm(`Restore to version from ${formatDate(version.timestamp)}?\n\nThis will create a new version with the restored content.`)) {
      const restoredVersion = VersionHistoryManager.restoreVersion(projectId, version.id);
      if (restoredVersion) {
        onRestoreVersion(version.content, version.title);
        loadVersions();
      }
    }
  };

  const handleDeleteVersion = (versionId: string) => {
    if (confirm('Are you sure you want to delete this version? This cannot be undone.')) {
      VersionHistoryManager.deleteVersion(projectId, versionId);
      loadVersions();
    }
  };

  const handleTagVersion = (version: ScriptVersion) => {
    if (newTag.trim()) {
      VersionHistoryManager.tagVersion(projectId, version.id, newTag.trim());
      loadVersions();
      setNewTag('');
      setShowTagDialog(false);
      setSelectedVersion(null);
    }
  };

  const handleShowDiff = (version: ScriptVersion, compareWith?: ScriptVersion) => {
    const comparisonContent = compareWith ? compareWith.content : currentContent;
    const diff = VersionHistoryManager.generateDiff(version.content, comparisonContent);
    setShowDiff(diff);
    setSelectedVersion(version);
    setCompareVersion(compareWith || null);
  };

  const handleExportHistory = () => {
    const exportData = VersionHistoryManager.exportVersionHistory(projectId);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `version-history-${projectId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDateRelative = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(timestamp);
  };

  const getVersionTypeIcon = (version: ScriptVersion) => {
    if (version.metadata.isMajorVersion) return <Tag className="h-4 w-4 text-yellow-600" />;
    if (version.metadata.isAutoSave) return <Clock className="h-4 w-4 text-gray-400" />;
    return <GitCommit className="h-4 w-4 text-blue-600" />;
  };

  const getVersionTypeColor = (version: ScriptVersion) => {
    if (version.metadata.isMajorVersion) return 'border-l-yellow-500 bg-yellow-50';
    if (version.metadata.isAutoSave) return 'border-l-gray-300 bg-gray-50';
    return 'border-l-blue-500 bg-blue-50';
  };

  const stats = VersionHistoryManager.getVersionStats(projectId);

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <History className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
            {stats.totalVersions} versions
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCommitDialog(true)}
            className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Version</span>
          </button>
          
          <button
            onClick={handleExportHistory}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
            title="Export History"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">{stats.totalVersions}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-yellow-600">{stats.majorVersions}</div>
            <div className="text-xs text-gray-600">Releases</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">{stats.totalChanges}</div>
            <div className="text-xs text-gray-600">Changes</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-600">{stats.autoSaves}</div>
            <div className="text-xs text-gray-600">Auto-saves</div>
          </div>
        </div>
      </div>

      {/* Version List */}
      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <History className="h-12 w-12 mb-4" />
            <h4 className="text-lg font-medium mb-2">No Version History</h4>
            <p className="text-sm text-center max-w-xs">
              Save your first version to start tracking changes to your script.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {versions.map((version, index) => (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getVersionTypeColor(version)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {getVersionTypeIcon(version)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {version.title}
                        </h4>
                        {version.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      {version.message && (
                        <p className="text-sm text-gray-600 mb-2">{version.message}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{version.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDateRelative(version.timestamp)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-3 w-3" />
                          <span>{version.metadata.wordCount} words</span>
                        </div>
                        {version.metadata.changes && version.metadata.changes.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>{version.metadata.changes.length} changes</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 ml-4">
                    <button
                      onClick={() => handleShowDiff(version)}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded"
                      title="Show Diff"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedVersion(version);
                        setShowTagDialog(true);
                      }}
                      className="p-1 text-gray-400 hover:text-yellow-600 rounded"
                      title="Add Tag"
                    >
                      <Tag className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleRestoreVersion(version)}
                      className="p-1 text-gray-400 hover:text-green-600 rounded"
                      title="Restore Version"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    
                    {!version.metadata.isAutoSave && (
                      <button
                        onClick={() => handleDeleteVersion(version.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Delete Version"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Commit Dialog */}
      <AnimatePresence>
        {showCommitDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowCommitDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-2 mb-4">
                <GitCommit className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Save New Version</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commit Message (Optional)
                  </label>
                  <textarea
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Describe your changes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Mark as major version</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCommitDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveVersion(false)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Version
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tag Dialog */}
      <AnimatePresence>
        {showTagDialog && selectedVersion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowTagDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-2 mb-4">
                <Tag className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-semibold">Add Tag</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tag Name
                  </label>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="e.g., v1.0, final-draft, review-ready"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleTagVersion(selectedVersion);
                      }
                    }}
                  />
                </div>
                
                {selectedVersion.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Existing Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedVersion.tags.map(tag => (
                        <span 
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowTagDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleTagVersion(selectedVersion)}
                  disabled={!newTag.trim()}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Tag
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diff Viewer */}
      <AnimatePresence>
        {showDiff && selectedVersion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDiff(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <GitBranch className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Version Comparison</h3>
                </div>
                <button
                  onClick={() => setShowDiff(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="flex-1 overflow-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center space-x-2">
                      <span>Version: {selectedVersion.title}</span>
                      <span className="text-sm text-gray-500">
                        ({formatDate(selectedVersion.timestamp)})
                      </span>
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm h-64 overflow-auto">
                      {selectedVersion.content.split('\n').map((line, index) => (
                        <div key={index} className="whitespace-pre-wrap">
                          <span className="text-gray-400 mr-2">{index + 1}</span>
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Current Version</h4>
                    <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm h-64 overflow-auto">
                      {currentContent.split('\n').map((line, index) => (
                        <div key={index} className="whitespace-pre-wrap">
                          <span className="text-gray-400 mr-2">{index + 1}</span>
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Change Summary */}
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Changes Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-green-600">
                        +{showDiff.added.length}
                      </div>
                      <div className="text-sm text-gray-600">Added</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-red-600">
                        -{showDiff.deleted.length}
                      </div>
                      <div className="text-sm text-gray-600">Deleted</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-yellow-600">
                        ~{showDiff.modified.length}
                      </div>
                      <div className="text-sm text-gray-600">Modified</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VersionHistory;