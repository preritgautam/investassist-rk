class LSWrapper {
  constructor(private readonly prefix) {
  }

  set(key: string, value: any) {
    localStorage.setItem(`${this.prefix}-${key}`, JSON.stringify({ value }));
  }

  get(key: string, defaultValue: any): any {
    const storageData = JSON.parse(localStorage.getItem(`${this.prefix}-${key}`));
    const value = storageData?.value;
    return value === undefined ? defaultValue : value;
  }

  remove(key): void {
    localStorage.removeItem(`${this.prefix}-${key}`);
  }
}

export default LSWrapper;
