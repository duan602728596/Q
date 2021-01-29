# @bbkkbkk/q

Q is a function toolkit.

## How to use

```javascript
import { Queue, Onion } from '@bbkkbkk/q';
```

or

```html
<script src="Q.js"></script>
<script>
  var { Queue, Onion } = Q;  
</script>
```

## API

### Queue

Queue can limit the number of functions executed simultaneously.

```javascript
const queue = new Queue({ workerLen: 3 });

queue.use(
  [runFunc, this, arg0, arg1],
  [runFunc, this, arg2, arg3],
  [runFunc, undefined, arg4, arg5],
  [runFunc, undefined, arg6, arg7],
  // ......
);
queue.run();

// Add new tasks during execution
queue.use([newRunFunc, undefined, arg8]);
queue.run();
```

* workerLen: The number of functions executed simultaneously. The default is 3.
* queue.use: The parameters are the executed function, this, and the parameters passed by the function in order.
* queue.run: Start execution queue.

### Onion

Onion provides the function execution method of the onion model, just like Koa.

```javascript
const onion = new Onion({ middle: middleFunc }); // or onion.middle(middleFunc)

onion.use(async function(ctx, next) {
  // ...
  await next();
  // ...
});

onion.use(async function(ctx, next) {
  // ...
  await next();
  // ...
}, async function(ctx, next) {
  // ...
  await next();
  // ...
});

onion.run({ key: value });
```

* middle: The function to execute when the middleware is executed in the middle. The default is an empty function.   
  You can also use `onion.middle` to set.
  ```javascript
  function middleFunc(ctx) {
    // Because it is in the middle, there is no next
  }
  ```
* onion.use: Add multiple middleware functions.
* onion.run: To start execution, you can pass the initial ctx.
* onion.middle: Set the function when the middleware executes to the middle.