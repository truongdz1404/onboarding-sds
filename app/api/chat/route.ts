import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { SOFTBOT_SYSTEM_PROMPT } from '@/lib/softbot-prompt'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: 'anthropic/claude-sonnet-4.6',
    system: SOFTBOT_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
