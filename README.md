# runtime-lint

A runtime "linter" for your js application.

## What is runtime-lint

runtime-lint is a simple way to look for bad patterns in your applications at runtime. It is mostly tailored towards browser apps, but should work outside the browser as well. It can detect 
- **overfetching**: See what parts of your json response actually ends up on the web page, and what is never used.
- **queries in loops**: Detects e.g. fetching for each row in a table. 
  - This is a best effort attempt, as, for instance, detecting whether two endpoints point to the same kind of resource, but with different ids can be difficult (i.e. /users/1, /users/2 are clearly asking for the same kind of resource, but for other cases it can be almost impossible to find).
- **cache opportunities**: for instance when lots of the same calls are being made continuously with the exact same response, it might indicate a refetch policy that is too aggressive, or that a cache (or better use of one) could reduce the amount of calls.
- More to come...

It is very simply to add to any project
```bash
npm i runtime-lint
```

```js
runtimeLint({
  // Your preferred rules here.
  // e.g. overFetching:
  overFetching: {
    cb: (url) => console.log("Oh no! I am overfetching way too much!")
  }
})
```

## Rules

Rules are opt-in, meaning that if you specify no rules, then runtime-lint is effectively disabled. 

We do this because, while we strive to make the rules as light-weight as possible, they will always add more overhead than if they were disabled, although no benchmarks have currently been run. Hence we also recommend to not enable runtimeLint in prod, or at least to only enable it a percentage of the time (i.e. basically an AB testing approach).

All rules can be specified in a number of way, say for the overFetching rule, either of the following are allowed
```js
runtimeLint({
  // To turn a rule off, either remove the field, or do either of the following
  overFetching: "off",
  overFetching: null,
  overFetching: undefined,
  // To turn it on, and use the default config, do
  overFetching: "on",
  // To specify your own config, do the following.
  // If you don't specify all the config fields, the defaults will be used
  overFetching: {
    ...
  }
})
```

### overFetching

The overFetching rules tries to detect when json responses from a fetch call has been under-utilized. This could suggest over fetching. At the moment, the rule reports underuse if less than half the top-level keys of a response has been used.

| field     | type                                                                                                  | description                                                                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| cb        | `(url: string) => void`                                                                               | Callback to run whenever we detect a json response has been underused, which could suggest overfetching. The url called is given as a parameter |
| heuristic | `(jsonResponseWithStats: ObjectWithStats<any[]> \| ObjectWithStats<Record<string, any>>) => boolean`* | Heuristic to apply to a json response after a certian time to determine if it has been underused or not. Return true if it is underused         |

`ObjectWithStats<T>` is a wrapper around an object that on each field gives the count of how many times it has been accessed, plus an `inner` field that enabled you to traverse the object.

Say, for the object
```js
let a = {
  foo: {
    bar: "baz"
  }
}
```
Then an object of type `ObjectWithStats<typeof a>` will look like this
```js
{
  foo: {
    count: 2,
    inner: {
      bar: {
        count: 1
      }
    }
  }
}
```

### queryInLoop

The queryInLoop rule tries to detect when similar urls are called in a loop, e.g. /user/1, /user/2, /user/3 and so on. This might suggest that a fetch-call is made in a loop, e.g. for each row in a table or similar. This is a best-effort approach, since detecting when two url's are "similar" enough can be difficult.

| field      | type                       | description                                                                                            |
| ---------- | -------------------------- | ------------------------------------------------------------------------------------------------------ |
| cb         | `(urls: string[]) => void` | Callback to run when we detect that queries might be running in a loop. Defaults to a console.warn log |
| threshold  | `number`                   | The amount of similar urls to see before calling the onQueriesInLoopsDetected. Default to 3            |
| debounceMs | `number`                   | The milliseconds to debounce the callback in between queries in loops                                  |

### duplicateResponses

The duplicateResponses rules tries to detect when the same url has been called two times or more with the exact same response. This might suggest a bad caching solution or a refetch policy that is too aggressive.

| field | type                    | description                                                                                                                     |
| ----- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| cb    | `(url: string) => void` | Callback to run when we detect multiple calls to the same endpoint with the exact same response. Defaults to a console.warn log |
