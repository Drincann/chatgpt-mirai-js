# chatGPT-mirai-js

## config

```ts
export default {
  // openai config
  openai: {
    secret: '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',
    model: 'gpt-3.5-turbo'
  },
  /**
   * mirai-js config
   * @see https://drincann.github.io/Mirai-js/
    interface OpenOptions {
      baseUrl?: string;
      verifyKey?: string;
      qq?: number;
      singleMode?: boolean;
    }
   */
  miraiJSConfig: {
    baseUrl: 'http://localhost:8080',
    qq: 123456789,
    verifyKey: '123456789',
  },
  /**
   * whiteList: white list of qq allow gpt to talk with
   * admin: admin qq who can use admin command
   */
  init: {
    whiteList: [123456789],
    admin: [123456789]
  }
}
```

## build (optional)

```bash
npm i
npx tsc
```

## run

```bash
npm run start
```

## runtime config
- `^/add (\d+)` add qq to white list, example: `/add 123456789`
- `^/remove (\d+)` remove qq from white list, example: `/remove 123456789`
- `^/reset (\d+)` reset conversation, example: `/reset 123456789`
