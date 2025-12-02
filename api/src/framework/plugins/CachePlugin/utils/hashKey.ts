export type CacheKey = string | readonly unknown[]

export function hashKey(queryKey: CacheKey): string {
  const asArray = ensureQueryKeyArray(queryKey);
  return stableValueHash(asArray);
}

function ensureQueryKeyArray(value: CacheKey): CacheKey {
  return (Array.isArray(value) ? value : ([value] as unknown)) as CacheKey;
}

function hasObjectPrototype(o: any): boolean {
  return Object.prototype.toString.call(o) === '[object Object]';
}

export function isPlainObject(o: any): o is Object {
  if (!hasObjectPrototype(o)) {
    return false;
  }

  // If has modified constructor
  const ctor = o.constructor;
  if (typeof ctor === 'undefined') {
    return true;
  }

  // If has modified prototype
  const prot = ctor.prototype;
  if (!hasObjectPrototype(prot)) {
    return false;
  }

  // If constructor does not have an Object-specific method
  if (!prot.hasOwnProperty('isPrototypeOf')) {
    return false;
  }

  // Most likely a plain Object
  return true;
}


export function stableValueHash(value: any): string {
  return JSON.stringify(value, (_, val) =>
    isPlainObject(val) ? Object.keys(val)
      .sort()
      .reduce((result, key) => {
        result[key] = val[key];
        return result;
      }, {} as any) : val,
  );
}
