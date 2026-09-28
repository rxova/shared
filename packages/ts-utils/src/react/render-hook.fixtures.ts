import * as React from 'react';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import * as TestUtils from 'react-dom/test-utils';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * `act` from `react` where it exists (18.3 and later), else from
 * `react-dom/test-utils`, so the suites also run on the React 18.2 floor.
 */
export const act: (callback: () => void) => void =
  (React as { act?: (callback: () => void) => void }).act ??
  // Deprecated in 18.3+, and reached only on the older React that has no other `act`.
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  TestUtils.act;

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
