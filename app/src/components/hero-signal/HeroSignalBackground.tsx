'use client';

import { useEffect, useRef } from 'react';
import { LATTICE } from './config';
import {
  createNodes,
  drawLattice,
  nodeCount,
  parseRgb,
  stepNodes,
  type Palette,
  type Pointer,
  type SignalNode,
} from './signal-engine';
import styles from './HeroSignalBackground.module.css';

type LatticeState = 'running' | 'paused' | 'static';

/**
 * The hero's interactive node/edge lattice (DS v3 §7.3), one self-contained canvas layer that fills its positioned
 * parent. The parent supplies the photo beneath and the navy shade above.
 *
 *  - Colours come from the hero-scoped tokens --lattice-node/--lattice-edge/--lattice-hot, re-read on theme change.
 *  - DPR capped at 2; node count scales with area (34–80).
 *  - Runs only while the hero is on screen and the tab is visible.
 *  - prefers-reduced-motion: ONE static frame, no loop, no pointer tracking.
 *  - Initialised when the browser is idle so it never competes with first paint.
 *  - All layers are aria-hidden. No external libraries.
 * `data-lattice`, `data-pointer` and `data-nodes` on the canvas expose state for tests.
 */
export function HeroSignalBackground() {
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const canvas = canvasRef.current;
    const host = layer?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!layer || !canvas || !host || !ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    let width = 0;
    let height = 0;
    let nodes: SignalNode[] = [];
    let palette: Palette = { node: [40, 78, 139], edge: [40, 78, 139], hot: [30, 111, 219] };
    let inView = true;
    let running = false;
    let raf = 0;
    let last = 0;
    const pointer: Pointer = { x: -9999, y: -9999, active: false };

    const setState = (state: LatticeState) => {
      canvas.dataset.lattice = state;
    };

    /** Resolve tokens to RGB through a probe element, which works for any colour syntax a token uses. */
    const readPalette = () => {
      const probe = document.createElement('span');
      probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none';
      layer.appendChild(probe);
      const resolve = (token: string, fallback: Palette['node']) => {
        probe.style.color = `var(${token})`;
        return parseRgb(getComputedStyle(probe).color) ?? fallback;
      };
      palette = {
        node: resolve('--lattice-node', palette.node),
        edge: resolve('--lattice-edge', palette.edge),
        hot: resolve('--lattice-hot', palette.hot),
      };
      probe.remove();
    };

    const draw = () => drawLattice(ctx, nodes, palette, pointer, width, height);

    const frame = (time: number) => {
      if (!running) return;
      const dt = Math.min((time - last) / 1000, 0.05);
      last = time;
      stepNodes(nodes, dt, width, height);
      draw();
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    /** Animate only when motion is allowed, the hero is on screen and the tab is visible; otherwise settle. */
    const sync = () => {
      if (reduce.matches) {
        stop();
        setState('static');
        draw();
        return;
      }
      const shouldRun = inView && !document.hidden;
      if (shouldRun && !running) {
        running = true;
        last = performance.now();
        setState('running');
        raf = requestAnimationFrame(frame);
      } else if (!shouldRun && running) {
        stop();
        setState('paused');
      }
    };

    const resize = (w: number, h: number) => {
      if (w < 1 || h < 1) return;
      const dpr = Math.min(window.devicePixelRatio || 1, LATTICE.dprCap);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const wanted = nodeCount(w, h);
      if (nodes.length === 0 || width === 0) {
        nodes = createNodes(w, h, wanted);
      } else {
        // Keep the composition steady across a resize: scale positions, then add or drop nodes to the new count.
        const sx = w / width;
        const sy = h / height;
        for (const n of nodes) {
          n.x *= sx;
          n.y *= sy;
        }
        if (wanted > nodes.length)
          nodes.push(...createNodes(w, h, wanted - nodes.length, nodes.length + 7));
        else nodes.length = wanted;
      }
      width = w;
      height = h;
      canvas.dataset.nodes = String(nodes.length);
      draw();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (reduce.matches) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
      canvas.dataset.pointer = 'near';
    };
    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = pointer.y = -9999;
      canvas.dataset.pointer = 'away';
    };

    let disposed = false;
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let intersectionObserver: IntersectionObserver | undefined;
    let themeObserver: MutationObserver | undefined;
    let cleanupExtras = () => {};

    const onThemeChange = () => {
      readPalette();
      if (!running) draw();
    };

    const start = () => {
      if (disposed) return;
      readPalette();
      canvas.dataset.pointer = 'away';
      setState(reduce.matches ? 'static' : 'paused');

      resizeObserver = new ResizeObserver(([entry]) => {
        if (entry) resize(entry.contentRect.width, entry.contentRect.height);
        sync();
      });
      resizeObserver.observe(layer);

      intersectionObserver = new IntersectionObserver(([entry]) => {
        inView = entry?.isIntersecting ?? true;
        sync();
      });
      intersectionObserver.observe(layer);

      if (finePointer.matches) {
        host.addEventListener('pointermove', onPointerMove, { passive: true });
        host.addEventListener('pointerleave', onPointerLeave);
      }
      themeObserver = new MutationObserver(onThemeChange);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
      const colourScheme = window.matchMedia('(prefers-color-scheme: dark)');
      colourScheme.addEventListener('change', onThemeChange);
      document.addEventListener('visibilitychange', sync);
      reduce.addEventListener('change', sync);

      cleanupExtras = () => {
        colourScheme.removeEventListener('change', onThemeChange);
        document.removeEventListener('visibilitychange', sync);
        reduce.removeEventListener('change', sync);
        host.removeEventListener('pointermove', onPointerMove);
        host.removeEventListener('pointerleave', onPointerLeave);
      };
    };

    // Wait for an idle moment so the background never competes with the hero copy for first paint.
    if (typeof window.requestIdleCallback === 'function') {
      idleHandle = window.requestIdleCallback(start, { timeout: 1200 });
    } else {
      timeoutHandle = window.setTimeout(start, 250);
    }

    return () => {
      disposed = true;
      stop();
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      themeObserver?.disconnect();
      cleanupExtras();
    };
  }, []);

  return (
    <div ref={layerRef} className={styles.layer} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} data-lattice="paused" data-pointer="away" />
    </div>
  );
}
