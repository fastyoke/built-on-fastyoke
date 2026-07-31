import * as React from 'react';
import * as ReactJsxRuntime from 'react/jsx-runtime';
import * as FastYokeSdk from '@fastyoke/sdk';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '../../../styles/gallery.css';

document.body.dataset.app = 'issue-board';

// Expose this app's exact instances of react / react/jsx-runtime / @fastyoke/sdk
// so the import-map shims in public/shims/*.js (see index.html) can hand them to
// dynamically-loaded extension bundles — which import these as bare specifiers.
// This keeps a single React (and a single SDK context) across the app/extension
// boundary. Must run before any extension loads (i.e. before render).
Object.assign(globalThis, {
  __fyReact: React,
  __fyReactJsx: ReactJsxRuntime,
  __fySdk: FastYokeSdk,
});

createRoot(document.getElementById('root')!).render(<App />);
