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
  (state: any, callback: Function): Promise<void>;
}

interface DestFunc {
  (state: any): Promise<void>;
}

interface Func {
  (): Promise<any>;
}

interface DispatchArgs {
  index: number;
  resolve: Function;
  destFunc?: DestFunc;
}

export class PipeCore {
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
   * @param { DestFunc } destFunc
   */
  dispatch({ index, resolve, destFunc }: DispatchArgs): Function {
    if (index === this.tasks.length) {
      return async (): Promise<any> => {
        destFunc && (await destFunc(this.state));
        resolve();
      };
    } else {
      return (): any => this.tasks[index](this.state, this.dispatch({
        index: index + 1,
        resolve,
        destFunc
      }));
    }
  }

  /**
   * Begin execution
   * 开始执行
   */
  dest(destFunc?: DestFunc): Promise<any> {
    return new Promise((resolve: Function, reject: Function): void => {
      this.dispatch({
        index: 0,
        resolve,
        destFunc
      })();
    });
  }
}

function Pipe(state: any): PipeCore {
  const pipe: PipeCore = new PipeCore(state);

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