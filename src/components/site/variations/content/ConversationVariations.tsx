import { useState } from 'react'
import { useI18n } from '../../../../i18n'
import type { ComponentId } from '../../../catalog/component-catalog'
import { Avatar } from '../../../ui/avatar'
import { Badge } from '../../../ui/badge'
import {
  Bubble,
  BubbleContent,
  BubbleFooter,
  BubbleGroup,
  BubbleReactions,
} from '../../../ui/bubble'
import { Button } from '../../../ui/button'
import { CodeBlock } from '../../../ui/code-block'
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from '../../../ui/message'
import { MessageScroller, MessageScrollerItem } from '../../../ui/message-scroller'
import { Spinner } from '../../../ui/spinner'
import { Trace, type TraceStatus } from '../../../ui/trace'
import { VariationExample, VariationGroup, sizes } from '../VariationLayout'

const sampleCode = `import { Button } from 'moru-ui'\n\nexport function SaveButton() {\n  return <Button>Save</Button>\n}`

export function ConversationVariations({ id }: { id: ComponentId }) {
  const { t } = useI18n()
  switch (id) {
    case 'bubble':
      return (
        <>
          <VariationGroup title="베리에이션" wide>
            {(['default', 'secondary', 'outline'] as const).map((variant) => (
              <VariationExample key={variant} label={variant} code={`variant="${variant}"`}>
                <Bubble variant={variant}>
                  <BubbleContent>{t('새로운 홈 화면, 직접 눌러 보니 어때요?')}</BubbleContent>
                  <BubbleFooter>09:41</BubbleFooter>
                </Bubble>
              </VariationExample>
            ))}
          </VariationGroup>
          <VariationGroup title="방향" wide>
            {(['start', 'end'] as const).map((align) => (
              <VariationExample key={align} label={align} code={`align="${align}"`}>
                <BubbleGroup>
                  <Bubble align={align}>
                    <BubbleContent>{t('디자인 토큰을 적용했어요.')}</BubbleContent>
                  </Bubble>
                </BubbleGroup>
              </VariationExample>
            ))}
            <VariationExample
              label="반응"
              code="<BubbleReactions><Button aria-pressed … /></BubbleReactions>"
            >
              <ReactionBubble />
            </VariationExample>
          </VariationGroup>
        </>
      )
    case 'code-block':
      return (
        <>
          <VariationGroup title="크기 비교" wide>
            {sizes.map((size) => (
              <VariationExample
                key={size}
                label={size.toUpperCase()}
                code={`size="${size}" language="tsx"`}
                wide
              >
                <CodeBlock
                  size={size}
                  value={sampleCode}
                  language="tsx"
                  filename="save-button.tsx"
                />
              </VariationExample>
            ))}
          </VariationGroup>
          <VariationGroup title="베리에이션" wide>
            <VariationExample label="줄 번호" code="lineNumbers highlightLines={[4]}" wide>
              <CodeBlock value={sampleCode} language="tsx" lineNumbers highlightLines={[4]} />
            </VariationExample>
            <VariationExample label="줄바꿈" code="defaultWrap" wide>
              <CodeBlock
                value={
                  '<Button variant="secondary" size="lg" aria-label="Save your project settings">Save your project settings</Button>'
                }
                language="tsx"
                defaultWrap
              />
            </VariationExample>
            <VariationExample label="비활성" code="disabled">
              <CodeBlock value="npm install moru-ui" language="bash" disabled />
            </VariationExample>
            <VariationExample label="복사 없음" code="copyable={false}">
              <CodeBlock value="npm install moru-ui" language="bash" copyable={false} />
            </VariationExample>
          </VariationGroup>
        </>
      )
    case 'message':
      return (
        <VariationGroup title="베리에이션" wide>
          {(['start', 'end'] as const).map((align) => (
            <VariationExample key={align} label={align} code={`align="${align}"`}>
              <ExampleMessage align={align} />
            </VariationExample>
          ))}
          <VariationExample
            label="로딩"
            code="<MessageContent><Spinner decorative />…</MessageContent>"
          >
            <Message>
              <MessageAvatar>
                <Avatar alt="Moru" size="sm" />
              </MessageAvatar>
              <MessageContent>
                <MessageHeader>Moru</MessageHeader>
                <Spinner variant="dots" decorative />
                <MessageFooter>{t('작성 중')}</MessageFooter>
              </MessageContent>
            </Message>
          </VariationExample>
          <VariationExample
            label="오류"
            code={'<MessageFooter><Badge tone="danger">…</Badge></MessageFooter>'}
          >
            <ExampleMessage failed />
          </VariationExample>
        </VariationGroup>
      )
    case 'message-scroller':
      return (
        <>
          <VariationGroup title="크기 비교" wide>
            {[180, 280, 360].map((height) => (
              <VariationExample
                key={height}
                label={`${height}px`}
                code={`height={${height}} initialPosition="start" aria-live="off"`}
              >
                <ScrollerExample height={height} />
              </VariationExample>
            ))}
          </VariationGroup>
          <VariationGroup title="베리에이션" wide>
            <VariationExample
              label="최신 메시지로"
              code={'initialPosition="end" followOutput aria-live="off"'}
            >
              <ScrollerExample initialPosition="end" />
            </VariationExample>
            <VariationExample label="자동 이동 없음" code={'followOutput={false} aria-live="off"'}>
              <ScrollerExample followOutput={false} />
            </VariationExample>
            <VariationExample
              label="비활성"
              code={'disabled initialPosition="start" aria-live="off"'}
            >
              <ScrollerExample disabled />
            </VariationExample>
          </VariationGroup>
        </>
      )
    case 'trace':
      return (
        <>
          <VariationGroup title="상태 비교" wide>
            {(['pending', 'running', 'complete', 'error'] as const).map((status) => (
              <VariationExample
                key={status}
                label={status}
                code={`items={[{ id, title, status: "${status}", … }]}`}
              >
                <TraceExample status={status} />
              </VariationExample>
            ))}
          </VariationGroup>
          <VariationGroup title="베리에이션" wide>
            <VariationExample label="열림" code={'defaultExpanded={["tokens"]}'}>
              <TraceExample status="complete" expanded />
            </VariationExample>
            <VariationExample label="비활성" code="disabled">
              <TraceExample status="complete" disabled />
            </VariationExample>
          </VariationGroup>
        </>
      )
    default:
      return null
  }
}

