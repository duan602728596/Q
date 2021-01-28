import Onion from '../src/Onion';

/**
 * After a period of time, return the specified value
 * 一段时间后，返回指定的值
 * @param { number } time: after time
 * @param { any } value
 */
function returnMockValueAfterTime(time, value) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(value);
    }, time);
  });
}

test('Onion model test', async function() {
  let middlewareResult, endResult;
  let end = false;

  function isEnd() {
    return new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        if (end) {
          clearInterval(timer);
          resolve();
        }
      });
    });
  }

  const onion = new Onion();

  onion.use(async function(ctx, next) {
    ctx.result.push(await returnMockValueAfterTime(300, 0));
    await next();
    ctx.result.push(await returnMockValueAfterTime(500, 4));
    endResult = [...ctx.result];
    end = true;
  });

  onion.use(async function(ctx, next) {
    ctx.result.push(await returnMockValueAfterTime(200, 1));
    await next();
    ctx.result.push(await returnMockValueAfterTime(200, 3));
  });

  onion.use(async function(ctx, next) {
    ctx.result.push(await returnMockValueAfterTime(850, 2));
    await next();
  });

  onion.middle(function(ctx) {
    middlewareResult = [...ctx.result];
  });

  onion.run({ result: [] });
  await isEnd();
  expect(middlewareResult).toEqual([0, 1, 2]);
  expect(endResult).toEqual([0, 1, 2, 3, 4]);
});