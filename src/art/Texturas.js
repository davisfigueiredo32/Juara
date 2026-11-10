import { desenharMapa, espelhar, deslocar, gerarTile, gerarLagoa } from './PixelArt.js';

// ---------- JUARA ----------
const PALETA_JUARA = {
  o: '#0d2b33', h: '#1e6b3a', H: '#3fb36a', s: '#e8b07a', S: '#b97a4c',
  e: '#1a1a2e', g: '#2ea66b', G: '#1b7a4c', b: '#2a9df4', B: '#1a6fb5'
};

const CORPO_FRENTE = [
  '....oooooooo....',
  '...ohHHbbHHho...',
  '..ohHHhhhhHHho..',
  '..ohhsssssshho..',
  '..ohsessssesho..',
  '..ohssssssssho..',
  '...ohssssssho...',
  '..ogggbbbbgggo..',
  '.osgggbbbbgggso.',
  '.osGggggggggGso.',
  '..oggggggggggo..',
  '..oBbBbBbBbBbo..'
];

const CORPO_COSTAS = [
  '....oooooooo....',
  '...ohHHbbHHho...',
  '..ohhHhhhhHhho..',
  '..ohhhhhhhhhho..',
  '..ohhhhhhhhhho..',
  '..ohhHhhhhHhho..',
  '...ohhhhhhhho...',
  '..ogggbbbbgggo..',
  '.osgggbbbbgggso.',
  '.osGggggggggGso.',
  '..oggggggggggo..',
  '..oBbBbBbBbBbo..'
];

const CORPO_LADO = [
  '....oooooooo....',
  '...ohhHHHHhho...',
  '..ohhHhhhhhhho..',
  '..ohhhhsssssso..',
  '..ohhhhsssesso..',
  '..ohhhhsssssso..',
  '...ohhhhssssso..',
  '...oggbbbgggo...',
  '...oggbbbgggso..',
  '...oGgggggggso..',
  '...oggggggggo...',
  '...oBbBbBbBbo...'
];

const PES_FRENTE = [
  ['....sss..sss....', '....sss..sss....', '...oooo..oooo...', '................'],
  ['....sss..sss....', '....sss..oooo...', '....sss.........', '....ooo.........'],
  ['....sss..sss....', '...oooo..sss....', '.........sss....', '.........ooo....']
];

const PES_LADO = [
  ['....sss.sss.....', '....sss.sss.....', '....ooo.ooo.....', '................'],
  ['....sss..sss....', '...sss....sss...', '...ooo....ooo...', '................'],
  ['....sss..sss....', '.....sss.sss....', '.....ooo.ooo....', '................']
];

// ---------- LODO POLUÍDO ----------
const PALETA_LODO = {
  o: '#2a1a3d', p: '#6a4c93', P: '#a587d1', d: '#4a3170',
  g: '#b4e33d', w: '#ffffff', r: '#e53935'
};

const LODO = [
  '................',
  '................',
  '......oooo......',
  '....ooPPppoo....',
  '...oPPPpppppo...',
  '..oPPpppppppdo..',
  '..opwwpppwwpdo..',
  '..opwrpppwrpdo..',
  '..oppppppppddo..',
  '..opppggggpddo..',
  '..opddppppdddo..',
  '.oopdddddddddoo.',
  '.oggooooooooggo.',
  '..g..........g..',
  '................',
  '................'
];

// ---------- LIXO ----------
const GARRAFA = [
  '...rr...',
  '...oo...',
  '..oLLo..',
  '.oLLwLo.',
  '.oLLLLo.',
  '.oLwLLo.',
  '.oLwLLo.',
  '.oLLLLo.',
  '.oLLLLo.',
  '.oLLLLo.',
  '.oLLLLo.',
  '.oLLLLo.',
  '.oLLLLo.',
  '..oooo..'
];
const PALETA_GARRAFA = { o: '#1d4a66', L: '#9be7ff', w: '#ffffff', r: '#e53935' };

const LATA = [
  '..oooo..',
  '.oAaaAo.',
  '.oooooo.',
  '.oaaaao.',
  '.oarrao.',
  '.oarrao.',
  '.oaaaao.',
  '.oAAAAo.',
  '..oooo..'
];
const PALETA_LATA = { o: '#3a3a3a', a: '#c4c4c4', A: '#7a7a7a', r: '#e53935' };

const SACO = [
  '....oooo....',
  '...okKKko...',
  '....oyyo....',
  '..ookkkkoo..',
  '.okkKKkkkko.',
  '.okKKkkkkko.',
  '.okkkkkkkko.',
  '.okkkkkKkko.',
  '.okkkkkkkko.',
  '..ookkkkoo..',
  '...oooooo...'
];
const PALETA_SACO = { o: '#0e0e16', k: '#2b2b3a', K: '#4f4f66', y: '#ffd54f' };

// ---------- CENÁRIO ----------
const ARVORE = [
  '......oooooooo......',
  '....ooollllllmoo....',
  '...ollllllllllmmo...',
  '..ollllllllllllmmo..',
  '.ollllllllllllmmmmo.',
  '.olllllllllllmmmmmdo',
  'ollllllllllllmmmmmdo',
  'olllllllllllmmmmmmdo',
  'ollllllllllmmmmmmddo',
  'olllllllllmmmmmmmddo',
  '.ollllllmmmmmmmmddo.',
  '.ommlmmmmmmmmmmddo..',
  '..ommmmmmmmmmmdddo..',
  '...oodddddddddddoo..',
  '.....oooooooooo.....',
  '.......obbBo........',
  '.......obbBo........',
  '.......obbBo........',
  '......obbbbBo.......',
  '.....obbbbbBBo......',
  '....oooooooooooo....'
];
const PALETA_ARVORE = {
  o: '#14391f', l: '#4caf50', m: '#2e7d32', d: '#1b5e20', b: '#7a5530', B: '#4a321b'
};

