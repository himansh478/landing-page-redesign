'use client';

import { useEffect, useRef } from 'react';

// Decorative WebGL "ink on paper": domain-warped fBm noise where editorial
// blue bleeds into ivory, coral streaks mark the folds (the editor's grease
// pencil), and a light film grain sits on top. The cursor tugs the field.
//
// Performance discipline: one fullscreen triangle, DPR capped at 2, render
// loop paused when off-screen or the tab is hidden, a single static frame
// under prefers-reduced-motion, and everything is disposed on unmount.

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_paper;
uniform vec3 u_ink;
uniform vec3 u_blue;
uniform vec3 u_coral;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.02 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  vec2 m = vec2(u_mouse.x * aspect, u_mouse.y);
  float t = u_time * 0.035;

  float d = length(p - m);
  vec2 pull = (m - p) * exp(-d * 3.0) * 0.7;

  vec2 q = vec2(fbm(p * 1.6 + t), fbm(p * 1.6 + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p * 1.9 + 3.0 * q + vec2(1.7, 9.2) + t * 1.3 + pull),
                fbm(p * 1.9 + 3.0 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p * 2.2 + 3.5 * r);

  vec3 col = u_paper;
  col = mix(col, u_blue, smoothstep(0.50, 0.80, f) * 0.88);
  float fold = smoothstep(0.60, 0.645, r.x) * (1.0 - smoothstep(0.66, 0.73, r.x));
  col = mix(col, u_coral, fold * 0.92);
  col = mix(col, u_ink, smoothstep(0.80, 0.96, f) * 0.75);

  float grain = hash(gl_FragCoord.xy + floor(u_time * 24.0)) - 0.5;
  col += grain * 0.04;

  gl_FragColor = vec4(col, 1.0);
}
`;

const hexToVec3 = (hex: string): [number, number, number] => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function InkShader({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // A fresh canvas per mount: cleanup force-loses its context to free GPU
    // memory, and a lost context can't be reused (React dev mounts twice).
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'display:block;width:100%;height:100%';
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return;
    host.appendChild(canvas);

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      canvas.remove();
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.remove();
      return;
    }
    gl.useProgram(program);

    // One triangle that covers the viewport.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uRes = u('u_res');
    const uTime = u('u_time');
    const uMouse = u('u_mouse');
    gl.uniform3fv(u('u_paper'), hexToVec3('#F4F1EB'));
    gl.uniform3fv(u('u_ink'), hexToVec3('#13212E'));
    gl.uniform3fv(u('u_blue'), hexToVec3('#226192'));
    gl.uniform3fv(u('u_coral'), hexToVec3('#EF8557'));

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mouse = { x: 0.65, y: 0.45, tx: 0.65, ty: 0.45 };
    const start = performance.now();
    let raf = 0;
    let onScreen = true;

    const draw = (now: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      gl.uniform1f(uTime, reduce ? 12 : (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };

    const play = () => {
      if (reduce || raf || !onScreen || document.hidden) return;
      raf = requestAnimationFrame(loop);
    };
    const pause = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      if (reduce || !raf) draw(performance.now());
    };

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 120);
    });
    ro.observe(canvas);
    resize();

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) play();
      else pause();
    });
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? pause() : play());
    document.addEventListener('visibilitychange', onVisibility);

    // If the GPU drops the context, stop drawing and let the static
    // composition underneath show through.
    const onLost = (e: Event) => {
      e.preventDefault();
      pause();
      canvas.style.visibility = 'hidden';
    };
    canvas.addEventListener('webglcontextlost', onLost);

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      mouse.ty = Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height));
    };
    if (!reduce) window.addEventListener('pointermove', onPointer, { passive: true });

    play();

    return () => {
      pause();
      window.clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
      canvas.removeEventListener('webglcontextlost', onLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
