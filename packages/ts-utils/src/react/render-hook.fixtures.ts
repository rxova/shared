import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * Renders `hook` inside a real React root, in a suite that runs under
 * `@vitest-environment happy-dom`: the smallest harness that runs effects and
 * refs the way an app would, without a testing library.
 */
export const renderHook = <Props, Result>(hook: (props: Props) => Result, initialProps: Props) => {
  const result = { current: undefined as Result, renders: 0 };
  const Probe = ({ props }: { props: Props }) => {
    result.current = hook(props);
    result.renders += 1;
    return null;
  };
  const root = createRoot(document.createElement('div'));
  const render = (props: Props) => {
    act(() => {
      root.render(createElement(Probe, { props }));
    });
  };
  render(initialProps);
  return {
    result,
    rerender: render,
    unmount: () => {
      act(() => {
        root.unmount();
      });
    },
  };
};
