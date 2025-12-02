import { container, kernel } from './boot';
import { ApplicationServer } from '../framework/plugins/WebPlugin/service/ApplicationServer';

kernel.start().then(() => {
  container.resolveMultiple([ApplicationServer]).then(
    async ([applicationServer]: [ApplicationServer]) => {
      try {
        applicationServer.start();
        console.log('Server started');
      } catch (e) {
        console.error('Server failed with exception: ', e);
      }
    },
  );
});

