import Queue from '../src/Queue';

function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}

test('Queue model test', async function() {
  const result = [];

  // Judge whether it is over
  function isEnd() {
    return new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        if (result.length === 9) {
          clearInterval(timer);
          resolve();
        }
      });
    });
  }

  /**
   * After a certain period of time, add the value to the result array
   * 一定时间后，将值添加到result数组中
   * @param { number } time
   * @param { number } value
   */
  async function addToResult(time, value) {
    await sleep(time);
    result.push(value);
  }

  function addToResultSync(value) {
    result.push(value);
  }

  const queue = new Queue();

  queue.use(
    [addToResult, undefined, 300, 1],
    [addToResult, undefined, 500, 2],
    [addToResult, undefined, 1_000, 3],
    [addToResult, undefined, 400, 4],
    [addToResult, undefined, 100, 5],
    [addToResult, undefined, 2_000, 6],
    [addToResult, undefined, 100, 7],
    [addToResult, undefined, 700, 8],
    [addToResultSync, undefined, 9]
  );

  queue.run();

  await isEnd();
  expect(result).toEqual([1, 2, 5, 4, 7, 3, 9, 8, 6]);
});