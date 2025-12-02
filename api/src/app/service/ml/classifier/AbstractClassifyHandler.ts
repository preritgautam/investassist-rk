export default abstract class AbstractClassifyHandler {
  abstract classifyLineItems(prompt: string): Promise<string>;
}
