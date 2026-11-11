import { desenharMapa, deslocar } from './PixelArt.js';

const ESPUMA = [
  '................',
  '................',
  '.....oo..oo.....',
  '....oEEooEEo....',
  '...oEEEEEEEEo...',
  '..oEEwEEEEwEEo..',
  '..oEEkEEEEkEEo..',
  '..oEEEEEEEEEEo..',
  '..oEEEmmmmEEEo..',
  '...oEEEEEEEEo...',
  '..oEoEEEEEEoEo..',
  '..ooEoEooEoEoo..',
  '....o.o..o.o....',
  '................',
  '................',
  '................'
];
const PALETA_ESPUMA = { o: '#3a4a12', E: '#c8f04a', w: '#ffffff', k: '#1a1a2e', m: '#7a2d8f' };

const ATIRADOR = [
  '................',
  '.......oo.......',
  '......oKKo......',
  '.......oo.......',
  '....oooooooo....',
  '...okkkkkkkko...',
  '..okkKkkkkkkko..',
  '..okkwwwwwwkko..',
  '..okkwwrrwwkko..',
  '..okkwwrrwwkko..',
  '..okkkwwwwkkko..',
  '..okkkkkkkkkko..',
  '.ookkkkkkkkkkoo.',
  '.okkoookkoookko.',
  '..o..o....o..o..',
  '................'
];
const PALETA_ATIRADOR = { o: '#0a0a14', k: '#23233a', K: '#46466a', w: '#ffffff', r: '#e53935' };

const BRUTO = [
  '................',
  '...oooooooooo...',
  '..oBBBBggBBBBo..',
  '.oBBbbbbbbbbBBo.',
  '.obbrrbbbbrrbbo.',
  '.obbrwbbbbrwbbo.',
  '.obbbbbbbbbbbbo.',
  '.obbkkkkkkkkbbo.',
  'ooBbbbbbbbbbBoo.',
  'oBBbddbbbbddbBBo',
  'oBBbddbbbbddbBBo',
  'ooBbbbbbbbbbbBoo',
  '.oddbbbooobbddo.',
  '..ooo......ooo..',
  '................',
  '................'
];
const PALETA_BRUTO = {
  o: '#2b1f14', b: '#6b5a45', B: '#8c7a60', d: '#4a3d2c', g: '#9be7ff', r: '#e53935', w: '#ffffff', k: '#1a1a2e'
};

export function criarTexturasInimigos(scene) {
  desenharMapa(scene, 'espuma_0', ESPUMA, PALETA_ESPUMA, 2);
  desenharMapa(scene, 'espuma_1', deslocar(ESPUMA, 1), PALETA_ESPUMA, 2);

  desenharMapa(scene, 'atirador_0', ATIRADOR, PALETA_ATIRADOR, 2);
  desenharMapa(scene, 'atirador_1', deslocar(ATIRADOR, 1), PALETA_ATIRADOR, 2);

  desenharMapa(scene, 'bruto_0', BRUTO, PALETA_BRUTO, 2);
  desenharMapa(scene, 'bruto_1', deslocar(BRUTO, 1), PALETA_BRUTO, 2);
}

export function criarAnimacoesInimigos(scene) {
  const lista = [
    { nome: 'espuma', fps: 6 },
    { nome: 'atirador', fps: 3 },
    { nome: 'bruto', fps: 2 }
  ];

  for (const item of lista) {
    const chave = item.nome + '_anim';
    if (scene.anims.exists(chave)) continue;
    scene.anims.create({
      key: chave,
      frames: [{ key: item.nome + '_0' }, { key: item.nome + '_1' }],
      frameRate: item.fps,
      repeat: -1
    });
  }
}