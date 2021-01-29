import Queue from '../src/Queue';

function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}

// Judge whether it is over
function isEnd(result, len) {
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (result.length === len) {
        clearInterval(timer);
        resolve();
      }
    });
  });
}

/**
 * After a certain period of time, add the value to the result array
 * 一定时间后，将值添加到result数组中
 * @param { Array<number> } result
 * @param { number } time
 * @param { number } value
 */
async function addToResult(result, time, value) {
  await sleep(time);
  result.push(value);
}

function addToResultSync(result, value) {
  result.push(value);
}

test('Queue model test', async function() {
  const result = [];
  const queue = new Queue();

  queue.use(
    [addToResult, undefined, result, 300, 1],
    [addToResult, undefined, result, 500, 2],
    [addToResult, undefined, result, 1_000, 3],
    [addToResult, undefined, result, 400, 4],
    [addToResult, undefined, result, 100, 5],
    [addToResult, undefined, result, 2_000, 6],
    [addToResult, undefined, result, 100, 7],
    [addToResult, undefined, result, 700, 8],
    [addToResultSync, undefined, result, 9]
  );

  queue.run();

  await isEnd(result, 9);
  expect(result).toEqual([1, 2, 5, 4, 7, 3, 9, 8, 6]);
});

test('Queue more workerLen test', async function() {
  const result = [];
  const queue = new Queue({ workerLen: 5 });

  queue.use(
    [addToResult, undefined, result, 100, 1],
    [addToResult, undefined, result, 800, 2],
    [addToResult, undefined, result, 1_000, 3],
    [addToResult, undefined, result, 200, 4],
    [addToResult, undefined, result, 300, 5],
    [addToResult, undefined, result, 1_000, 6],
    [addToResult, undefined, result, 300, 7],
    [addToResult, undefined, result, 600, 8],
    [addToResult, undefined, result, 200, 9],
    [addToResult, undefined, result, 800, 10],
    [addToResult, undefined, result, 2_000, 11],
    [addToResult, undefined, result, 500, 12],
    [addToResult, undefined, result, 700, 13]
  );

  queue.run();
  await isEnd(result, 13);
  expect(result).toEqual([1, 4, 5, 7, 9, 2, 8, 3, 6, 12, 10, 13, 11]);
});