import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

/**
 * Window width that is safe for statically exported web builds.
 *
 * `useWindowDimensions()` returns 0 during static pre-rendering, the value ends up as
 * inline style in the HTML and React does not patch mismatching style attributes while
 * hydrating — layout stays at 0px until something else re-renders the component.
 * Here the first render always uses `fallback` (server and client agree), the real width
 * is applied in an effect and kept in sync on resize.
 */
export function useWindowWidth(fallback = 390): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const read = () => setWidth(Dimensions.get('window').width);
    read();
    const subscription = Dimensions.addEventListener('change', read);
    return () => subscription.remove();
  }, []);

  return width > 0 ? width : fallback;
}
