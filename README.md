# prehook-proof-of-concept

This is a proof of concept of a React Hook like implementation for Preact.

## Important !

This is an early Proof of concept for a Hook implementation, a bit different than the React approach.
This is for Preact and the goal is to maintain minimal output size with maximal code flexibility and execution performaces.
For now the POC si 2KB not GZip added to the Preact core.

1. Components are still pure functions.
2. Components are not re-executed entierly at each render, they return a render function.
3. Hooks are initialized only at component build time for better performances.
4. Hooks can be inside conditions as long they are inside component's factory phase.
5. `useState` have a slightly different API. With more functional approach.
6. Ref's are more usable with solo refs and multi-refs.

This is built on typescript for now and will be pre-compiled for npm when (if) ready.

I know that Preact's author is working on a [Hooks implementation](https://twitter.com/_developit/status/1057426596779450368).
I also know that Preact goal is to mimic React API's so there is no much chances that is POC is used at anytime by anybody, this is just a proposal :)

Thanks !


## Installation

- `npm i`

### Dev mode
Will watch files and check Typescript definitions.
- `node solid` or `npm run dev`

### Build for production
- `node solid production` or `npm run build`