const PEDRA = [
  '....oooooooo....',
  '..ooRRRRrrrroo..',
  '.oRRRRrrrrrrrdo.',
  '.oRRrrrrrrrrrdo.',
  'oRrrrrrrrrrrrddo',
  'orrrrrrrrrrrrddo',
  'orrrrrrrrrrrdddo',
  '.odrrrrrrrrdddo.',
  '.oddddddddddddo.',
  '..oooooooooooo..'
];
const PALETA_PEDRA = { o: '#3a3a3a', R: '#b5b5b5', r: '#8d8d8d', d: '#636363' };

const FLOR = [
  '........',
  '...yy...',
  '..yYYy..',
  '..yYYy..',
  '...yy...',
  '....g...',
  '...gg...',
  '....g...'
];

const LANCA = [
  '..........oo....',
  '.ooooooooooLLoo.',
  'obbbbbbbbbbLwwLo',
  '.ooooooooooLLoo.',
  '..........oo....'
];
const PALETA_LANCA = { o: '#3b2410', b: '#a8723a', L: '#2a9df4', w: '#dff6ff' };

// ---------- INTERFACE ----------
const CORACAO = [
  '.ooo.ooo.',
  'orwrrrrro',
  'orrrrrrro',
  'orrrrrrro',
  '.orrrrro.',
  '..orrro..',
  '...oro...',
  '....o....'
];
const PALETA_CORACAO = { o: '#5a0f12', r: '#e53935', w: '#ffcdd2' };

const GOTA = [
  '...o...',
  '..oao..',
  '..oao..',
  '.oaaao.',
  'oaawaao',
  'oaaaaao',
  'oaaaaao',
  '.oaaao.',
  '..ooo..'
];
const PALETA_GOTA = { o: '#0d3a63', a: '#2a9df4', w: '#bff3ff' };

export function criarTodasTexturas(scene) {
  // Juara
  const lados = {
    baixo: [CORPO_FRENTE, PES_FRENTE],
    cima: [CORPO_COSTAS, PES_FRENTE],
    direita: [CORPO_LADO, PES_LADO]
  };

  for (const nome of Object.keys(lados)) {
    const corpo = lados[nome][0];
    const pes = lados[nome][1];
    for (let i = 0; i < 3; i++) {
      const mapa = corpo.concat(pes[i]);
      desenharMapa(scene, 'juara_' + nome + '_' + i, mapa, PALETA_JUARA, 2);
      if (nome === 'direita') {
        desenharMapa(scene, 'juara_esquerda_' + i, espelhar(mapa), PALETA_JUARA, 2);
      }
    }
  }

  // Lodo
  desenharMapa(scene, 'lodo_0', LODO, PALETA_LODO, 2);
  desenharMapa(scene, 'lodo_1', deslocar(LODO, 1), PALETA_LODO, 2);

  // Lixo
  desenharMapa(scene, 'garrafa', GARRAFA, PALETA_GARRAFA, 2);
  desenharMapa(scene, 'lata', LATA, PALETA_LATA, 2);
  desenharMapa(scene, 'saco', SACO, PALETA_SACO, 2);

  // Cenário
  desenharMapa(scene, 'arvore', ARVORE, PALETA_ARVORE, 2);
  desenharMapa(scene, 'pedra', PEDRA, PALETA_PEDRA, 2);
  desenharMapa(scene, 'flor_amarela', FLOR, { y: '#ffd54f', Y: '#ff8f00', g: '#2e7d32' }, 2);
  desenharMapa(scene, 'flor_rosa', FLOR, { y: '#ff8fab', Y: '#ffd54f', g: '#2e7d32' }, 2);
  desenharMapa(scene, 'flor_branca', FLOR, { y: '#ffffff', Y: '#ffd54f', g: '#2e7d32' }, 2);

  gerarTile(scene, 'grama', ['#4caf50', '#58bd5c', '#7fd37f', '#388e3c'], 5);
  gerarTile(scene, 'grama_suja', ['#7d8a52', '#8b975c', '#8a6d3b', '#5a5a38'], 9);
  gerarLagoa(scene, 'lagoa_suja', false);
  gerarLagoa(scene, 'lagoa_limpa', true);

  // Lança e interface
  desenharMapa(scene, 'lanca', LANCA, PALETA_LANCA, 2);
  desenharMapa(scene, 'icone_coracao', CORACAO, PALETA_CORACAO, 2);
  desenharMapa(scene, 'icone_gota', GOTA, PALETA_GOTA, 2);
}

export function criarAnimacoes(scene) {
  for (const nome of ['baixo', 'cima', 'direita', 'esquerda']) {
    if (scene.anims.exists('juara_' + nome)) continue;
    scene.anims.create({
      key: 'juara_' + nome,
      frames: [
        { key: 'juara_' + nome + '_1' },
        { key: 'juara_' + nome + '_0' },
        { key: 'juara_' + nome + '_2' },
        { key: 'juara_' + nome + '_0' }
      ],
      frameRate: 8,
      repeat: -1
    });
  }

  if (!scene.anims.exists('lodo_pulsar')) {
    scene.anims.create({
      key: 'lodo_pulsar',
      frames: [{ key: 'lodo_0' }, { key: 'lodo_1' }],
      frameRate: 3,
      repeat: -1
    });
  }
}