import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { storage } from '../services/storage';

export function usePersistedState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => storage.get<T>(key, initial));
  useEffect(() => {
    storage.set(key, value);
  }, [key, value]);
  return [value, setValue];
}
