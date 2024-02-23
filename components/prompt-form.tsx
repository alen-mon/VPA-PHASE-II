import React, { useState } from 'react'
import Textarea from 'react-textarea-autosize'
import { UseChatHelpers } from 'ai/react'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  IconArrowElbow,
  IconMic,
  IconStop,
  IconSun
} from '@/components/ui/icons'
import { useRouter } from 'next/navigation'
import '../web-speech-api.d.ts'
import { toast } from 'react-hot-toast'

export interface PromptProps
  extends Pick<UseChatHelpers, 'input' | 'setInput'> {
  onSubmit: (value: string) => Promise<void>
  isLoading: boolean
}

export function PromptForm({
  onSubmit,
  input,
  setInput,
  isLoading
}: PromptProps) {
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  // State to manage speech recognition mode and tooltip state
  const [speechRecognitionActive, setSpeechRecognitionActive] =
    useState<boolean>(false)
  const [recognizedSpeech, setRecognizedSpeech] = useState('')
  const [tooltipMessage, setTooltipMessage] = useState('Start Voice Input')
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false)
  const [isTextToSpeechEnabled, setIsTextToSpeechEnabled] = useState(false)

  //Animation Definition
  const loadingAnimationStyle: React.CSSProperties = {
    position: 'absolute',
    right: '2.5rem', // Adjust the positioning as needed
    top: '50%',
    transform: 'translateY(-50%)'
    // Add other styles for your loading animation here
  }
  const showToastMessage = (message: string, options: string) => {
    if (options === 'success') {
      toast.success(message)
    } else if (options === 'error') {
      toast.error(message)
    } else if (options === 'info') {
      toast(message, {
        icon: '❕'
      })
    } else if (options === 'Speak') {
      toast(message, {
        icon: '🗣️'
      })
    }
  }
  const startSpeechRecognition = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        console.error('Speech recognition not supported')
        showToastMessage('Speech recognition not supported', 'error')
        return
      }

      let recognition = new SpeechRecognition()

      // Update the tooltip message
      setTooltipMessage('Listening...')

      recognition.onresult = event => {
        console.log(
          'Speech recognition result:',
          event.results[0][0].transcript
        )
        const recognizedText = event.results[0][0].transcript
        showToastMessage('You Spoke : ' + recognizedText, 'Speak')
        setRecognizedSpeech(event.results[0][0].transcript)
        // Setting Input Text with Speech variables
        speakText('You Spoke : ' + recognizedText)
        setInput(recognizedText)
      }

      recognition.onerror = event => {
        console.error('Speech recognition error:', event.error)
        showToastMessage('Speech recognition error', 'error')
        setTooltipMessage('Speech recognition error')
        speakText('Speech recognition error')
      }

      recognition.onend = () => {
        console.log('Speech recognition ended')
        setTooltipMessage('Start Voice Input') // Reset the tooltip message
        setSpeechRecognitionActive(false)
        showToastMessage('Speech recognition ended', 'info')
      }

      // Start the recognition
      recognition.start()
      setSpeechRecognitionActive(true)
      showToastMessage('Speech recognition started', 'info')
    }
  }

  const stopSpeechRecognition = () => {
    if (speechRecognitionActive) {
      // Stop your speech recognition method here

      // Update the state variables and tooltip message
      setSpeechRecognitionActive(false)
      setTooltipMessage('Start Voice Input')
      showToastMessage('Speech recognition stopped', 'info')
    }
  }
  const speakText = (text: string | undefined) => {
    if (window.speechSynthesis && isTextToSpeechEnabled) {
      const speech = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(speech)
    }
  }
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <form
      onSubmit={async e => {
        e.preventDefault()
        if (!input?.trim()) {
          return
        }
        setInput('')
        await onSubmit(input)
      }}
      ref={formRef}
    >
      <div className="relative flex flex-col w-full px-8 overflow-hidden max-h-60 grow bg-background sm:rounded-md sm:border sm:px-12">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={e => {
                e.preventDefault()
                if (speechRecognitionActive) {
                  stopSpeechRecognition()
                } else {
                  startSpeechRecognition()
                }
                router.refresh()
                router.push('/')
              }}
              className={cn(
                buttonVariants({ size: 'sm', variant: 'outline' }),
                'absolute left-0 top-4 size-8 rounded-full bg-background p-0 sm:left-4'
              )}
            >
              {speechRecognitionActive ? <IconStop /> : <IconMic />}
              <span className="sr-only">New Chat</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {speechRecognitionActive ? 'Stop Voice Input' : 'Start Voice Input'}
          </TooltipContent>
        </Tooltip>

        {/* Add loading animation based on showLoadingAnimation state */}
        {showLoadingAnimation && (
          <div style={loadingAnimationStyle}>
            {/* Add your loading animation component or code here */}
          </div>
        )}
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Send a message."
          spellCheck={false}
          className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
        />
        <div className="absolute right-0 top-4 sm:right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || input === ''}
                onClick={() => {
                  // Show the loading animation when the submit button is clicked
                  setShowLoadingAnimation(true)

                  // Perform your submit action
                  if (!isLoading && input.trim()) {
                    setInput('')
                    onSubmit(input).then(() => {
                      // Hide the loading animation after your action is complete
                      setShowLoadingAnimation(false)
                    })
                  }
                }}
              >
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="left-10 top-4 sm:right-1">
        <input
          type="checkbox"
          checked={isTextToSpeechEnabled}
          onChange={() => setIsTextToSpeechEnabled(!isTextToSpeechEnabled)}
        />
        <label>TTS</label>
      </div>
    </form>
  )
}
