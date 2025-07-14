import { ScriptProject, User } from '../types/user';
import { z } from 'zod';

// Project validation schemas
const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  content: z.string().min(10),
  genre: z.string().min(2).max(50),
  tags: z.array(z.string()).max(10),
  format: z.enum(['shooting-script', 'dialog-only', 'voiceover']),
});

const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  status: z.enum(['draft', 'final', 'archived']).optional(),
});

// Project storage interface
interface ProjectStorage {
  getProjects(userId: string): Promise<ScriptProject[]>;
  getProject(id: string, userId: string): Promise<ScriptProject | null>;
  createProject(data: Omit<ScriptProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScriptProject>;
  updateProject(id: string, data: Partial<ScriptProject>, userId: string): Promise<ScriptProject>;
  deleteProject(id: string, userId: string): Promise<void>;
  searchProjects(userId: string, query: string): Promise<ScriptProject[]>;
}

// LocalStorage implementation for development
class LocalStorageProjectManager implements ProjectStorage {
  private readonly storageKey = 'scriptproshot_projects';

  private getStoredProjects(): ScriptProject[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveProjects(projects: ScriptProject[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(projects));
    } catch (error) {
      console.error('Failed to save projects:', error);
    }
  }

  async getProjects(userId: string): Promise<ScriptProject[]> {
    const projects = this.getStoredProjects();
    return projects.filter(p => p.userId === userId);
  }

  async getProject(id: string, userId: string): Promise<ScriptProject | null> {
    const projects = this.getStoredProjects();
    const project = projects.find(p => p.id === id && p.userId === userId);
    return project || null;
  }

