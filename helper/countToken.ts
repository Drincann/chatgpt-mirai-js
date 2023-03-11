import { get_encoding } from "@dqbd/tiktoken"
import { ChatCompletionRequestMessage } from "openai"

export const MESSAGES_BASE_TOKEN_NUM = 2, EVERY_MESSAGE_BASE_TOKEN_NUM = 4;

const enc = get_encoding('cl100k_base')
export const countTokenWithSingleMessage = (msg: ChatCompletionRequestMessage): number =>
  enc.encode(msg.content).length
  + enc.encode(msg.role).length
  + (msg.name ? enc.encode(msg.name).length - 1 : 0)
  + EVERY_MESSAGE_BASE_TOKEN_NUM

export const countToken = (messages: ChatCompletionRequestMessage[]): number =>
  messages.reduce(
    (acc, cur) =>
      acc
      + enc.encode(cur.content).length
      + enc.encode(cur.role).length
      + (cur.name ? enc.encode(cur.name).length - 1 : 0)
      + EVERY_MESSAGE_BASE_TOKEN_NUM,
    MESSAGES_BASE_TOKEN_NUM
  )
