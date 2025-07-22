/**
 * Version History Management System
 * Provides Git-like version control for script content
 */

export interface ScriptVersion {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  title: string;
  message?: string; // Commit message
  timestamp: string;
  author: string;
  tags: string[];
  metadata: {
    wordCount: number;
    characterCount: number;
    sceneCount?: number;
    pageCount?: number;
    format: 'fountain' | 'screenplay' | 'dialogue' | 'treatment';
    changes?: VersionChange[];
    parentVersionId?: string;
    isMajorVersion: boolean; // For release versions
    isAutoSave: boolean;
  };
}

export interface VersionChange {
  type: 'added' | 'deleted' | 'modified';
  lineStart: number;
  lineEnd: number;
  oldContent?: string;
  newContent?: string;
  description: string;
}

export interface VersionDiff {
  added: { line: number; content: string }[];
  deleted: { line: number; content: string }[];
  modified: { line: number; oldContent: string; newContent: string }[];
  unchanged: { line: number; content: string }[];
}

export interface VersionBranch {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  versions: string[]; // Version IDs in chronological order
  isActive: boolean;
}

export class VersionHistoryManager {
  private static readonly STORAGE_KEY_PREFIX = 'version_history_';
  private static readonly MAX_VERSIONS_PER_PROJECT = 50;
  private static readonly AUTO_SAVE_INTERVAL = 30000; // 30 seconds

  /**
   * Save a new version
   */
  static saveVersion(
    projectId: string,
    userId: string,
    content: string,
    title: string,
    message?: string,
    isAutoSave = false,
    isMajorVersion = false
  ): ScriptVersion {
    const versions = this.getVersions(projectId);
    const lastVersion = versions[0]; // Most recent version
    
    // Generate changes if there's a previous version
    const changes = lastVersion ? this.generateChanges(lastVersion.content, content) : [];
    
    const newVersion: ScriptVersion = {
      id: this.generateVersionId(),
      projectId,
      userId,
      content,
      title,
      message,
      timestamp: new Date().toISOString(),
      author: userId, // In a real app, get user name
      tags: [],
      metadata: {
        wordCount: this.countWords(content),
        characterCount: content.length,
        sceneCount: this.countScenes(content),
        pageCount: Math.ceil(content.length / 250), // Rough estimate
        format: this.detectFormat(content),
        changes,
        parentVersionId: lastVersion?.id,
        isMajorVersion,
        isAutoSave
      }
    };

    // Add to beginning of array (most recent first)
    const updatedVersions = [newVersion, ...versions].slice(0, this.MAX_VERSIONS_PER_PROJECT);
    
    this.saveVersionsToStorage(projectId, updatedVersions);
    
    return newVersion;
  }

  /**
   * Get all versions for a project
   */
  static getVersions(projectId: string): ScriptVersion[] {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}${projectId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get a specific version
   */
  static getVersion(projectId: string, versionId: string): ScriptVersion | null {
    const versions = this.getVersions(projectId);
    return versions.find(v => v.id === versionId) || null;
  }

  /**
   * Delete a version
   */
  static deleteVersion(projectId: string, versionId: string): boolean {
    const versions = this.getVersions(projectId);
    const filteredVersions = versions.filter(v => v.id !== versionId);
    
    if (filteredVersions.length === versions.length) {
      return false; // Version not found
    }
    
    this.saveVersionsToStorage(projectId, filteredVersions);
    return true;
  }

  /**
   * Tag a version
   */
  static tagVersion(projectId: string, versionId: string, tag: string): boolean {
    const versions = this.getVersions(projectId);
    const version = versions.find(v => v.id === versionId);
    
    if (!version) return false;
    
    if (!version.tags.includes(tag)) {
      version.tags.push(tag);
      this.saveVersionsToStorage(projectId, versions);
    }
    
    return true;
  }

  /**
   * Generate diff between two versions
   */
  static generateDiff(oldContent: string, newContent: string): VersionDiff {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    
    const diff: VersionDiff = {
      added: [],
      deleted: [],
      modified: [],
      unchanged: []
    };

    const maxLines = Math.max(oldLines.length, newLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];
      
      if (oldLine === undefined) {
        // Line was added
        diff.added.push({ line: i + 1, content: newLine });
      } else if (newLine === undefined) {
        // Line was deleted
        diff.deleted.push({ line: i + 1, content: oldLine });
      } else if (oldLine !== newLine) {
        // Line was modified
        diff.modified.push({ line: i + 1, oldContent: oldLine, newContent: newLine });
      } else {
        // Line unchanged
        diff.unchanged.push({ line: i + 1, content: oldLine });
      }
    }
    
    return diff;
  }

  /**
   * Get version statistics
   */
  static getVersionStats(projectId: string): {
    totalVersions: number;
    majorVersions: number;
    autoSaves: number;
    totalChanges: number;
    firstVersion: string;
    lastVersion: string;
  } {
    const versions = this.getVersions(projectId);
    
    if (versions.length === 0) {
      return {
        totalVersions: 0,
        majorVersions: 0,
        autoSaves: 0,
        totalChanges: 0,
        firstVersion: '',
        lastVersion: ''
      };
    }
    
    const totalChanges = versions.reduce((sum, v) => 
      sum + (v.metadata.changes?.length || 0), 0
    );
    
    return {
      totalVersions: versions.length,
      majorVersions: versions.filter(v => v.metadata.isMajorVersion).length,
      autoSaves: versions.filter(v => v.metadata.isAutoSave).length,
      totalChanges,
      firstVersion: versions[versions.length - 1].timestamp,
      lastVersion: versions[0].timestamp
    };
  }

