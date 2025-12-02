export class UndoManager<T> {
  private states: T[] = [];
  private currentState = -1;

  constructor(private readonly maxLength = 100) {
  }

  public push(state: T) {
    this.states = this.states.slice(0, this.currentState + 1);
    if (this.states.length === this.maxLength) {
      this.states.shift();
      this.currentState--;
    }
    this.states.push(state);
    this.currentState++;
  }

  public undo(): T {
    if (this.canUndo()) {
      this.currentState--;
      return this.states[this.currentState];
    } else {
      throw new Error('Undo Not Possible');
    }
  }

  public redo(): T {
    if (this.canRedo()) {
      this.currentState++;
      return this.states[this.currentState];
    } else {
      throw new Error('Redo Not Possible');
    }
  }

  canUndo() {
    return this.currentState > 0;
  }

  canRedo() {
    return this.currentState < this.states.length - 1;
  }
}