function ReactionBubble() {
  const { t } = useI18n()
  const [liked, setLiked] = useState(false)
  return (
    <Bubble>
      <BubbleContent>{t('디자인 토큰을 적용했어요.')}</BubbleContent>
      <BubbleReactions>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t('좋아요')}
          aria-pressed={liked}
          onClick={() => setLiked(!liked)}
        >
          ♥ {liked ? 2 : 1}
        </Button>
      </BubbleReactions>
    </Bubble>
  )
}

function ExampleMessage({
  align = 'start',
  failed = false,
}: {
  align?: 'start' | 'end'
  failed?: boolean
}) {
  const { t } = useI18n()
  return (
    <Message align={align}>
      <MessageAvatar>
        <Avatar alt="Moru" size="sm" />
      </MessageAvatar>
      <MessageContent>
        <MessageHeader>
          <strong>Moru</strong>
          <time>09:41</time>
        </MessageHeader>
        <Bubble variant="secondary">
          <BubbleContent>{t('새로운 홈 화면, 직접 눌러 보니 어때요?')}</BubbleContent>
        </Bubble>
        <MessageFooter>
          {failed ? <Badge tone="danger">{t('전송 실패')}</Badge> : t('읽음')}
        </MessageFooter>
      </MessageContent>
    </Message>
  )
}

function ScrollerExample({
  height = 240,
  initialPosition = 'start',
  followOutput = true,
  disabled = false,
}: {
  height?: number
  initialPosition?: 'start' | 'end'
  followOutput?: boolean
  disabled?: boolean
}) {
  const { t } = useI18n()
  const [count, setCount] = useState(7)
  return (
    <>
      <MessageScroller
        height={height}
        initialPosition={initialPosition}
        followOutput={followOutput}
        disabled={disabled}
        aria-live="off"
      >
        {Array.from({ length: count }, (_, index) => (
          <MessageScrollerItem key={index} messageId={`message-${index}`}>
            <Bubble
              align={index % 2 ? 'end' : 'start'}
              variant={index % 2 ? 'secondary' : 'default'}
            >
              <BubbleContent>
                {t('메시지')} {index + 1}
              </BubbleContent>
            </Bubble>
          </MessageScrollerItem>
        ))}
      </MessageScroller>
      <Button size="sm" variant="secondary" onClick={() => setCount((value) => value + 1)}>
        {t('메시지 추가')}
      </Button>
    </>
  )
}

function TraceExample({
  status,
  expanded = false,
  disabled = false,
}: {
  status: TraceStatus
  expanded?: boolean
  disabled?: boolean
}) {
  const { t } = useI18n()
  return (
    <Trace
      disabled={disabled}
      defaultExpanded={expanded ? ['tokens'] : []}
      items={[
        {
          id: 'tokens',
          title: t('디자인 토큰'),
          status,
          durationMs: status === 'complete' ? 1280 : undefined,
          description: t('프로젝트 설정'),
          details: <code>{'{ "radius": 8 }'}</code>,
        },
      ]}
    />
  )
}
