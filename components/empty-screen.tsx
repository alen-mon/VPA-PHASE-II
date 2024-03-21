import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

const exampleMessages = [
  {
    heading: 'Get me the weather of [city]',
    message: `Get me the weather of Coimbatore`
  },
  {
    heading: 'login to my email id [email] password is [password]',
    message: `login to my email id  password is \n`
  },
  {
    heading: 'Send a mail to [email] with the body [message]',
    message: `Send a mail to with the body `
  },
  {
    heading: 'Prepare me a schedule ',
    message: 'Summarize my things to do and schedule my day \n'
  },
  {
    heading: 'Motivate me ',
    message: `Motivate me by telling me a motivational quote for the day \n`
  },
  {
    heading:
      'Development Test - Send Mail to alenmon2002@gmail.com with the body "Hello" ',
    message: `send mail to alenmon2002@gmail.com with the body Hello \n`
  },
  {
    heading: 'Development Test-Login to spotify',
    message: `login spotify\n`
  },
  {
    heading: 'Development Test-Authenticate Email',
    message: `login to my email id alenmon2002@gmail.com password is klgcdbxrdfpksuxd\n`
  }
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          👋 Hiya User , I'm VPA and Iam here to help you
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          Your Personal Assistant here Built with{' '}
          <ExternalLink href="https://nextjs.org">Next.js</ExternalLink> and
          powered by{' '}
          <ExternalLink href="https://openai.com/research">
            Open AI
          </ExternalLink>
          .
        </p>
        <p className="leading-normal text-muted-foreground">
          Feel free to talk to me about anything or try the following examples:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
