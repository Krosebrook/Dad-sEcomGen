import { supabase } from '../lib/safeSupabase';
import { UserPreferences } from '../types/analytics.types';
import { ThemeVariant, ColorMode, AnimationSpeed, AvatarPersonality } from '../types/ui.types';

export interface PreferenceUpdates {
  theme_variant?: ThemeVariant;
  color_mode?: ColorMode;
  animation_enabled?: boolean;
  animation_speed?: AnimationSpeed;
  reduced_motion?: boolean;
  avatar_personality?: AvatarPersonality;
  tutorial_completed?: boolean;
  tutorial_step?: number;
  keyboard_shortcuts_enabled?: boolean;
}

export const userPreferencesService = {
  async getPreferences(): Promise<UserPreferences | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return null;
    }
  },

  async updatePreferences(updates: PreferenceUpdates): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('user_preferences')
          .update(updates)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            ...updates,
          });
      }
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  },

  async initializePreferences(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const existing = await this.getPreferences();
      if (!existing) {
        await supabase.from('user_preferences').insert({
          user_id: user.id,
          theme_variant: 'minimalist',
          color_mode: 'light',
          animation_enabled: true,
          animation_speed: 'normal',
          reduced_motion: false,
          avatar_personality: 'friendly',
          tutorial_completed: false,
          tutorial_step: 0,
          keyboard_shortcuts_enabled: true,
        });
      }
    } catch (error) {
      console.error('Failed to initialize user preferences:', error);
    }
  },

  async completeTutorial(): Promise<void> {
    await this.updatePreferences({
      tutorial_completed: true,
      tutorial_step: 0,
    });
  },

  async updateTutorialStep(step: number): Promise<void> {
    await this.updatePreferences({
      tutorial_step: step,
    });
  },
};
