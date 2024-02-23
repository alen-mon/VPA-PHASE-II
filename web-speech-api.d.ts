// web-speech-api.d.ts

// If available, use the standard Web Speech API
interface SpeechRecognition extends EventTarget {
  onend: () => void
  onerror: (event: any) => void
  onresult: (event: any) => void
  // Add properties and methods specific to SpeechRecognition
  // You can consult the Web Speech API documentation for the complete list
  // Example:
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  // ...
}
// web-speech-api.d.ts
interface Window {
  webkitSpeechRecognition?: SpeechRecognition
}

declare var SpeechRecognition: {
  // Add static properties or methods here
  new (): SpeechRecognition
  prototype: SpeechRecognition
}
