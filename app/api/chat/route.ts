import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { google } from '@ai-sdk/google'
import { SOFTBOT_SYSTEM_PROMPT } from '@/lib/softbot-prompt'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: SOFTBOT_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
