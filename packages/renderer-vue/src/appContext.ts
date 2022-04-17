// @ts-ignore
import { inject } from 'vue';

export const AppContextKey = Symbol('AppContextKey');

export function useAppData() {
  const state = inject(AppContextKey);
  if (!state) {
    throw new Error('AppContext is no provide');
  }

  return state;
}
