// User subscription and plan types
export type UserPlan = 'free' | 'pro' | 'studio';

export interface User {
  id: string;
  email: string;
  name?: string;
  plan: UserPlan;
  planExpiry?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanFeatures {
  name: string;
  maxDailyGenerations: number;
  maxProjects: number;
  canExportFDX: boolean;
  canExportPDF: boolean;
  canUseAudio: boolean;
  canUseStoryboard: boolean;
  canCollaborate: boolean;
  canSaveTemplates: boolean;
  canRewriteScenes: boolean;
}

export const PLAN_FEATURES: Record<UserPlan, PlanFeatures> = {
  free: {
    name: 'Free',
    maxDailyGenerations: 3,
    maxProjects: 0,
    canExportFDX: false,
    canExportPDF: false,
    canUseAudio: false,
    canUseStoryboard: false,
    canCollaborate: false,
    canSaveTemplates: false,
    canRewriteScenes: true,
  },
  pro: {
    name: 'Pro',
    maxDailyGenerations: 50,
    maxProjects: 20,
    canExportFDX: true,
    canExportPDF: true,
    canUseAudio: true,
    canUseStoryboard: false,
    canCollaborate: false,
    canSaveTemplates: true,
    canRewriteScenes: true,
  },
  studio: {
    name: 'Studio',
    maxDailyGenerations: 200,
    maxProjects: 100,
    canExportFDX: true,
    canExportPDF: true,
    canUseAudio: true,
    canUseStoryboard: true,
    canCollaborate: true,
    canSaveTemplates: true,
    canRewriteScenes: true,
  },
};

export interface ScriptProject {
  id: string;
  userId: string;
  name: string;
  content: string;
  genre: string;
  tags: string[];
  status: 'draft' | 'final' | 'archived';
  format: 'shooting-script' | 'dialog-only' | 'voiceover';
  createdAt: string;
  updatedAt: string;
  sharedWith?: string[]; // For studio collaboration
}

export interface SceneRewriteRequest {
  sceneText: string;
  context: string;
  tone: string;
  genre: string;
  preserveStructure?: boolean;
}

export interface ExportRequest {
  scriptId: string;
  format: 'fdx' | 'pdf' | 'txt';
  options?: {
    includeNotes?: boolean;
    fontSize?: number;
    paperSize?: 'letter' | 'a4';
  };
}