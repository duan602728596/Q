# @bbkkbkk/q

Q is a function toolkit.

## How to use

```javascript
import { Queue, Onion, Pipe } from '@bbkkbkk/q';
```

or

```html
<script src="Q.js"></script>
<script>
  var { Queue, Onion, Pipe } = Q;  
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

### Pipe

Pipe method implements a pipe flow.

```javascript
function project_0(state, callback) {
  // do something
  callback();
}

function project_1(state, callback) {
  // do something
  callback();
}

function project_dest(state) {
  // do something
}

await Pipe(initialState)
  .pipe(project_0)
  .pipe(project_1)
  .dest(project_dest);
```

* initialState: Initial data.
* pipe: Pass a function for pipeline.
* dest: Start processing through the pipeline. You can pass a method of final processing data or not.
  
```javascript
// Pipe.series and Pipe.parallel
const run = Pipe.series(
  project_0,
  project_1,
  Pipe.parallel(
    project_2_1,
    project_2_2,
    project_2_3
  ),
  Pipe.series(project_3, project_4, project_5),
  project_end
);
```

* Pipe.series: Serial execution a series of methods.
* Pipe.parallel: Parallel implement a series of methods.