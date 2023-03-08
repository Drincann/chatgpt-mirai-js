import { get_encoding } from "@dqbd/tiktoken"
import { ChatCompletionRequestMessage } from "openai"

const enc = get_encoding('cl100k_base')
export const countToken = (messages: ChatCompletionRequestMessage[]): number => messages.reduce((acc, cur) => acc + enc.encode(cur.content).length, 0)
