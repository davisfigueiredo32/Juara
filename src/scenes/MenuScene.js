import Phaser from 'phaser';
import criarBotao from '../ui/criarBotao.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const centroX = this.scale.width / 2;
    this.cameras.main.fadeIn(400);

    this.add.tileSprite(400, 300, 800, 600, 'grama');
    this.add.image(400, 560, 'lagoa_limpa').setScale(1.2);
    this.add.rectangle(400, 300, 800, 600, 0x0b1f2a, 0.35);

    const juara = this.add.sprite(140, 380, 'juara_baixo_0').setScale(4);
    juara.play('juara_baixo');

    const lodo = this.add.sprite(660, 380, 'lodo_0').setScale(4);
    lodo.play('lodo_pulsar');

    this.tweens.add({
      targets: [juara, lodo],
      y: 372,
      duration: 700,
      yoyo: true,
      repeat: -1
    });

    this.add.text(centroX, 110, 'Juara', {
      fontFamily: 'monospace',
      fontSize: '80px',
      color: '#ffffff',
      stroke: '#0b1f2a',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(centroX, 185, 'A Guardiã da Lagoa', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#bfe8d0',
      stroke: '#0b1f2a',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(centroX, 265,
      'A Lagoa Juara está poluída.\nRecolha o lixo e derrote os Lodos Poluídos\npara restaurar o equilíbrio da natureza.', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
        stroke: '#0b1f2a',
        strokeThickness: 4,
        align: 'center'
      }).setOrigin(0.5);

    criarBotao(this, centroX, 370, 'INICIAR', () => this.iniciar());

    this.add.text(centroX, 470,
      'Mover: setas ou W A S D   |   Lança: ESPAÇO   |   Onda Purificadora: E\nCelular: joystick e botões na tela', {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#ffffff',
        stroke: '#0b1f2a',
        strokeThickness: 4,
        align: 'center'
      }).setOrigin(0.5);

    this.input.keyboard.once('keydown-ENTER', () => this.iniciar());
  }

  iniciar() {
    this.scene.start('GameScene');
  }
}