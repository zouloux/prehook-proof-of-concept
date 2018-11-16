# prehook-proof-of-concept
This is a proof of concept of a [React Hooks](https://reactjs.org/docs/hooks-reference.html) like implementation for [Preact](https://preactjs.com/).

## Important !
This is an early Proof of concept for a Hook implementation, *a bit different than the React approach*.
I'm still working on it to have better examples.

### Goal and motivation
This is for [Preact](https://preactjs.com/) and the goal is to maintain minimal output size, with maximal code flexibility and execution performaces.
I'm not 100% OK with the React Hooks proposal. To much hooks declared inside each render could, I think, lead to performances issues. These performaces issues could not exists with the Class system, so this is a drawback to avoid.
Also, the "don't use hooks in conditions" is an issue to me, because it shows that there is to much auto-magic stuff going on under the hood. Which is not aviced when you dive in a new lib. People need to understands how it works so it's not frustrating. Also, to me, linters should not be mandatory to use a lib.
For now the POC is *2KB not GZip* added to the Preact core with `useState`, `useEffect` and better `useRef`.
This example is *14KB not GZip* with Preact + Prehook + working example.

### Differences
1. Components are still pure functions, but they have to phases.
2. Components are not re-executed entierly at each render, they return a render function.
3. Hooks are initialized only at component build time for better performances.
4. Hooks can be inside conditions as long they are inside component's factory phase.
5. `useState` have a slightly different API. With more functional approach.
6. Ref's are more usable with solo refs and multi-refs.

### Future
This is built on typescript for now and will be pre-compiled for npm when (if) ready.

I know that Preact's author is working on a [Hooks implementation](https://twitter.com/_developit/status/1057426596779450368).
I also know that Preact goal is to mimic React API's so there is no much chances that is POC is used at anytime by anybody, this is just a proposal :)

Thanks !

### Curious ?

If you just want to check implementation with installing :
Example :
- [App.tsx](https://github.com/solid-js/prehook-proof-of-concept/blob/master/src/App.tsx)
- [HookedComponent.tsx](https://github.com/solid-js/prehook-proof-of-concept/blob/master/src/HookedComponent.tsx)

The lib :
- [prehook.ts](https://github.com/solid-js/prehook-proof-of-concept/blob/master/lib/prehook/prehook.ts)
- [useRef.ts](https://github.com/solid-js/prehook-proof-of-concept/blob/master/lib/prehook/useRef.ts)



## Installation

- `npm i`

### Dev mode
Will watch files and check Typescript definitions.
- `node solid` or `npm run dev`

### Build for production
- `node solid production` or `npm run build`
