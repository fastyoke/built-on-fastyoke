// Import-map shim: hands dynamically-loaded extension bundles the *app's* React
// instance (set on globalThis in main.tsx), so their hooks share this app's
// React dispatcher — a second React copy would throw "invalid hook call".
// A module namespace can't be re-exported wholesale from a static file, so the
// commonly-used surface is enumerated.
const R = globalThis.__fyReact;
export default R.default ?? R;
export const {
  useState, useEffect, useMemo, useRef, useCallback, useContext, useReducer,
  useLayoutEffect, useImperativeHandle, useDebugValue, useId, useTransition,
  useDeferredValue, useSyncExternalStore, createElement, cloneElement,
  createContext, forwardRef, memo, lazy, Fragment, Suspense, StrictMode,
  Children, isValidElement, Component, PureComponent, version,
} = R;
