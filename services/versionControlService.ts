import { supabase } from '../lib/safeSupabase';
import { AppData } from '../types';

export interface VentureVersion {
  id: string;
  venture_id: string;
  version_number: number;
  label?: string;
  snapshot: AppData;
  created_by: string;
  created_at: string;
  profiles?: {
    full_name?: string;
    email: string;
  };
}

export interface VersionDiff {
  field: string;
  oldValue: any;
  newValue: any;
  path: string;
}

export const versionControlService = {
  async createVersion(
    ventureId: string,
    data: AppData,
    label?: string
  ): Promise<VentureVersion> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: lastVersion } = await supabase
      .from('venture_versions')
      .select('version_number')
      .eq('venture_id', ventureId)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    const versionNumber = lastVersion ? lastVersion.version_number + 1 : 1;

    const { data: version, error } = await supabase
      .from('venture_versions')
      .insert({
        venture_id: ventureId,
        version_number: versionNumber,
        label,
        snapshot: data,
        created_by: user.id,
      })
      .select(`
        *,
        profiles:created_by (
          full_name,
          email
        )
      `)
      .single();

    if (error) throw error;
    return version;
  },

  async getVersions(ventureId: string, limit: number = 20): Promise<VentureVersion[]> {
    const { data, error } = await supabase
      .from('venture_versions')
      .select(`
        *,
        profiles:created_by (
          full_name,
          email
        )
      `)
      .eq('venture_id', ventureId)
      .order('version_number', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getVersion(versionId: string): Promise<VentureVersion> {
    const { data, error } = await supabase
      .from('venture_versions')
      .select(`
        *,
        profiles:created_by (
          full_name,
          email
        )
      `)
      .eq('id', versionId)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteVersion(versionId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('venture_versions')
      .delete()
      .eq('id', versionId)
      .eq('created_by', user.id);

    if (error) throw error;
  },

  compareVersions(oldData: AppData, newData: AppData): VersionDiff[] {
    const diffs: VersionDiff[] = [];

    const compareObjects = (
      obj1: any,
      obj2: any,
      path: string = ''
    ) => {
      if (obj1 === obj2) return;

      if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
        if (obj1 !== obj2) {
          diffs.push({
            field: path.split('.').pop() || path,
            oldValue: obj1,
            newValue: obj2,
            path,
          });
        }
        return;
      }

      const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

      for (const key of allKeys) {
        const newPath = path ? `${path}.${key}` : key;

        if (!(key in obj1)) {
          diffs.push({
            field: key,
            oldValue: undefined,
            newValue: obj2[key],
            path: newPath,
          });
        } else if (!(key in obj2)) {
          diffs.push({
            field: key,
            oldValue: obj1[key],
            newValue: undefined,
            path: newPath,
          });
        } else if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
          if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
            diffs.push({
              field: key,
              oldValue: obj1[key],
              newValue: obj2[key],
              path: newPath,
            });
          }
        } else {
          compareObjects(obj1[key], obj2[key], newPath);
        }
      }
    };

    compareObjects(oldData, newData);
    return diffs;
  },

  formatDiff(diff: VersionDiff): string {
    const fieldName = diff.field.replace(/([A-Z])/g, ' $1').toLowerCase();

    if (diff.oldValue === undefined) {
      return `Added ${fieldName}`;
    }
    if (diff.newValue === undefined) {
      return `Removed ${fieldName}`;
    }
    return `Changed ${fieldName}`;
  },
};
