import { useI18n } from '../../i18n'
import { useId, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import {
  registryInstallCommand,
  registryInstallGroups,
  registryInstallItems,
  registryRelease,
  type RegistryInstallGroupId,
  type RegistryInstallItem,
} from '../../lib/registry-install'
import { DocumentationCodeBlock } from './DocumentationCodeBlock'

const normalizeSearch = (value: string) => value.toLocaleLowerCase().replace(/[\s-]+/g, '')

export function RegistryInstaller() {
  const { t } = useI18n()
  const searchId = useId()
  const searchRef = useRef<HTMLInputElement>(null)
  const [groupId, setGroupId] = useState<RegistryInstallGroupId>('actions')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<RegistryInstallItem>('button')
  const group = registryInstallGroups.find((entry) => entry.id === groupId)!
  const search = normalizeSearch(query.trim())
  const items = search
    ? registryInstallItems.filter((item) =>
        normalizeSearch(`${item.name} ${t(item.label)} ${item.keywords} ${t(item.label)}`).includes(
          search,
        ),
      )
    : group.items

  function chooseGroup(next: RegistryInstallGroupId) {
    const nextGroup = registryInstallGroups.find((entry) => entry.id === next)!
    setGroupId(next)
    setQuery('')
    if (!nextGroup.items.some((item) => item.name === selected))
      setSelected(nextGroup.items[0].name)
  }

  function chooseItem(next: RegistryInstallItem) {
    setSelected(next)
    const owner = registryInstallGroups.find((entry) =>
      entry.items.some((item) => item.name === next),
    )
    if (owner) setGroupId(owner.id)
  }

  return (
    <div className="registry-installer">
      <div className="registry-installer-search">
        <label htmlFor={searchId}>{t('컴포넌트 검색')}</label>
        <div className="registry-installer-search-control">
          <Search size={15} aria-hidden="true" />
          <input
            ref={searchRef}
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('예: 토스트, 차트, 날짜 범위')}
            autoComplete="off"
          />
          {query ? (
            <button
              type="button"
              className="getting-started-button getting-started-button-quiet"
              onClick={() => {
                setQuery('')
                searchRef.current?.focus()
              }}
            >
              {t('지우기')}
            </button>
          ) : null}
        </div>
      </div>
      <div className="registry-installer-groups" role="group" aria-label={t('설치 항목 카테고리')}>
        {registryInstallGroups.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className="getting-started-button getting-started-button-quiet"
            aria-pressed={!search && groupId === entry.id}
            onClick={() => chooseGroup(entry.id)}
          >
            {t(entry.label)}
            <span aria-hidden="true">{entry.items.length}</span>
          </button>
        ))}
      </div>
      <p className="registry-installer-count" role="status">
        {t('{group} · {count}개 / 전체 {total}개', {
          group: t(search ? '검색 결과' : group.label),
          count: items.length,
          total: registryInstallItems.length,
        })}
      </p>
      <div
        className="getting-started-registry-items"
        role="group"
        aria-label={
          search ? t('검색된 설치 항목') : t('{group} 설치 항목', { group: t(group.label) })
        }
      >
        {items.length ? (
          items.map((item) => (
            <button
              key={item.name}
              type="button"
              className="getting-started-button getting-started-button-quiet"
              aria-pressed={selected === item.name}
              onClick={() => chooseItem(item.name)}
            >
              {t(item.label)}
            </button>
          ))
        ) : (
          <p className="registry-installer-empty">
            {t('일치하는 항목이 없습니다. 다른 이름으로 검색해 보세요.')}
          </p>
        )}
      </div>
      <DocumentationCodeBlock
        key={selected}
        value={registryInstallCommand(selected)}
        filename={`${selected} · v${registryRelease}`}
        language="sh"
        size="sm"
      />
    </div>
  )
}
