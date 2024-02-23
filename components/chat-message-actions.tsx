'use client'

import { type Message } from 'ai'

import { Button } from '@/components/ui/button'
import { IconCheck, IconCopy, SpeakerIcon } from '@/components/ui/icons'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { cn } from '@/lib/utils'

interface ChatMessageActionsProps extends React.ComponentProps<'div'> {
  message: Message
}
const speechSynthesis = window.speechSynthesis
export function textToSpeech(message: string | undefined) {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    const utterance = new SpeechSynthesisUtterance(message)
    window.speechSynthesis.speak(utterance)
  } else {
    console.error('Speech synthesis is not available in this environment.')
  }
}

export function ChatMessageActions({
  message,
  className,
  ...props
}: ChatMessageActionsProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  // Import the Web Speech API

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(message.content)
  }

  const onTextToSpeech = () => {
    // Trigger TTS for the message content
    textToSpeech(message.content)
  }

  return (
    <div
      className={cn(
        'flex items-center justify-end transition-opacity group-hover:opacity-100 md:absolute md:-right-10 md:-top-2 md:opacity-0',
        className
      )}
      {...props}
    >
      <Button variant="ghost" size="icon" onClick={onCopy}>
        {isCopied ? <IconCheck /> : <IconCopy />}
        <span className="sr-only">Copy message</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={onTextToSpeech}>
        <SpeakerIcon /> {/* Replace with your speaker icon */}
        <span className="sr-only">Text to Speech</span>
      </Button>
    </div>
  )
}
