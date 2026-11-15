import { useI18n } from '../../i18n'
import { DocumentationCodeBlock } from './DocumentationCodeBlock'
import type { ComponentDocument, ComponentProp } from './component-document'

function PropTable({ props, label }: { props: ComponentProp[]; label: string }) {
  const { t } = useI18n()
  return (
    <table className="moru-component-doc__props" aria-label={label}>
      <thead>
        <tr>
          <th scope="col">Prop</th>
          <th scope="col">{t('타입 · 기본값')}</th>
          <th scope="col">{t('설명')}</th>
        </tr>
      </thead>
      <tbody>
        {props.map((prop, index) => (
          <tr key={`${prop.owner}-${prop.name}-${index}`}>
            <th scope="row">
              <code>{prop.name}</code>
              <small>{prop.owner}</small>
              {prop.required ? <small>{t('필수')}</small> : null}
            </th>
            <td>
              <code>{prop.type}</code>
              {prop.defaultValue !== undefined ? (
                <small>
                  {t('기본값')} <code>{prop.defaultValue}</code>
                </small>
              ) : null}
            </td>
            <td data-empty={!prop.description || undefined}>{prop.description || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function ComponentApiReference({
  document,
  name,
}: {
  document: ComponentDocument
  name: string
}) {
  const { t } = useI18n()
  const props = document.props.filter((prop) => prop.owner.endsWith('Props'))
  const supporting = document.props.filter((prop) => !prop.owner.endsWith('Props'))
  return (
    <>
      <p>
        {t(
          '소스에 선언된 속성입니다. 상속한 속성과 보조 타입은 전체 타입 정의와 원본 소스에서 확인하세요.',
        )}
      </p>
      {props.length ? (
        <PropTable props={props} label={t('{name} 속성', { name })} />
      ) : (
        <p>{t('이 컴포넌트의 전체 API는 아래 타입 정의에서 확인할 수 있습니다.')}</p>
      )}
      {supporting.length ? (
        <details className="moru-component-doc__details">
          <summary>{t('보조 타입 속성')}</summary>
          <PropTable props={supporting} label={t('보조 타입 속성')} />
        </details>
      ) : null}
      {document.defaults.length ? (
        <details className="moru-component-doc__details">
          <summary>{t('명시된 기본값')}</summary>
          <dl className="moru-component-doc__defaults">
            {document.defaults.map((entry, index) => (
              <div key={`${entry.component}-${entry.prop}-${index}`}>
                <dt>
                  <code>
                    {entry.component}.{entry.prop}
                  </code>
                </dt>
                <dd>
                  <code>{entry.value}</code>
                </dd>
              </div>
            ))}
          </dl>
        </details>
      ) : null}
      <details className="moru-component-doc__details">
        <summary>{t('전체 타입 정의')}</summary>
        <DocumentationCodeBlock
          value={document.api}
          filename={`${document.id}.types.ts`}
          language="typescript"
          defaultWrap
        />
      </details>
      <p>
        <a href={document.sourceUrl} target="_blank" rel="noreferrer">
          {t('원본 소스 보기')}
        </a>
      </p>
    </>
  )
}
