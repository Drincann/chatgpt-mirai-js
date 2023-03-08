import config from './config.js'
import pkg from 'mirai-js'
const { Bot, Middleware, Message } = pkg
import { friendChat } from './middlewares.js'
import { EventEntityMap } from 'mirai-js/dist/node/BaseType.js'

void async function () {
  const bot = new Bot();
  await bot.open(config.miraiJSConfig)
  console.log('Bot started.')

  const dynamicWhite = new Set<number>(config.init.whiteList ?? [])
  bot.on('FriendMessage', new Middleware<EventEntityMap['FriendMessage']>()
    .textProcessor()
    .use(async (ctx, next) => {
      if (config.init.admin.includes(ctx.sender.id)) {
        const removeMatched = ctx.text.match(/^\/remove (\d+)/)
        if (removeMatched?.[1]) {
          dynamicWhite.delete(Number(removeMatched[1]))
          console.log(`[Info] Removed ${removeMatched[1]} from dynamic white list.`)
          ctx.bot.sendMessage({
            friend: ctx.sender.id,
            message: new Message()
              .addText(`已移除: ${removeMatched[1]}`)
              .addText(`当前白名单: ${JSON.stringify(Array.from(dynamicWhite))}`)
          })
          return
        }

        const addMatched = ctx.text.match(/^\/add (\d+)/)
        if (addMatched?.[1]) {
          dynamicWhite.add(Number(addMatched[1]))
          console.log(`[Info] Added ${addMatched[1]} to dynamic white list.`)
          ctx.bot.sendMessage({
            friend: ctx.sender.id,
            message: new Message()
              .addText(`已添加: ${addMatched[1]}`)
              .addText(`当前白名单: ${JSON.stringify(Array.from(dynamicWhite))}`)
          })
          return
        }
      }

      if (dynamicWhite.has(ctx.sender.id)) return next()
      if (ctx.sender.id !== 3070539027) return
    })
    .use<{ access: number }>(async (ctx, next) => {
      console.log(`[FriendMessage] ${ctx.sender.nickname}(${ctx.sender.id}): ${ctx.text}`)
      ctx.access = +new Date();
      next()
    })
    .use(friendChat({
      secret: config.openai.secret,
      before: async (ctx, next) => {
        if (config.init.admin.includes(ctx.sender.id)) {
          const resetMatched = ctx.text.match(/^\/reset (\d+)/)
          if (resetMatched?.[1]) {
            ctx.chatContext?.resetConversition()
            console.log(`[Info] reset ${resetMatched[1]} thread.`)
            ctx.bot.sendMessage({
              friend: ctx.sender.id,
              message: new Message()
                .addText('reset success')
            })
            return
          }
        }
        await next()
      }
    }))
    .done(
      ctx => console.log(`[FriendMessage] ${ctx.sender.nickname}(${ctx.sender.id}) -- ${+new Date() - (ctx.access as number)}ms`)
    )
  )
}()