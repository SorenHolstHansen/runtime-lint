# object-stats

See how your objects are used throughout your codes execution.

## What is object-stats

Add a simple (non-intrusive) wrapper around any object and gather statistics throughout the execution of your program, about how the object has been used.

An example might help
```js
function main() {
  const a = objectStats({
    foo: {
      bar: "baz"
    }
  });

  a.foo.bar;
  a.nonExisting;

  console.log(a.__stats);
  /** 
  {
    foo: {
      count: 1, 
      inner: {
        bar: {
          count: 1
        }
      }
    },
    nonExisting: {
      count: 1
    }
  }
  */
}
```
