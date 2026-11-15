export interface WorkspacePreferences {
  mentions: boolean
  digest: boolean
  digestFrequency: string
  previewGap: number
  checklist: { profile: boolean; team: boolean; settings: boolean }
}

export function createWorkspacePreferences(): WorkspacePreferences {
  return {
    mentions: true,
    digest: true,
    digestFrequency: 'weekly',
    previewGap: 16,
    checklist: { profile: true, team: false, settings: false },
  }
}
