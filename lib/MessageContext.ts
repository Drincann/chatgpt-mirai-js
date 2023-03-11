import { ChatCompletionRequestMessage } from "openai"
import lodash from 'lodash'
const { cloneDeep } = lodash
import { countToken, countTokenWithSingleMessage, MESSAGES_BASE_TOKEN_NUM } from "../helper/countToken.js"
export class MassageContext {

  private tokenLength = 0
  constructor(private messages: ChatCompletionRequestMessage[], private maxToken: number = 4096) {
    this.messages = messages
    this.maxToken = maxToken
    this.tokenLength = countToken(messages)
  }

  public getMessagesClone() {
    return cloneDeep(this.messages)
  }

  public setMaxToken(maxToken: number) {
    this.maxToken = maxToken
    this.fitLength()
  }

  public push(msg: ChatCompletionRequestMessage) {
    this.tokenLength += countTokenWithSingleMessage(msg)
    this.messages.push(msg)
    this.fitLength()
    return this.messages.length
  }

  private fitLength() {
    while (this.messages.length > 0 && this.tokenLength > this.maxToken) {
      const msg = this.messages.shift()
      if (msg) this.tokenLength -= countTokenWithSingleMessage(msg)
    }
  }

  public reset() {
    this.messages = []
    this.tokenLength = MESSAGES_BASE_TOKEN_NUM
  }
}