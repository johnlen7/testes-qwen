export {};

declare global {
  interface Document {
    /** View Transitions API — ainda não em lib.dom.d.ts estável em todas as versões do TS. */
    startViewTransition?(callback: () => void | Promise<void>): {
      ready: Promise<void>;
      finished: Promise<void>;
      updateCallbackDone: Promise<void>;
    };
  }
}
