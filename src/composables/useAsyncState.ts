import { ref } from 'vue';

export function useAsyncState<T>(asyncFn: () => Promise<T>, initialState: T) {
  const state = ref<T>(initialState);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function execute() {
    loading.value = true;
    error.value = null;
    try {
      state.value = await asyncFn();
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  }

  return {
    state,
    loading,
    error,
    execute
  };
} 