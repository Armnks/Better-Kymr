let audioCtx = null;
let master = null;

export function startAmbient() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  master = audioCtx.createGain();
  master.gain.value = 0;
  master.connect(audioCtx.destination);

  const lp = audioCtx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 180;
  lp.Q.value = 0.4;
  lp.connect(master);

  [55, 55.4, 110.2].forEach((f, i) => {
    const o = audioCtx.createOscillator();
    o.type = i === 2 ? "sine" : "triangle";
    o.frequency.value = f;
    const g = audioCtx.createGain();
    g.gain.value = i === 2 ? 0.16 : 0.28;
    o.connect(g);
    g.connect(lp);
    o.start();
  });

  const len = audioCtx.sampleRate * 4;
  const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    d[i] = last * 3.2;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;
  const nf = audioCtx.createBiquadFilter();
  nf.type = "lowpass";
  nf.frequency.value = 240;
  const ng = audioCtx.createGain();
  ng.gain.value = 0.05;
  noise.connect(nf);
  nf.connect(ng);
  ng.connect(master);
  noise.start();

  const breath = audioCtx.createOscillator();
  breath.frequency.value = 0.07;
  const breathGain = audioCtx.createGain();
  breathGain.gain.value = 0.012;
  breath.connect(breathGain);
  breathGain.connect(master.gain);
  breath.start();

  const drift = audioCtx.createOscillator();
  drift.frequency.value = 0.045;
  const driftGain = audioCtx.createGain();
  driftGain.gain.value = 60;
  drift.connect(driftGain);
  driftGain.connect(lp.frequency);
  drift.start();

  master.gain.setTargetAtTime(0.05, audioCtx.currentTime, 1.4);
}

export function stopAmbient() {
  if (!audioCtx) return;
  const ctx = audioCtx;
  audioCtx = null;
  master.gain.setTargetAtTime(0, ctx.currentTime, 0.8);
  setTimeout(() => ctx.close(), 3000);
}

export function swellAmbient() {
  if (!audioCtx || !master) return;
  master.gain.setTargetAtTime(0.075, audioCtx.currentTime, 0.12);
  master.gain.setTargetAtTime(0.05, audioCtx.currentTime + 0.5, 1.8);
}
