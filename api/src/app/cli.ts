import { container, kernel } from './boot';
import { CommandRunner } from '../framework/plugins/CommandPlugin';

kernel.start().then(() => {
  container.resolveMultiple([CommandRunner]).then(async (
    [commandRunner]: [CommandRunner]) => {
    try {
      await commandRunner.run();
      console.log('Command completed');
    } catch (e) {
      console.error('Command failed with exception: ', e);
    }
  });
});