  /**
   * Restore to a specific version
   */
  static restoreVersion(projectId: string, versionId: string): ScriptVersion | null {
    const version = this.getVersion(projectId, versionId);
    if (!version) return null;
    
    // Create a new version with the restored content
    return this.saveVersion(
      projectId,
      version.userId,
      version.content,
      `${version.title} (Restored)`,
      `Restored from version ${versionId}`,
      false,
      false
    );
  }

  /**
   * Auto-save functionality
   */
  static setupAutoSave(
    projectId: string,
    userId: string,
    getCurrentContent: () => string,
    getCurrentTitle: () => string
  ): () => void {
    const interval = setInterval(() => {
      const content = getCurrentContent();
      const title = getCurrentTitle();
      
      if (!content.trim()) return;
      
      const versions = this.getVersions(projectId);
      const lastVersion = versions[0];
      
      // Only save if content has changed
      if (!lastVersion || lastVersion.content !== content) {
        this.saveVersion(projectId, userId, content, title, 'Auto-save', true, false);
      }
    }, this.AUTO_SAVE_INTERVAL);

    // Return cleanup function
    return () => clearInterval(interval);
  }

  /**
   * Clean up old versions (keep only important ones)
   */
  static cleanupVersions(projectId: string): void {
    const versions = this.getVersions(projectId);
    
    // Keep all major versions and recent versions (last 20)
    const importantVersions = versions.filter((v, index) => 
      v.metadata.isMajorVersion || 
      !v.metadata.isAutoSave || 
      index < 20
    );
    
    // Keep at least the last 5 versions regardless
    const finalVersions = versions.slice(0, Math.max(5, importantVersions.length));
    
    this.saveVersionsToStorage(projectId, finalVersions);
  }

  // Helper methods
  private static generateVersionId(): string {
    return `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateChanges(oldContent: string, newContent: string): VersionChange[] {
    const diff = this.generateDiff(oldContent, newContent);
    const changes: VersionChange[] = [];

    diff.added.forEach(item => {
      changes.push({
        type: 'added',
        lineStart: item.line,
        lineEnd: item.line,
        newContent: item.content,
        description: `Added line ${item.line}: "${item.content.substring(0, 50)}..."`
      });
    });

    diff.deleted.forEach(item => {
      changes.push({
        type: 'deleted',
        lineStart: item.line,
        lineEnd: item.line,
        oldContent: item.content,
        description: `Deleted line ${item.line}: "${item.content.substring(0, 50)}..."`
      });
    });

    diff.modified.forEach(item => {
      changes.push({
        type: 'modified',
        lineStart: item.line,
        lineEnd: item.line,
        oldContent: item.oldContent,
        newContent: item.newContent,
        description: `Modified line ${item.line}`
      });
    });

    return changes;
  }

  private static countWords(content: string): number {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private static countScenes(content: string): number {
    const sceneHeadings = content.match(/^(INT\.|EXT\.|FADE IN:|FADE OUT\.)/gmi);
    return sceneHeadings ? sceneHeadings.length : 0;
  }

  private static detectFormat(content: string): 'fountain' | 'screenplay' | 'dialogue' | 'treatment' {
    const lines = content.split('\n');
    
    // Check for Fountain markers
    if (content.includes('FADE IN:') || content.includes('INT.') || content.includes('EXT.')) {
      return 'fountain';
    }
    
    // Check for dialogue-only format
    const hasCharacterNames = lines.some(line => 
      line.trim().match(/^[A-Z][A-Z\s]+$/) && line.trim().length < 30
    );
    
    if (hasCharacterNames) {
      return 'dialogue';
    }
    
    // Check for treatment format (narrative style)
    const averageLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
    if (averageLineLength > 60) {
      return 'treatment';
    }
    
    return 'screenplay';
  }

  private static saveVersionsToStorage(projectId: string, versions: ScriptVersion[]): void {
    try {
      localStorage.setItem(
        `${this.STORAGE_KEY_PREFIX}${projectId}`,
        JSON.stringify(versions)
      );
    } catch (error) {
      console.error('Failed to save version history:', error);
      // If storage is full, clean up and try again
      this.cleanupVersions(projectId);
      try {
        localStorage.setItem(
          `${this.STORAGE_KEY_PREFIX}${projectId}`,
          JSON.stringify(versions.slice(0, 10)) // Keep only last 10
        );
      } catch {
        console.error('Critical: Unable to save version history');
      }
    }
  }

  /**
   * Export version history
   */
  static exportVersionHistory(projectId: string): string {
    const versions = this.getVersions(projectId);
    const stats = this.getVersionStats(projectId);
    
    const exportData = {
      projectId,
      exportedAt: new Date().toISOString(),
      stats,
      versions: versions.map(v => ({
        ...v,
        metadata: {
          ...v.metadata,
          changes: undefined // Remove detailed changes to reduce size
        }
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import version history
   */
  static importVersionHistory(projectId: string, importData: string): boolean {
    try {
      const data = JSON.parse(importData);
      if (data.versions && Array.isArray(data.versions)) {
        this.saveVersionsToStorage(projectId, data.versions);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}