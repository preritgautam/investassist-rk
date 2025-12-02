import { AbstractSerializer } from './serializer/AbstractSerializer';
import { NormalizeOptions, NormalizerService } from './NormalizerService';
import { SerializerServiceLocator } from './serializer/SerializerServiceLocator';

export type SerializerOptions = {
  defaultSerializer: 'json'
}

export interface SerializeOptions extends NormalizeOptions {
  serializer?: string,
}

export class SerializerService {
  constructor(
    private readonly options: SerializerOptions,
    private readonly normalizerService: NormalizerService,
    private readonly serializerServiceLocator: SerializerServiceLocator,
  ) {
  }

  public async serialize(value: any | any[], {
    serializer: serializerType = '',
    ...normalizeOptions
  }: SerializeOptions = {}): Promise<any> {
    const normalized = await this.normalizerService.normalize(value, normalizeOptions);
    const serializer: AbstractSerializer = await this.getSerializer(serializerType || this.options.defaultSerializer);
    return serializer.serialize(normalized, {});
  }

  private async getSerializer(type): Promise<AbstractSerializer> {
    return this.serializerServiceLocator.resolveByAlias(`serializer.${type}`);
  }
}
