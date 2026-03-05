import { useEffect, useState } from 'react';
import { useTheme } from '@/providers/theme-provider';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme(): 'light' | 'dark' {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const { theme } = useTheme();

  if (hasHydrated) {
    return theme;
  }

  return 'light';
}