  async createProject(data: Omit<ScriptProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScriptProject> {
    const projects = this.getStoredProjects();
    
    const newProject: ScriptProject = {
      ...data,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.push(newProject);
    this.saveProjects(projects);
    
    return newProject;
  }

  async updateProject(id: string, data: Partial<ScriptProject>, userId: string): Promise<ScriptProject> {
    const projects = this.getStoredProjects();
    const index = projects.findIndex(p => p.id === id && p.userId === userId);
    
    if (index === -1) {
      throw new Error('Project not found');
    }

    const updatedProject = {
      ...projects[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    projects[index] = updatedProject;
    this.saveProjects(projects);
    
    return updatedProject;
  }

  async deleteProject(id: string, userId: string): Promise<void> {
    const projects = this.getStoredProjects();
    const filteredProjects = projects.filter(p => !(p.id === id && p.userId === userId));
    this.saveProjects(filteredProjects);
  }

  async searchProjects(userId: string, query: string): Promise<ScriptProject[]> {
    const projects = await this.getProjects(userId);
    const lowercaseQuery = query.toLowerCase();
    
    return projects.filter(project =>
      project.name.toLowerCase().includes(lowercaseQuery) ||
      project.genre.toLowerCase().includes(lowercaseQuery) ||
      project.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      project.content.toLowerCase().includes(lowercaseQuery)
    );
  }

  private generateId(): string {
    return 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Supabase implementation (for production)
class SupabaseProjectManager implements ProjectStorage {
  // TODO: Implement Supabase methods
  async getProjects(userId: string): Promise<ScriptProject[]> {
    // const { data, error } = await supabase
    //   .from('script_projects')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .order('updated_at', { ascending: false });
    
    // if (error) throw error;
    // return data || [];
    return [];
  }

  async getProject(id: string, userId: string): Promise<ScriptProject | null> {
    // const { data, error } = await supabase
    //   .from('script_projects')
    //   .select('*')
    //   .eq('id', id)
    //   .eq('user_id', userId)
    //   .single();
    
    // if (error) throw error;
    // return data;
    return null;
  }

  async createProject(data: Omit<ScriptProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScriptProject> {
    // const { data: project, error } = await supabase
    //   .from('script_projects')
    //   .insert(data)
    //   .single();
    
    // if (error) throw error;
    // return project;
    throw new Error('Not implemented');
  }

  async updateProject(id: string, data: Partial<ScriptProject>, userId: string): Promise<ScriptProject> {
    // const { data: project, error } = await supabase
    //   .from('script_projects')
    //   .update({ ...data, updated_at: new Date().toISOString() })
    //   .eq('id', id)
    //   .eq('user_id', userId)
    //   .single();
    
    // if (error) throw error;
    // return project;
    throw new Error('Not implemented');
  }

  async deleteProject(id: string, userId: string): Promise<void> {
    // const { error } = await supabase
    //   .from('script_projects')
    //   .delete()
    //   .eq('id', id)
    //   .eq('user_id', userId);
    
    // if (error) throw error;
  }

  async searchProjects(userId: string, query: string): Promise<ScriptProject[]> {
    // const { data, error } = await supabase
    //   .from('script_projects')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .or(`name.ilike.%${query}%, content.ilike.%${query}%, tags.cs.{${query}}`)
    //   .order('updated_at', { ascending: false });
    
    // if (error) throw error;
    // return data || [];
    return [];
  }
}

// Project manager service
export class ProjectManagerService {
  private storage: ProjectStorage;

  constructor(useSupabase = false) {
    this.storage = useSupabase ? new SupabaseProjectManager() : new LocalStorageProjectManager();
  }

  async createProject(
    userId: string,
    data: z.infer<typeof CreateProjectSchema>
  ): Promise<ScriptProject> {
    const validated = CreateProjectSchema.parse(data);
    
    return this.storage.createProject({
      ...validated,
      userId,
      status: 'draft',
    });
  }

  async updateProject(
    id: string,
    userId: string,
    data: z.infer<typeof UpdateProjectSchema>
  ): Promise<ScriptProject> {
    const validated = UpdateProjectSchema.parse(data);
    return this.storage.updateProject(id, validated, userId);
  }

  async getProject(id: string, userId: string): Promise<ScriptProject | null> {
    return this.storage.getProject(id, userId);
  }

  async getProjects(userId: string): Promise<ScriptProject[]> {
    return this.storage.getProjects(userId);
  }

  async deleteProject(id: string, userId: string): Promise<void> {
    return this.storage.deleteProject(id, userId);
  }

  async searchProjects(userId: string, query: string): Promise<ScriptProject[]> {
    if (!query.trim()) {
      return this.getProjects(userId);
    }
    return this.storage.searchProjects(userId, query.trim());
  }

  async duplicateProject(id: string, userId: string): Promise<ScriptProject> {
    const original = await this.getProject(id, userId);
    if (!original) {
      throw new Error('Project not found');
    }

    return this.createProject(userId, {
      name: `${original.name} (Copy)`,
      content: original.content,
      genre: original.genre,
      tags: [...original.tags],
      format: original.format,
    });
  }

  async getProjectsByStatus(userId: string, status: ScriptProject['status']): Promise<ScriptProject[]> {
    const projects = await this.getProjects(userId);
    return projects.filter(p => p.status === status);
  }

  async getProjectsByTag(userId: string, tag: string): Promise<ScriptProject[]> {
    const projects = await this.getProjects(userId);
    return projects.filter(p => p.tags.includes(tag));
  }

  async getAllTags(userId: string): Promise<string[]> {
    const projects = await this.getProjects(userId);
    const allTags = projects.flatMap(p => p.tags);
    return [...new Set(allTags)].sort();
  }

  async getProjectStats(userId: string): Promise<{
    total: number;
    drafts: number;
    final: number;
    archived: number;
    recentlyUpdated: ScriptProject[];
  }> {
    const projects = await this.getProjects(userId);
    
    return {
      total: projects.length,
      drafts: projects.filter(p => p.status === 'draft').length,
      final: projects.filter(p => p.status === 'final').length,
      archived: projects.filter(p => p.status === 'archived').length,
      recentlyUpdated: projects
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    };
  }
}

// Export singleton instance
export const projectManager = new ProjectManagerService(false); // Set to true for Supabase