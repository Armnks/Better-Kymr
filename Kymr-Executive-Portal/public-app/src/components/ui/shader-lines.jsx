import { useEffect, useRef } from "react";

// ============================================================
// SHADER FIELD
//
// The original streak shader, extended into the persistent visual
// material for the whole site. The field itself is unchanged: the
// same radial fract() rings under the same mosaic quantisation.
// What is new is a grade into the brand palette, a warp term, a
// procedural horizon, and pointer displacement.
//
// Framer Motion never touches a shader frame. The render loop owns
// its own uniforms and eases them toward targets set imperatively,
// so a mode change is a value written to a plain object rather than
// a React render.
// ============================================================
const THREE_SRC = "https://cdnjs.cloudflare.com/ajax/libs/three.js/89/three.min.js";

let threePromise = null;

/** Whether this browser can give us a WebGL context at all. */
function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

/** Load Three.js once per document and share it across every instance. */
function loadThree() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.THREE) return Promise.resolve(window.THREE);
  if (threePromise) return threePromise;
  threePromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = THREE_SRC;
    s.async = true;
    s.onload = () => resolve(window.THREE);
    s.onerror = () => {
      threePromise = null;
      reject(new Error("Three.js failed to load"));
    };
    document.head.appendChild(s);
  });
  return threePromise;
}

// ---------------------------------------------------------------
// MODES
//
// One continuous environment that changes state by chapter. Each
// mode is a set of uniform targets; the loop eases toward them, so
// crossing a section boundary is a grade change rather than a cut.
// ---------------------------------------------------------------
export const SHADER_MODES = {
  intro: { warp: 0.0, horizon: 0.0, density: 0.22, signal: 1.0, speed: 0.35 },
  warp: { warp: 1.0, horizon: 0.15, density: 0.95, signal: 0.9, speed: 3.4 },
  hero: { warp: 0.0, horizon: 1.0, density: 0.40, signal: 0.5, speed: 1.0 },
  fracture: { warp: 0.20, horizon: 0.22, density: 0.28, signal: 0.28, speed: 1.2 },
  capabilities: { warp: 0.0, horizon: 0.08, density: 0.22, signal: 0.32, speed: 0.8 },
  archive: { warp: 0.0, horizon: 0.0, density: 0.14, signal: 0.18, speed: 0.55 },
  process: { warp: 0.0, horizon: 0.30, density: 0.20, signal: 0.30, speed: 0.7 },
  contact: { warp: 0.0, horizon: 0.80, density: 0.38, signal: 0.75, speed: 0.9 },
};

// live targets, read by the render loop. Deliberately not React state:
// a mode change must not re-render the tree.
const target = { ...SHADER_MODES.hero, px: 0, py: 0, ripple: 0, rippleX: 0, rippleY: 0 };
const current = { ...target };

let rippleStart = 0;

export function setShaderMode(mode) {
  const m = SHADER_MODES[mode];
  if (!m) return;
  Object.assign(target, m);
}

/** Intro drives warp and density directly, ahead of any mode. */
export function setShaderIntro({ warp, density, signal, speed, horizon }) {
  if (warp !== undefined) target.warp = warp;
  if (density !== undefined) target.density = density;
  if (signal !== undefined) target.signal = signal;
  if (speed !== undefined) target.speed = speed;
  if (horizon !== undefined) target.horizon = horizon;
}

// The shader canvas normally sits behind the page. The Archive raises
// it above an opaque veil so the portal shows the live field rather
// than the homepage behind it, without a second WebGL context.
let layerEl = null;
export function setShaderLayer(z) {
  if (layerEl) layerEl.style.zIndex = z === null ? "" : String(z);
}

export function setShaderPointer(x, y) {
  target.px = x;
  target.py = y;
}

/** One short signal ripple from a point in normalised device space. */
export function pingShader(x, y) {
  target.rippleX = x;
  target.rippleY = y;
  rippleStart = performance.now();
}

const VERTEX_SHADER = `
  void main() { gl_Position = vec4( position, 1.0 ); }
`;

