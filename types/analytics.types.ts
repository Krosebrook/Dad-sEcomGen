export type EventCategory = 'navigation' | 'feature_usage' | 'interaction' | 'error' | 'performance';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AnalyticsEvent {
  id?: string;
  user_id?: string;
  venture_id?: string;
  event_type: string;
  event_category: EventCategory;
  metadata?: Record<string, any>;
  session_id?: string;
  viewport_width?: number;
  viewport_height?: number;
  user_agent?: string;
  created_at?: string;
}

export interface ExportHistoryRecord {
  id: string;
  user_id: string;
  venture_id?: string;
  export_type: string;
  export_format: string;
  file_size_bytes?: number;
  metadata?: Record<string, any>;
  status: ExportStatus;
  error_message?: string;
  download_url?: string;
  expires_at?: string;
  created_at: string;
}

export interface VentureSnapshot {
  id: string;
  venture_id: string;
  user_id: string;
  snapshot_name: string;
  description?: string;
  snapshot_data: any;
  tags?: string[];
  is_favorite: boolean;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme_variant: string;
  color_mode: string;
  animation_enabled: boolean;
  animation_speed: string;
  reduced_motion: boolean;
  avatar_personality: string;
  tutorial_completed: boolean;
  tutorial_step: number;
  keyboard_shortcuts_enabled: boolean;
  created_at: string;
  updated_at: string;
}
