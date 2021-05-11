/**
 * Pipe method implements a pipe flow
 * Pipe方法实现一个pipe流
 */

/**
 * example:
 *
 * function doSomeThing(state, callback) {
 *   // do some thing
 *   state.name = 'name';
 *   callback();
 * }
 *
 * function project0() {
 *   return Pipe({})
 *    .pipe(doSomeThing)
 *    .pipe(doSomeThing)
 *    .dest(); // start
 * }
 *
 * await project0();
 */

interface TaskFunc {
  (state: any, next: Function): Promise<void>;
}

interface Func {
  (): Promise<any>;
}

class PipeModule {
  public tasks: Array<TaskFunc> = [];
  public state: any = undefined;

  constructor(state: any) {
    this.state = state;
  }

  /**
   * Add to pipe function
   * 添加到管道函数队列
   * @param { TaskFunc } func
   */
  pipe(func: TaskFunc): this {
    this.tasks.push(func);

    return this;
  }

  /**
   * @param { number } index
   * @param { Function } resolve
   */
  dispatch(index: number, resolve: Function): Function {
    if (index === this.tasks.length) {
      return (): any => resolve();
    } else {
      return (): any => this.tasks[index](this.state, this.dispatch(index + 1, resolve));
    }
  }

  /**
   * Begin execution
   * 开始执行
   */
  dest(): Promise<any> {
    return new Promise((resolve: Function, reject: Function): void => {
      this.dispatch(0, resolve)();
    });
  }
}

function Pipe(state: any): PipeModule {
  const pipe: PipeModule = new PipeModule(state);

  return pipe;
}

/* Serial queue */
Pipe.series = function(...func: Func[]): () => Promise<void> {
  return async function(): Promise<void> {
    for (const fn of func) {
      await fn();
    }
  };
};

/* Parallel queue */
Pipe.parallel = function(...func: Func[]): () => Promise<void> {
  return async function(): Promise<void> {
    await Promise.all(func.map((fn: Func): any => fn()));
  };
};

export default Pipe;