// The original field, graded and extended. Everything above
// "// ---- extensions" is the shader as supplied.
const FRAGMENT_SHADER = `
  precision highp float;

  uniform vec2  resolution;
  uniform float time;
  uniform float uWarp;
  uniform float uHorizon;
  uniform float uDensity;
  uniform float uSignal;
  uniform vec2  uPointer;
  uniform float uRipple;
  uniform vec2  uRippleAt;

  float random (in float x) { return fract(sin(x)*1e4); }

  void main(void) {
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

    // pointer displacement, deliberately tiny: about 8px perceived
    uv += uPointer * 0.014;

    vec2 fMosaicScal = vec2(4.0, 2.0);
    vec2 vScreenSize = vec2(256.0, 256.0);
    uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
    uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);

    float t = time*0.06 + random(uv.x)*0.4;

    // warp stretches the streaks and thickens them, so the same field
    // reads as travel rather than as a standing pattern
    float lineWidth = 0.0008 * (1.0 + uWarp * 5.0);
    float reach = length(uv) * (1.0 - uWarp * 0.55);

    vec3 color = vec3(0.0);
    for(int j = 0; j < 3; j++){
      for(int i=0; i < 5; i++){
        color[j] += lineWidth*float(i*i) / abs(fract(t - 0.01*float(j)+float(i)*0.01)*1.0 - reach);
      }
    }
    // The 1/abs() term is unbounded near a ring, which blows the streak
    // cores to pure white and leaves 2% of a very large number still
    // visible through the world body. Clamped before grading.
    vec3 field = min(vec3(color[2], color[1], color[0]), vec3(1.6)) * uDensity;

    // ---- extensions ----

    // grade: the raw field is channel-split, which reads as RGB fringing.
    // Pulled toward cold silver, with the split kept as a trace so the
    // material still looks like light through glass rather than a wash.
    float lum = dot(field, vec3(0.299, 0.587, 0.114));
    vec3 silver = vec3(0.66, 0.70, 0.75) * lum;
    vec3 graded = mix(silver, field, 0.42);

    // vermilion signal, strongest at the centre line
    vec3 vermilion = vec3(1.0, 0.231, 0.078);
    float core = exp(-abs(uv.x) * 3.2) * exp(-abs(uv.y) * 1.4);
    graded += vermilion * core * lum * uSignal * 1.6;

    // procedural horizon: a curved world boundary well below frame.
    // Dark body, thin atmospheric rim, sparse light activity. Never a
    // globe, never Earth: only the top arc is ever in shot.
    if (uHorizon > 0.001) {
      // the arc sits low and reads flat: only the crown is ever in
      // shot, which is what separates a world boundary from a lens flare
      vec2 c = vec2(0.0, -4.62);
      float r = 4.30;
      float d = length(uv - c) - r;

      float body = smoothstep(0.012, -0.02, d);              // surface
      float rim  = exp(-abs(d) * 118.0);                     // thin atmosphere
      float halo = exp(-max(d, 0.0) * 13.0) * 0.16;          // scatter above

      graded *= mix(1.0, 0.02, body * uHorizon);             // field occluded
      // cold silver carries the rim; vermilion only tints it
      graded += vec3(0.60, 0.66, 0.74) * rim * 0.62 * uHorizon;
      graded += vermilion * rim * 0.16 * uHorizon * uSignal;
      graded += vec3(0.26, 0.30, 0.36) * halo * uHorizon;

      // sparse activity, on the surface only, never a dotted line
      float cell = random(floor(uv.x * 46.0) * 7.13 + floor(uv.y * 26.0) * 3.71);
      float lights = step(0.9992, cell) * smoothstep(0.0, -0.16, d);
      graded += vermilion * lights * uHorizon * 0.42;
    }

    // one short ripple from a click on empty ground
    if (uRipple > 0.001) {
      float dr = abs(length(uv - uRippleAt) - (1.0 - uRipple) * 1.5);
      graded += vermilion * exp(-dr * 26.0) * uRipple * 0.5;
    }

    // carbon floor: the ground is never pure black
    vec3 carbon = vec3(0.043, 0.043, 0.055);
    gl_FragColor = vec4(carbon + graded, 1.0);
  }
`;

