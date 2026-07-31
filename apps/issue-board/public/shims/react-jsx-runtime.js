// Import-map shim for `react/jsx-runtime` — the app's instance, shared with
// extension bundles (esbuild's automatic JSX emits imports from here).
const R = globalThis.__fyReactJsx;
export const { jsx, jsxs, Fragment } = R;
