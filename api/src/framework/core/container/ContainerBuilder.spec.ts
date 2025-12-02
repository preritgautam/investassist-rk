import { ContainerBuilder } from './ContainerBuilder';

describe('ContainerBuilder', () => {
  let container;
  let injectable;
  const builder = new ContainerBuilder();

  it('works without taggers', async () => {
    ({ container, decorators: { injectable } } = builder.buildContainer());

    @injectable()
    class A {
    }

    expect(await container.resolve(A)).toBeInstanceOf(A);
  });
});
