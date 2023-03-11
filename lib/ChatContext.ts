import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai"
import { MassageContext } from "./MessageContext.js"

export interface ChatContext {
  send(msg: ChatCompletionRequestMessage, retry?: number, isRetry?: boolean): Promise<string>
  resetConversition(): Promise<void>
}

export interface CreateContextOptions {
  secret: string
  model?: string
  messages?: ChatCompletionRequestMessage[]
  maxToken?: number
}

export const createChatContext = ({
  secret, model, messages, maxToken = 4096,
}: CreateContextOptions): ChatContext => {
  const openai = new OpenAIApi(new Configuration({ apiKey: secret }));
  let msgContext = new MassageContext(messages ?? [], maxToken)
  return {
    async send(msg: ChatCompletionRequestMessage, retry: number = 2, isRetry: boolean = false): Promise<string> {
      try {
        if (!isRetry) msgContext.push(msg)
        const res = await openai.createChatCompletion({
          model: model ?? 'gpt-3.5-turbo',
          messages: msgContext.getMessagesClone(),
        })

        const { message } = res.data.choices[0]
        msgContext.push({ role: 'assistant', content: message?.content ?? '' })
        return message?.content ?? ''
      } catch (e) {
        if (retry > 0 && (e as any)?.response?.status === 429) {
          return this.send(msg, retry - 1, true)
        }
        throw e
      }
    },
    async resetConversition(): Promise<void> { msgContext.reset() }
  }
}