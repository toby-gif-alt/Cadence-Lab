(function () {
  "use strict";

  const NativeResizeObserver = window.ResizeObserver;
  if (!NativeResizeObserver || NativeResizeObserver.__cadenceWidthGuard) return;

  class CadenceWidthResizeObserver {
    constructor(callback) {
      this.callback = callback;
      this.widths = new WeakMap();
      this.observer = new NativeResizeObserver((entries) => {
        const meaningful = entries.filter((entry) => {
          // app.js observes #score. Rendering changes that element's height and
          // can also perturb its own box, which must never trigger another score
          // render. The only resize that matters is the available parent/frame
          // width changing.
          const width = entry.target.parentElement?.getBoundingClientRect().width || entry.contentRect.width;
          const previous = this.widths.get(entry.target);
          this.widths.set(entry.target, width);
          return previous == null || Math.abs(width - previous) >= 8;
        });
        if (meaningful.length) callback(meaningful, this);
      });
    }
    observe(target, options) {
      this.widths.set(target, target.parentElement?.getBoundingClientRect().width || target.getBoundingClientRect().width);
      this.observer.observe(target, options);
    }
    unobserve(target) {
      this.widths.delete(target);
      this.observer.unobserve(target);
    }
    disconnect() {
      this.observer.disconnect();
      this.widths = new WeakMap();
    }
    takeRecords() {
      return this.observer.takeRecords();
    }
  }

  CadenceWidthResizeObserver.__cadenceWidthGuard = true;
  CadenceWidthResizeObserver.NativeResizeObserver = NativeResizeObserver;
  window.ResizeObserver = CadenceWidthResizeObserver;
  window.CadenceRuntimeStability = Object.freeze({ resizeObserverMode: "parent-width-only" });
})();
