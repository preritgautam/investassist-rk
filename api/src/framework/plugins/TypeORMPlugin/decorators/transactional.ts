import { Transaction } from '../Transaction';
import { transaction } from '../transactions';


export function transactional() {
  return function(target: any, propertyKey: string, propertyDescriptor: PropertyDescriptor): any {
    const originalFn = propertyDescriptor.value;
    const acceptCount = originalFn.length;

    propertyDescriptor.value = function(...args) {
      const argsCount = args.length;
      if (argsCount < acceptCount) {
        return transaction(async (txnOptions: Transaction) => {
          return await originalFn.apply(this, [...args, txnOptions]);
        }, null);
      } else {
        const lastArg = args[argsCount - 1];
        if (lastArg !== null) {
          return originalFn.apply(this, args);
        } else {
          return transaction(async (txnOptions: Transaction) => {
            return await originalFn.apply(this, [...args.slice(0, argsCount - 1), txnOptions]);
          }, null);
        }
      }
    };

    return propertyDescriptor;
  };
}
