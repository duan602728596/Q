/**
 * Onion is something similar to the koa onion model
 * Onion是一个类似于koa洋葱模型的东西
 */

/**
 * example:
 *
 * const onion = new Onion();
 *
 * onion.use(async function(ctx, next) {
 *   console.log('->', 1);
 *   await next();
 *   console.log('->', 2);
 * });
 * onion.use(async function(ctx, next) {
 *   console.log('->', 3);
 *   await next();
 * });
 * onion.run();
 *
 * Console printing:
 *   -> 1
 *   -> 3
 *   -> 2
 */

interface TaskFunc {
  (ctx: any, next: Function): Promise<void>;
}

type End = (ctx: any) => any;

interface OnionConfig {
  end?: End;
}

class Onion {
  public tasks: Array<TaskFunc> = [];
  public endFunc: End;

  constructor(config?: OnionConfig) {
    this.endFunc = config?.end ?? ((ctx: any) => (): void => { /* noop */ });
  }

  /**
   * Add to queue
   * 添加到队列
   * @param { Array<TaskFunc> } tasks
   */
  use(...tasks: Array<TaskFunc>): void {
    this.tasks.push(...tasks);
  }

  /**
   * Add to end
   * 设置中间件最后执行的函数
   * @param { End } endFunc
   */
  end(endFunc: End): void {
    this.endFunc = endFunc;
  }

  /**
   * Create an onion model
   * 创建洋葱模型
   * @param { object } ctx: context
   * @param { number } index
   */
  dispatch(ctx: any, index: number): Function {
    if (index === this.tasks.length) {
      return (): any => this.endFunc(ctx);
    } else {
      return (): any => this.tasks[index](ctx, this.dispatch(ctx, index + 1));
    }
  }

  /**
   * Execution method
   * 执行方法
   * @param { object } ctx: your context
   */
  run(ctx?: any): any {
    return this.dispatch(Object.assign({}, ctx), 0)();
  }
}

export default Onion;