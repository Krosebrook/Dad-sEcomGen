import { supabase } from '../lib/supabase';

export interface Dependency {
  id?: string;
  venture_id: string;
  package_name: string;
  version: string;
  type: 'npm' | 'pip' | 'gem' | 'composer' | 'maven' | 'other';
  status: 'active' | 'outdated' | 'vulnerable' | 'deprecated';
  update_available?: string;
  last_checked?: string;
  metadata?: Record<string, any>;
}

export async function addDependency(dependency: Dependency) {
  const { data, error } = await supabase
    .from('dependencies')
    .insert(dependency)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listDependencies(ventureId: string, filters?: {
  type?: string;
  status?: string;
}) {
  let query = supabase
    .from('dependencies')
    .select('*')
    .eq('venture_id', ventureId);

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query.order('package_name', { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateDependency(dependencyId: string, updates: Partial<Dependency>) {
  const { data, error } = await supabase
    .from('dependencies')
    .update(updates)
    .eq('id', dependencyId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDependency(dependencyId: string) {
  const { error } = await supabase.from('dependencies').delete().eq('id', dependencyId);

  if (error) throw error;
}

export async function checkForUpdates(ventureId: string) {
  const { data: dependencies } = await supabase
    .from('dependencies')
    .select('*')
    .eq('venture_id', ventureId)
    .eq('type', 'npm');

  if (!dependencies) return [];

  const updates = [];

  for (const dep of dependencies) {
    try {
      const latestVersion = await getNPMLatestVersion(dep.package_name);
      if (latestVersion && latestVersion !== dep.version) {
        await updateDependency(dep.id!, {
          update_available: latestVersion,
          status: 'outdated',
          last_checked: new Date().toISOString(),
        });
        updates.push({
          package: dep.package_name,
          current: dep.version,
          latest: latestVersion,
        });
      }
    } catch (error) {
      console.error(`Failed to check ${dep.package_name}:`, error);
    }
  }

  return updates;
}

async function getNPMLatestVersion(packageName: string): Promise<string | null> {
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}/latest`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.version;
  } catch (error) {
    return null;
  }
}

export async function checkVulnerabilities(ventureId: string) {
  const { data: dependencies } = await supabase
    .from('dependencies')
    .select('*')
    .eq('venture_id', ventureId)
    .eq('type', 'npm');

  if (!dependencies) return [];

  const vulnerabilities = [];

  for (const dep of dependencies) {
    const vulns = await checkNPMVulnerabilities(dep.package_name, dep.version);
    if (vulns.length > 0) {
      await updateDependency(dep.id!, {
        status: 'vulnerable',
        metadata: { vulnerabilities: vulns },
      });
      vulnerabilities.push({
        package: dep.package_name,
        version: dep.version,
        vulnerabilities: vulns,
      });
    }
  }

  return vulnerabilities;
}

async function checkNPMVulnerabilities(
  packageName: string,
  version: string
): Promise<any[]> {
  return [];
}

export async function getDependencyStats(ventureId: string) {
  const { data: dependencies } = await supabase
    .from('dependencies')
    .select('*')
    .eq('venture_id', ventureId);

  if (!dependencies) return null;

  const total = dependencies.length;
  const outdated = dependencies.filter((d) => d.status === 'outdated').length;
  const vulnerable = dependencies.filter((d) => d.status === 'vulnerable').length;
  const active = dependencies.filter((d) => d.status === 'active').length;

  const byType = dependencies.reduce((acc, d) => {
    acc[d.type] = (acc[d.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total,
    outdated,
    vulnerable,
    active,
    byType,
  };
}

export async function importFromPackageJSON(ventureId: string, packageJSON: any) {
  const dependencies = [
    ...Object.entries(packageJSON.dependencies || {}).map(([name, version]) => ({
      venture_id: ventureId,
      package_name: name,
      version: String(version).replace(/^[\^~]/, ''),
      type: 'npm' as const,
      status: 'active' as const,
    })),
    ...Object.entries(packageJSON.devDependencies || {}).map(([name, version]) => ({
      venture_id: ventureId,
      package_name: name,
      version: String(version).replace(/^[\^~]/, ''),
      type: 'npm' as const,
      status: 'active' as const,
      metadata: { dev: true },
    })),
  ];

  const { data, error } = await supabase.from('dependencies').insert(dependencies).select();

  if (error) throw error;
  return data;
}

export function generateDependencyReport(dependencies: Dependency[]): string {
  let report = 'Dependency Report\n';
  report += '==================\n\n';
  report += `Generated: ${new Date().toISOString()}\n`;
  report += `Total Dependencies: ${dependencies.length}\n\n`;

  const byStatus = dependencies.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  report += 'Status Summary:\n';
  for (const [status, count] of Object.entries(byStatus)) {
    report += `  ${status}: ${count}\n`;
  }
  report += '\n';

  const outdated = dependencies.filter((d) => d.status === 'outdated');
  if (outdated.length > 0) {
    report += 'Outdated Dependencies:\n';
    for (const dep of outdated) {
      report += `  - ${dep.package_name}@${dep.version} → ${dep.update_available}\n`;
    }
    report += '\n';
  }

  const vulnerable = dependencies.filter((d) => d.status === 'vulnerable');
  if (vulnerable.length > 0) {
    report += 'Vulnerable Dependencies:\n';
    for (const dep of vulnerable) {
      report += `  - ${dep.package_name}@${dep.version}\n`;
    }
  }

  return report;
}
