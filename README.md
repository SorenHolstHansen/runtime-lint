# network-lint

A runtime linter for your network calls.

## What is network-lint

network-lint is a simple way to look for bad patterns in your network calls. It can detect 
- **overfetching**: See what parts of your json response actually ends up on the web page, and what is never used.
- **queries in loops**: like when you do a fetch for each row in a table. 
  - This is a best effort attempt, as, for instance, detecting whether two endpoints point to the same kind of resource, but with different ids can be difficult (i.e. /users/1, /users/2 are clearly asking for the same kind of resource, but for other cases it can be almost impossible to find).
- **cache opportunities**: for instance when lots of the same calls are being made continuously with the exact same response, it might indicate a refetch policy that is too aggressive, or that a cache (or better use of one) could reduce the amount of calls.

It is very simply to add to any website, by just
```js
// TODO
```