export function ShaderAnimation({ className = "", fixed = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasWebGL()) return undefined;

    let cancelled = false;
    let frame = null;
    let cleanupIO = null;
    let observer = null;
    let renderer = null;
    let geometry = null;
    let material = null;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    loadThree()
      .then((THREE) => {
        if (cancelled || !containerRef.current) return;

        const camera = new THREE.Camera();
        camera.position.z = 1;
        const scene = new THREE.Scene();
        geometry = new THREE.PlaneBufferGeometry(2, 2);

        const uniforms = {
          time: { value: 1.0 },
          resolution: { value: new THREE.Vector2() },
          uWarp: { value: 0 },
          uHorizon: { value: 1 },
          uDensity: { value: 1 },
          uSignal: { value: 0.55 },
          uPointer: { value: new THREE.Vector2(0, 0) },
          uRipple: { value: 0 },
          uRippleAt: { value: new THREE.Vector2(0, 0) },
        };

        material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
        });
        scene.add(new THREE.Mesh(geometry, material));

        renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
        // a full-bleed fragment shader at DPR 3 is 9x the work
        // A soft full-bleed gradient field carries no detail that survives
        // supersampling, and this is the most expensive thing on the page
        // while the hero is on screen.
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
        container.appendChild(renderer.domElement);

        const resize = () => {
          const r = container.getBoundingClientRect();
          if (!r.width || !r.height) return;
          renderer.setSize(r.width, r.height, false);
          renderer.domElement.style.width = "100%";
          renderer.domElement.style.height = "100%";
          uniforms.resolution.value.x = renderer.domElement.width;
          uniforms.resolution.value.y = renderer.domElement.height;
          if (reduced) renderer.render(scene, camera);
        };
        resize();
        observer = new ResizeObserver(resize);
        observer.observe(container);

        if (reduced) {
          // a still frame of the arrival state. Complete, not degraded.
          Object.assign(current, SHADER_MODES.hero);
          uniforms.uWarp.value = 0;
          uniforms.uHorizon.value = 1;
          uniforms.uDensity.value = 0.85;
          uniforms.uSignal.value = 0.5;
          renderer.render(scene, camera);
          return;
        }

        const ease = (a, b, k) => a + (b - a) * k;

        // Skip the work, keep the loop alive. The canvas belongs to the
        // hero; once the hero is off screen there is nothing to draw, and
        // a full-viewport WebGL render every frame behind sections nobody
        // can see through is pure cost.
        // Observe the container, not a `canvas` binding: there is no such
        // variable in this scope, and referencing one threw a ReferenceError
        // that the .catch() below swallowed - which killed the field
        // entirely instead of merely gating it.
        let visible = true;
        const io =
          typeof IntersectionObserver !== "undefined"
            ? new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: "120px 0px" })
            : null;
        if (io) io.observe(container);
        cleanupIO = () => io && io.disconnect();

        const animate = () => {
          frame = requestAnimationFrame(animate);
          if (!visible) return;

          // uniforms chase their targets, so a mode change grades in
          current.warp = ease(current.warp, target.warp, 0.06);
          current.horizon = ease(current.horizon, target.horizon, 0.04);
          current.density = ease(current.density, target.density, 0.05);
          current.signal = ease(current.signal, target.signal, 0.05);
          current.speed = ease(current.speed, target.speed, 0.07);
          current.px = ease(current.px, target.px, 0.08);
          current.py = ease(current.py, target.py, 0.08);

          const age = (performance.now() - rippleStart) / 900;
          const ripple = rippleStart && age < 1 ? 1 - age : 0;

          uniforms.time.value += 0.05 * current.speed;
          uniforms.uWarp.value = current.warp;
          uniforms.uHorizon.value = current.horizon;
          uniforms.uDensity.value = current.density;
          uniforms.uSignal.value = current.signal;
          uniforms.uPointer.value.set(current.px, current.py);
          uniforms.uRipple.value = ripple;
          uniforms.uRippleAt.value.set(target.rippleX, target.rippleY);

          renderer.render(scene, camera);
        };
        animate();
      })
      .catch((err) => {
        // Still degrades to the carbon ground painted by CSS - but it no
        // longer does it silently. A swallowed error here looks exactly
        // like a design decision to remove the hero background.
        // eslint-disable-next-line no-console
        console.error("[ShaderAnimation] hero field failed to start:", err);
      });

    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      if (cleanupIO) cleanupIO();
      if (observer) observer.disconnect();
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (renderer) {
        renderer.forceContextLoss?.();
        renderer.dispose();
        renderer.domElement?.remove();
      }
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    layerEl = el;
    return () => {
      if (layerEl === el) layerEl = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`${fixed ? "fixed" : "absolute"} inset-0 ${className}`}
    />
  );
}

export default ShaderAnimation;
