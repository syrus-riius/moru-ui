// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
export type FileLike = Pick<File, 'name' | 'size' | 'type'>

/** Match the browser accept syntax, including extension-only files with an empty MIME type. */
export function acceptsFile(file: FileLike, accept = ''): boolean {
  const rules = accept.split(',').map((rule) => rule.trim().toLowerCase()).filter(Boolean)
  if (!rules.length) return true
  const filename = file.name.toLowerCase()
  const mime = file.type.toLowerCase()
  return rules.some((rule) => rule.startsWith('.') ? filename.endsWith(rule)
    : rule.endsWith('/*') ? mime.startsWith(rule.slice(0, -1))
    : mime === rule)
}

export function validateFiles(files: readonly FileLike[], options: { accept?: string; maxSize?: number; maxFiles?: number } = {}): string | null {
  const limit = options.maxFiles
  if (limit !== undefined && Number.isFinite(limit) && files.length > Math.max(1, Math.floor(limit))) return `파일은 최대 ${Math.max(1, Math.floor(limit))}개까지 선택할 수 있어요.`
  for (const file of files) {
    if (!acceptsFile(file, options.accept)) return `${file.name}: 허용된 파일 형식을 선택해 주세요.`
    if (options.maxSize !== undefined && Number.isFinite(options.maxSize) && options.maxSize >= 0 && file.size > options.maxSize) return `${file.name}: 파일 크기 제한을 초과했어요.`
  }
  return null
}
