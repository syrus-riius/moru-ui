import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

/** Register the same local web fonts inside the isolated Expo web document. */
export async function installPreviewFonts({ root, outputDirectory }) {
  const fontDirectory = path.join(outputDirectory, 'fonts')
  await mkdir(fontDirectory, { recursive: true })
  const sources = [
    { name: 'pretendard', css: 'pretendard/dist/web/variable/pretendardvariable.css', license: 'pretendard/dist/LICENSE.txt' },
    { name: 'noto-sans', css: '@fontsource-variable/noto-sans/index.css', license: '@fontsource-variable/noto-sans/LICENSE' },
    { name: 'noto-sans-kr', css: '@fontsource-variable/noto-sans-kr/index.css', license: '@fontsource-variable/noto-sans-kr/LICENSE' },
  ]
  const styles = []
  for (const source of sources) {
    const sourcePath = path.join(root, 'node_modules', source.css)
    const css = await readFile(sourcePath, 'utf8')
    const matches = [...css.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)]
    let rewritten = css
    for (const match of matches) {
      const fileName = `${source.name}-${path.basename(match[1])}`
      await copyFile(path.resolve(path.dirname(sourcePath), match[1]), path.join(fontDirectory, fileName))
      rewritten = rewritten.replace(match[0], `url('./fonts/${fileName}')`)
    }
    styles.push(rewritten)
    await copyFile(path.join(root, 'node_modules', source.license), path.join(fontDirectory, `${source.name}-LICENSE.txt`))
  }
  await writeFile(path.join(outputDirectory, 'fonts.css'), styles.join('\n'))
  const indexPath = path.join(outputDirectory, 'index.html')
  const index = await readFile(indexPath, 'utf8')
  await writeFile(indexPath, index.replace('</head>', '<link rel="stylesheet" href="/native-preview/fonts.css" /></head>'))
}
