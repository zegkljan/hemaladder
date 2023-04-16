type EnumObject = { [key: string]: number | string };
type EnumObjectEnum<E extends EnumObject> = E extends {
  [key: string]: infer ET | string;
}
  ? ET
  : never;

export function getEnumValues<E extends EnumObject>(
  enumObject: E
): EnumObjectEnum<E>[] {
  return Object.keys(enumObject)
    .filter((key) => Number.isNaN(Number(key)))
    .map((key) => enumObject[key] as EnumObjectEnum<E>);
}

export async function loadJSON(
  url: string
): Promise<
  Record<string, unknown> | Array<unknown> | string | number | null | boolean
> {
  console.debug('loading', url);
  const res = await fetch(url);
  const json = res.json();
  return json;
}

export function objectFilter<T>(
  obj: Record<string, T>,
  predicate: (key: string) => boolean
): Record<string, T> {
  return Object.keys(obj)
    .filter((key) => predicate(key))
    .reduce((res, key) => {
      res[key] = obj[key];
      return res;
    }, {} as Record<string, T>);
}
