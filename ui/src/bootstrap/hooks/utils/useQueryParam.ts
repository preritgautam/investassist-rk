import { useRouter } from 'next/router';


export function useQueryParam<T = string>(key: string): T {
  const { query } = useRouter();
  return query[key] as any as T;
}

export function useQueryParams<T = string>(keys: string[]): T[] {
  const { query } = useRouter();
  return keys.map((p) => query[p] as any) as T[];
}


