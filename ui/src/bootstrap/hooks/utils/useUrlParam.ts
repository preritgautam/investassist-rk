import { useRouter } from 'next/router';

export function useUrlParam(name: string): any {
  const router = useRouter();
  return router.query[name];
}

export function useUrlParams(names: string[]): Record<string, any> {
  const router = useRouter();
  return names.map((name) => router.query[name]);
}
