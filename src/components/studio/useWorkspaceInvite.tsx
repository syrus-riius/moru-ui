import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useI18n } from '../../i18n'
import { Button } from '../ui/button'
import { Field } from '../ui/field'
import { Input } from '../ui/input'
import { Modal } from '../ui/modal'
import { useToast } from '../ui/toast'
import { useWorkspaceMembers } from '../workspace-example/WorkspaceMembersContext'

type InviteTarget = 'preview' | 'workspace'

/** The invite form shared by the gallery preview and the workspace example. */
export function useWorkspaceInvite(onNotice: (title: string) => void) {
  const { t } = useI18n()
  const { toast } = useToast()
  const { members, dispatch } = useWorkspaceMembers()
  const [open, setOpen] = useState(false)
  const [target, setTarget] = useState<InviteTarget>('preview')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  function openInvite(next: InviteTarget = 'preview') {
    setTarget(next)
    setEmail('')
    setError('')
    setOpen(true)
  }
  function invite() {
    const address = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setError('올바른 이메일 주소를 입력해 주세요.')
      return
    }
    if (target === 'workspace') {
      if (
        members.some((member) => member.email.toLocaleLowerCase() === address.toLocaleLowerCase())
      ) {
        setError('이미 명단에 있는 이메일 주소예요.')
        return
      }
      dispatch({
        type: 'add',
        member: {
          id: crypto.randomUUID(),
          name: address.split('@')[0],
          email: address,
          title: t('새 팀원'),
          role: 'member',
          status: 'invited',
        },
      })
      toast({
        title: t('팀원 명단에 추가했어요.'),
        description: t('{v0} · 초대 대기', { v0: address }),
        tone: 'success',
      })
    } else onNotice(t('{v0} 초대 미리보기를 완료했어요.', { v0: address }))
    setOpen(false)
    setError('')
  }
  const dialog = (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title={t('함께할 팀원 초대')}
      description={
        target === 'workspace'
          ? t('예제 명단에 초대 대기 상태로 추가합니다. 실제 이메일은 발송되지 않아요.')
          : t('초대 폼의 동작을 확인하는 예제입니다. 실제 이메일은 발송되지 않아요.')
      }
      footer={
        <>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t('취소')}
          </Button>
          <Button onClick={invite}>
            {target === 'workspace' ? t('명단에 추가') : t('초대 미리보기')}{' '}
            <ArrowRight size={14} />
          </Button>
        </>
      }
    >
      <Field label={t('이메일 주소')} error={t(error)}>
        <Input
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            setError('')
          }}
          placeholder="colleague@studio.com"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.preventDefault()
              invite()
            }
          }}
        />
      </Field>
    </Modal>
  )
  return { open, close: () => setOpen(false), openInvite, dialog }
}
