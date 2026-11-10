import Phaser from 'phaser';
import criarBotao from '../ui/criarBotao.js';

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
    const centroX = this.scale.width / 2;

    this.cameras.main.fadeIn(400);

    this.add.tileSprite(400, 300, 800, 600, vitoria ? 'grama' : 'grama_suja');
    this.add.rectangle(400, 300, 800, 600, vitoria ? 0x0b3a3a : 0x2a1a3d, 0.55);

    const titulo = vitoria ? 'LAGOA RESTAURADA!' : 'A POLUIÇÃO VENCEU...';
    const corTitulo = vitoria ? '#b8f5d0' : '#ffb3b3';

    this.add.text(centroX, 70, titulo, {
      fontFamily: 'monospace',
      fontSize: '44px',
      color: corTitulo,
      stroke: '#0b1f2a',
      strokeThickness: 7
    }).setOrigin(0.5);

    const juara = this.add.sprite(60, 70, 'juara_baixo_0').setScale(3);
    juara.play('juara_baixo');

    if (vitoria) {
      this.add.image(740, 70, 'flor_amarela').setScale(3);
    } else {
      this.add.sprite(740, 70, 'lodo_0').setScale(2.5).play('lodo_pulsar');
    }

    const resumo = 'Lixo recolhido: ' + (d.lixo || 0) + '/' + (d.totalLixo || 0) +
      '     Lodos derrotados: ' + (d.derrotados || 0) + '/' + (d.totalInimigos || 0) +
      '     Tempo: ' + (d.tempo || 0) + 's';

    this.add.text(centroX, 130, resumo, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#0b1f2a',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.rectangle(400, 330, 700, 330, 0x0b1f2a, 0.7);

    const mensagem = vitoria
      ? 'Graças à Juara, a lagoa voltou a respirar: a água está limpa, a vegetação renasceu e os animais estão a salvo.\n\n' +
        'Na vida real, a natureza também depende de nós. Descarte o lixo no lugar certo, nunca jogue resíduos em rios e lagoas, ' +
        'reduza o uso de plástico e ajude a proteger os habitats ao seu redor.\n\n' +
        'Pequenas atitudes de cada pessoa salvam ecossistemas inteiros.'
      : 'Mas a luta pela natureza não termina aqui. Toda lagoa merece uma nova chance.\n\n' +
        'Na vida real, o lixo jogado na rua ou nos rios chega às lagoas e ao mar e prejudica os animais e as plantas. ' +
        'Descartar corretamente e reduzir o plástico faz toda a diferença.\n\n' +
        'Tente novamente e proteja a Lagoa Juara!';

    this.add.text(centroX, 330, mensagem, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 640 }
    }).setOrigin(0.5);

    criarBotao(this, centroX - 150, 540, vitoria ? 'JOGAR DE NOVO' : 'TENTAR DE NOVO', () => {
      this.scene.start('GameScene');
    });

    criarBotao(this, centroX + 190, 540, 'MENU', () => {
      this.scene.start('MenuScene');
    }, '#3b6ea5', '#4d88c9');
  }
}