// Import-map shim for `@fastyoke/sdk` — the app's instance, shared with
// extension bundles. Sharing the instance matters: the extension's
// `useFastYoke()` must read the same React context this app's
// <FastYokeProvider> populates, so it needs this app's SDK, not a fresh copy.
const S = globalThis.__fySdk;
export const {
  FastYokeProvider, ExtensionProvider,
  useFastYoke, useEntities, useEntity, useCreateEntity,
  useJobs, useJobHistory, useTransitionJob, useCancelJob,
  useExtensionRegistry, FsmTimeline,
} = S;
