let ctx = null;
let mestre = null;
let mudo = false;
let musicaLigada = false;
let timerMusica = null;
let proximoTempo = 0;
let passo = 0;

const MELODIA = [
  440, 0, 523.25, 0, 659.25, 523.25, 0, 587.33,
  523.25, 0, 440, 0, 392, 440, 0, 0,
  392, 0, 440, 0, 523.25, 440, 0, 392,
  329.63, 0, 392, 0, 440, 0, 0, 0
];
const BAIXO = [110, 87.31, 130.81, 98];

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch (e) {
      return null;
    }
    mestre = ctx.createGain();
    mestre.gain.value = mudo ? 0 : 0.6;
    mestre.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

function tom(freq, dur, op = {}) {
  const c = audio();
  if (!c || mudo) return;
  const { tipo = 'square', vol = 0.2, fim = null, atraso = 0 } = op;
  const t = c.currentTime + Math.max(0, atraso);

  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, t);
  if (fim) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, fim), t + dur);
  }
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  osc.connect(g);
  g.connect(mestre);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}

function ruido(dur, op = {}) {
  const c = audio();
  if (!c || mudo) return;
  const { vol = 0.15, filtro = 1500, tipoFiltro = 'lowpass', atraso = 0 } = op;
  const t = c.currentTime + Math.max(0, atraso);

  const n = Math.max(1, Math.floor(c.sampleRate * dur));
  const buffer = c.createBuffer(1, n, c.sampleRate);
  const dados = buffer.getChannelData(0);
  for (let i = 0; i < n; i++) {
    dados[i] = Math.random() * 2 - 1;
  }

  const fonte = c.createBufferSource();
  fonte.buffer = buffer;
  const f = c.createBiquadFilter();
  f.type = tipoFiltro;
  f.frequency.value = filtro;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  fonte.connect(f);
  f.connect(g);
  g.connect(mestre);
  fonte.start(t);
}

function agendarMusica() {
  const c = ctx;
  if (!c || !musicaLigada) return;

  while (proximoTempo < c.currentTime + 0.4) {
    if (proximoTempo < c.currentTime) {
      proximoTempo = c.currentTime + 0.05;
    }

    if (!mudo) {
      const atraso = proximoTempo - c.currentTime;
      const nota = MELODIA[passo % MELODIA.length];
      if (nota) {
        tom(nota, 0.28, { tipo: 'triangle', vol: 0.06, atraso });
      }
      if (passo % 4 === 0) {
        const baixo = BAIXO[Math.floor(passo / 4) % BAIXO.length];
        tom(baixo, 1.0, { tipo: 'sine', vol: 0.08, atraso });
      }
    }

    proximoTempo += 0.3;
    passo += 1;
  }
}

function sequencia(notas, dur, op = {}) {
  notas.forEach((freq, i) => {
    tom(freq, dur, { ...op, atraso: i * dur * 0.8 });
  });
}

export const Som = {
  clique() {
    tom(660, 0.06, { tipo: 'square', vol: 0.12 });
  },
  ataque() {
    ruido(0.12, { vol: 0.12, filtro: 2500, tipoFiltro: 'highpass' });
    tom(520, 0.1, { tipo: 'sawtooth', vol: 0.08, fim: 200 });
  },
  acerto() {
    tom(240, 0.1, { tipo: 'square', vol: 0.14, fim: 90 });
    ruido(0.06, { vol: 0.12, filtro: 1200 });
  },
  morte() {
    tom(320, 0.3, { tipo: 'sawtooth', vol: 0.14, fim: 50 });
    ruido(0.25, { vol: 0.15, filtro: 900 });
  },
  dano() {
    tom(220, 0.28, { tipo: 'sawtooth', vol: 0.2, fim: 55 });
    ruido(0.15, { vol: 0.12, filtro: 700 });
  },
  coleta() {
    tom(660, 0.08, { tipo: 'sine', vol: 0.18 });
    tom(990, 0.14, { tipo: 'sine', vol: 0.18, atraso: 0.07 });
  },
  cura() {
    sequencia([523, 659, 784], 0.12, { tipo: 'triangle', vol: 0.18 });
  },
  onda() {
    tom(180, 0.5, { tipo: 'sine', vol: 0.22, fim: 900 });
    ruido(0.45, { vol: 0.1, filtro: 1800, tipoFiltro: 'bandpass' });
  },
  tiro() {
    tom(420, 0.14, { tipo: 'square', vol: 0.1, fim: 200 });
  },
  pausa() {
    tom(330, 0.1, { tipo: 'triangle', vol: 0.15 });
    tom(220, 0.12, { tipo: 'triangle', vol: 0.15, atraso: 0.08 });
  },
  nivelInicio() {
    sequencia([392, 523, 659], 0.14, { tipo: 'triangle', vol: 0.16 });
  },
  nivelConcluido() {
    sequencia([523, 659, 784, 1047], 0.16, { tipo: 'triangle', vol: 0.2 });
  },
  vitoriaFinal() {
    sequencia([523, 659, 784, 1047, 784, 1047, 1319], 0.18, { tipo: 'triangle', vol: 0.22 });
  },
  derrota() {
    sequencia([392, 330, 262, 196], 0.28, { tipo: 'sawtooth', vol: 0.14 });
  },

  iniciarMusica() {
    const c = audio();
    if (!c || musicaLigada) return;
    musicaLigada = true;
    proximoTempo = c.currentTime + 0.1;
    passo = 0;
    timerMusica = setInterval(agendarMusica, 120);
  },
  pararMusica() {
    musicaLigada = false;
    if (timerMusica) {
      clearInterval(timerMusica);
      timerMusica = null;
    }
  },
  alternarMudo() {
    mudo = !mudo;
    if (mestre) mestre.gain.value = mudo ? 0 : 0.6;
    return mudo;
  },
  estaMudo() {
    return mudo;
  }
};