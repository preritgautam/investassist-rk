import { BullJobWorker } from '../engines/bull/BullJobWorker';
import * as process from 'process';
import { Command } from '../../CommandPlugin';

export class BullJobRunnerCommand extends Command {
  public static Command = 'updated in Plugin class depending on namespace';

  constructor(
    private readonly worker: BullJobWorker,
  ) {
    super();
  }

  exitHandler = async () => {
    console.log('waiting for worker to close..');
    await this.worker.worker.close();
    console.log('worker closed, exiting now..');
    process.exit(0);
  };

  protected async run() {
    console.log('Started job runner...');

    // return a promise that resolves/rejects when the command is somehow killed
    return new Promise((resolve, reject) => {
      // do something when app is closing
      process.on('exit', async () => {
        // don't really need to do anything here, since a normal exit will never happen with this
      });

      // catches ctrl+c event
      process.on('SIGINT', async () => {
        console.log('Ctrl+C pressed');
        await this.exitHandler();
        resolve(null);
      });

      // catches terminal closed event
      process.on('SIGHUP', async () => {
        console.log('terminal closed');
        await this.exitHandler();
        resolve(null);
      });

      // catches "kill pid" (for example: nodemon restart)
      process.on('SIGTERM', async () => {
        console.log('Received kill signal 1');
        await this.exitHandler();
        resolve(null);
      });
      process.on('SIGUSR2', async () => {
        console.log('Received kill signal 2');
        await this.exitHandler();
        resolve(null);
      });

      // catches uncaught exceptions
      process.on('uncaughtException', async (e) => {
        // Should we do this?
        console.log('uncaught exception.. ', e);
        await this.exitHandler();
        reject(e);
      });
    });
  }
}
