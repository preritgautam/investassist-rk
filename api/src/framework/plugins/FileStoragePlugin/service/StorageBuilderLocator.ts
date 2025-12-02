import { TaggedServiceLocator } from '../../../core/container';

export class StorageBuilderLocator extends TaggedServiceLocator {
  constructor(ns: string) {
    super(`${ns}.storage.builder`);
  }
}
