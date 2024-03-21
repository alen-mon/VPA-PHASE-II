import React from 'react'

import { cn } from '@/lib/utils'
import { ExternalLink } from '@/components/external-link'
// Import Web Speech API types if needed

export function FooterText({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'px-2 text-center text-xs leading-normal text-muted-foreground',
        className
      )}
      {...props}
    >
      VPA SuperCharged with{' '}
      <ExternalLink href="https://platform.openai.com">
        Open AI assistants
      </ExternalLink>
      .
    </p>
  )
}
