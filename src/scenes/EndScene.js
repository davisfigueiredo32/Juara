import Phaser from 'phaser';
import criarBotao from '../ui/criarBotao.js';
import { NIVEL_MAXIMO } from '../config/Niveis.js';

export default class EndScene extends Phaser.Scene {
  constructor() {
    super('EndScene');
  }

  init(dados) {
    this.dados = dados || {};
  }

  create() {
    const d = this.dados;
    const vitoria = d.vitoria === true;
    const estat = d.estat || { lixo: 0, inimigos: 0, tempo: 0 };
    const centroX = this.scale.width / 2;

    this.cameras.main.fadeIn(400);

    this.add.tileSprite(400, 300, 800, 600, vitoria ? 'grama' : 'grama_suja');
    this.add.rectangle(400, 300, 800, 600, vitoria ? 0x0b3a3a : 0x2a1a3d, 0.55);

    const titulo = vitoria ? 'LAGOA RESTAURADA!' : 'A POLUIÇÃO VENCEU...';
    const corTitulo = vitoria ? '#b8f5d0' : '#ffb3b3';

    this.add.text(centroX, 60, titulo, {
      fontFamily: 'monospace',
      fontSize: '44px',
      color: corTitulo,
      stroke: '#0b1f2a',
      strokeThickness: 7
    }).setOrigin(0.5);

    const juara = this.add.sprite(60, 60, 'juara_baixo_0').setScale(3);
    juara.play('juara_baixo');

    if (vitoria) {
      this.add.image(740, 60, 'flor_amarela').setScale(3);
    } else {
      this.add.sprite(740, 60, 'lodo_0').setScale(2.5).play('lodo_pulsar');
    }

    const linha1 = (vitoria ? 'Nível final: ' : 'Nível alcançado: ') + (d.nivel || 1) + '/' + NIVEL_MAXIMO +
      '     Pontos: ' + (d.pontos || 0) + '     Recorde: ' + (d.recorde || 0);
    const linha2 = 'Lixo recolhido: ' + estat.lixo + '     Monstros derrotados: ' + estat.inimigos +
      '     Tempo: ' + estat.tempo + 's';

    this.add.text(centroX, 112, linha1, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffe082',
      stroke: '#0b1f2a',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(centroX, 136, linha2, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#0b1f2a',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.rectangle(400, 340, 700, 330, 0x0b1f2a, 0.7);

    const mensagem = vitoria
      ? 'Graças à Juara, a lagoa voltou a respirar: a água está limpa, a vegetação renasceu e os animais estão a salvo.\n\n' +
        'Na vida real, a natureza também depende de nós. Descarte o lixo no lugar certo, nunca jogue resíduos em rios e lagoas, ' +
        'reduza o uso de plástico e ajude a proteger os habitats ao seu redor.\n\n' +
        'Pequenas atitudes de cada pessoa salvam ecossistemas inteiros.'
      : 'Mas a luta pela natureza não termina aqui. Toda lagoa merece uma nova chance.\n\n' +
        'Na vida real, o lixo jogado na rua ou nos rios chega às lagoas e ao mar e prejudica os animais e as plantas. ' +
        'Descartar corretamente e reduzir o plástico faz toda a diferença.\n\n' +
        'Tente novamente e proteja a Lagoa Juara!';

    this.add.text(centroX, 340, mensagem, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 640 }
    }).setOrigin(0.5);

    const rotulo = vitoria ? 'JOGAR DE NOVO' : 'TENTAR NÍVEL ' + (d.nivel || 1);

    criarBotao(this, centroX - 150, 545, rotulo, () => {
      if (vitoria) {
        this.scene.start('GameScene', { nivel: 1 });
      } else {
        this.scene.start('GameScene', d.tentarNovamente || { nivel: 1 });
      }
    });

    criarBotao(this, centroX + 200, 545, 'MENU', () => {
      this.scene.start('MenuScene');
    }, '#3b6ea5', '#4d88c9');
  }
}