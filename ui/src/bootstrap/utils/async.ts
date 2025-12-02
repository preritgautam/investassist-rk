export async function waitOnlyOnServer(promises: Promise<any>[] | Promise<any>) {
  if (typeof window === 'undefined') {
    if (Array.isArray(promises)) {
      await Promise.all(promises);
    } else {
      await promises;
    }
  }
}
