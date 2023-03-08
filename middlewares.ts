import pkg from "mirai-js";
import { ChatContext, createChatContext } from "./lib/index.js"
import { EventEntityMap } from "mirai-js/dist/node/BaseType";
const { Middleware, Message } = pkg;

export const friendChat = ({ init, secret, before }: {
  init?: string,
  secret: string,
  before?: (ctx: EventEntityMap['FriendMessage'] & { chatContext?: ChatContext, text: string }, next: () => Promise<unknown>) => Promise<void> | void
}) => {
  const threads: Record<number, ChatContext> = {}
  return new Middleware<EventEntityMap['FriendMessage'] & { chatContext?: ChatContext }>()
    .textProcessor()
    .use(async (ctx, next) => {
      if (threads[ctx.sender.id] === undefined) {
        threads[ctx.sender.id] = createChatContext({
          secret,
          model: 'gpt-3.5-turbo',
          messages: typeof init === 'string' ? [{ role: 'assistant', content: init }] : undefined,
        })
      }
      ctx.chatContext = threads[ctx.sender.id]
      await next()
    })
    .use(async (ctx, next) => {
      if (ctx.chatContext === undefined) return
      await before?.(ctx, next)
    })
    .use(async (ctx, next) => {
      if (ctx.chatContext === undefined) return
      let res: string = '';
      try {
        res = await ctx.chatContext.send({ role: 'user', content: ctx.text })
      } catch (e) {
        let log = `[ERROR] ${(e as any)?.response?.status} ${JSON.stringify((e as any)?.response?.data)}`;
        console.log(log)
        return ctx.bot.sendMessage({
          friend: ctx.sender.id,
          message: new Message().addText(log),
        })
      }
      await ctx.bot.sendMessage({
        friend: ctx.sender.id,
        message: new Message().addText(res),
      })
      await next();
    })
}
