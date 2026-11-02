export const nativePreviewPath = '/native-preview/'
export const nativePreviewVersion = 1
export type NativePreviewScreen = 'wallet' | 'tasks' | 'activity'
export type NativePreviewTabStyle = 'standard' | 'floating' | 'pill'
export type NativePreviewConfiguration = { screen: NativePreviewScreen; tabStyle: NativePreviewTabStyle; centerAction: boolean }
export type NativePreviewMessage =
  | { type: 'moru-native:ready'; version: 1 }
  | { type: 'moru-native:state'; version: 1; payload: NativePreviewConfiguration & { route?: string; componentIds?: string[] } }
  | { type: 'moru-native:mode'; version: 1; payload: { mode: 'light' | 'dark' } }

export function readNativePreviewMessage(value: unknown): NativePreviewMessage | null {
  if (!value || typeof value !== 'object') return null
  const data = value as Record<string, unknown>
  if (data.version !== nativePreviewVersion) return null
  if (data.type === 'moru-native:ready') return { type: data.type, version: 1 }
  if (data.type === 'moru-native:mode' && data.payload && typeof data.payload === 'object') {
    const mode = (data.payload as Record<string, unknown>).mode
    return mode === 'light' || mode === 'dark' ? { type: data.type, version: 1, payload: { mode } } : null
  }
  if (data.type !== 'moru-native:state' || !data.payload || typeof data.payload !== 'object') return null
  const payload = data.payload as Record<string, unknown>
  if (!['wallet', 'tasks', 'activity'].includes(String(payload.screen)) || !['standard', 'floating', 'pill'].includes(String(payload.tabStyle)) || typeof payload.centerAction !== 'boolean') return null
  const route = typeof payload.route === 'string' && payload.route.startsWith('/') && payload.route.length <= 256 ? payload.route : undefined
  const componentIds = Array.isArray(payload.componentIds) && payload.componentIds.length <= 64 && payload.componentIds.every((value) => typeof value === 'string' && /^[A-Za-z][A-Za-z0-9]{0,63}$/.test(value)) ? payload.componentIds as string[] : undefined
  return { type: data.type, version: 1, payload: { screen: payload.screen as NativePreviewScreen, tabStyle: payload.tabStyle as NativePreviewTabStyle, centerAction: payload.centerAction, ...(route ? { route } : {}), ...(componentIds ? { componentIds } : {}) } }
}

/** The public preview is served from this Site, so only that exact child may drive the lab. */
export function isNativePreviewSender(event: Pick<MessageEvent, 'origin' | 'source'>, expectedOrigin: string, frame: Window | null): boolean {
  return !!frame && event.origin === expectedOrigin && event.source === frame
}
