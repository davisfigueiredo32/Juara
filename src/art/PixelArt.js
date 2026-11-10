export function ruido(x, y, semente) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(semente, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = h ^ (h >>> 16);
  return (h >>> 0) / 4294967296;
}

export function desenharMapa(scene, chave, mapa, paleta, escala = 2) {
  if (scene.textures.exists(chave)) return;

  const altura = mapa.length;
  const largura = Math.max(...mapa.map((linha) => linha.length));
  const textura = scene.textures.createCanvas(chave, largura * escala, altura * escala);
  const ctx = textura.getContext();

  for (let y = 0; y < altura; y++) {
    for (let x = 0; x < mapa[y].length; x++) {
      const letra = mapa[y][x];
      if (letra === '.' || letra === ' ') continue;
      const cor = paleta[letra];
      if (!cor) continue;
      ctx.fillStyle = cor;
      ctx.fillRect(x * escala, y * escala, escala, escala);
    }
  }

  textura.refresh();
}

export function espelhar(mapa) {
  return mapa.map((linha) => linha.split('').reverse().join(''));
}

export function deslocar(mapa, dy) {
  const largura = Math.max(...mapa.map((linha) => linha.length));
  const vazias = [];
  for (let i = 0; i < dy; i++) vazias.push('.'.repeat(largura));
  return vazias.concat(mapa.slice(0, mapa.length - dy));
}

// cores: [base, clara, destaque, escura]
export function gerarTile(scene, chave, cores, semente) {
  if (scene.textures.exists(chave)) return;

  const celulas = 16;
  const escala = 2;
  const textura = scene.textures.createCanvas(chave, celulas * escala, celulas * escala);
  const ctx = textura.getContext();

  for (let y = 0; y < celulas; y++) {
    for (let x = 0; x < celulas; x++) {
      const r = ruido(x, y, semente);
      let cor = cores[0];
      if (r > 0.9) cor = cores[2];
      else if (r > 0.72) cor = cores[1];
      else if (r < 0.07) cor = cores[3];
      ctx.fillStyle = cor;
      ctx.fillRect(x * escala, y * escala, escala, escala);
    }
  }

  textura.refresh();
}

export function gerarLagoa(scene, chave, limpa) {
  if (scene.textures.exists(chave)) return;

  const celula = 4;
  const colunas = 100;
  const linhas = 70;
  const textura = scene.textures.createCanvas(chave, colunas * celula, linhas * celula);
  const ctx = textura.getContext();

  const areia = limpa ? ['#e8d9a0', '#dccb8a', '#f0e4b4'] : ['#c9b87a', '#b9a76a', '#d5c58a'];
  const agua = limpa
    ? ['#2a7fbf', '#3a92d1', '#1f6fae', '#6bb8e8']
    : ['#5b6b3a', '#6b7a44', '#435028', '#7a5a2a'];
  const espuma = limpa ? '#8fd3f4' : '#9aa06a';

  for (let cy = 0; cy < linhas; cy++) {
    for (let cx = 0; cx < colunas; cx++) {
      const dx = cx + 0.5 - colunas / 2;
      const dy = cy + 0.5 - linhas / 2;

      const nAreia = Math.sqrt((dx / 47.5) ** 2 + (dy / 32.5) ** 2);
      if (nAreia > 1) continue;

      const nAgua = Math.sqrt((dx / 42.5) ** 2 + (dy / 27.5) ** 2);
      const r = ruido(cx, cy, limpa ? 11 : 22);

      let cor;
      if (nAgua > 1) {
        cor = areia[r < 0.6 ? 0 : r < 0.85 ? 1 : 2];
      } else if (nAgua > 0.92) {
        cor = espuma;
      } else {
        cor = agua[r < 0.55 ? 0 : r < 0.8 ? 1 : r < 0.94 ? 2 : 3];
      }

      ctx.fillStyle = cor;
      ctx.fillRect(cx * celula, cy * celula, celula, celula);
    }
  }

  textura.refresh();
}