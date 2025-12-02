export function arrayToMap(arr: { id: string | number }[]) {
  return arr.reduce((map, item) => {
    map[item.id] = item;
    return map;
  }, {});
}

export function mapToList(map: object) {
  return Reflect.ownKeys(map).map((k) => map[k]);
}
