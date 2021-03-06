/**
 * Queue is a queue function, it can limit the number of simultaneous execution methods.
 * For example, when uploading multiple files at the same time,
 * using the queue function can limit uploading up to 3 files each time,
 * When one file is uploaded, upload the next file.
 *
 * Queue是一个队列函数，它可以限制同时执行方法的数量。
 * 比如同时上传多个文件，使用队列函数可以限制每次最多上传3个文件，
 * 当一个文件上传完毕后，接着上传下一个文件。
 */

/**
 * example:
 *
 * function task() { / * do something * / }
 *
 * const queue = new Queue({ workerLen: 3 });
 *
 * queue.use(
 *   [task, undefined, 1],
 *   [task, undefined, 2],
 *   [task, undefined, 3],
 *   // ...
 * );
 * queue.run();
 *
 * queue.use([task, undefined, 4]);
 * queue.use([task, undefined, 5]);
 * queue.run();
 */

interface QueueConfig {
  workerLen?: number;
}

interface TaskFunc {
  (...args: any[]): any;
}

type Task = [taskFunc: TaskFunc, self?: any, ...args: any[]];

class Queue {
  public workerLen: number;         // Number of tasks executed simultaneously 同时执行的任务数量
  public waitingTasks: Array<Task>; // Queue of tasks waiting to be executed   等待执行的任务队列
  public workerTasks: Array<Generator | undefined>; // Task in progress 正在执行的任务

  constructor(config?: QueueConfig) {
    this.workerLen = config?.workerLen ?? 3;
    this.waitingTasks = [];
    this.workerTasks = new Array<Generator | undefined>(this.workerLen);
  }

  /**
   * Add to the queue of tasks waiting to be executed
   * 添加到等待执行的任务队列
   * @param { Array<Task> } tasks
   */
  use(...tasks: Array<Task>): void {
    for (const task of tasks) {
      this.waitingTasks.unshift(task);
    }
  }

  /**
   * Perform a task
   * 执行一个任务
   * @param { number } index
   * @param { Task } task
   */
  *executionTask(index: number, task: Task): Generator {
    const [taskFunc, self, ...args]: Task = task;

    yield ((): any => {
      const callback: Function = (): void => {
        this.workerTasks[index] = undefined;
        this.run();
      };

      let callFunc: any;

      try {
        callFunc = taskFunc.call(self, ...args);
      } finally {
        // After the task is executed, assign the task again and execute the task
        // 任务执行完毕后，再次分配任务并执行任务
        if (typeof callFunc?.finally === 'function') {
          callFunc.finally(callback);
        } else {
          callback();
        }
      }
    })();
  }

  /**
   * Assign and execute tasks
   * 分配并执行任务
   */
  run(): void {
    const runIndex: Array<number> = [];

    for (let i: number = 0; i < this.workerLen; i++) {
      const len: number = this.waitingTasks.length;

      if (!this.workerTasks[i] && len > 0) {
        this.workerTasks[i] = this.executionTask(i, this.waitingTasks[len - 1]);
        runIndex.push(i);
        this.waitingTasks.pop(); // Delete tasks from the task queue 从任务队列内删除任务
      }
    }

    for (const index of runIndex) {
      this.workerTasks[index]?.next?.();
    }
  }
}

export default Queue;