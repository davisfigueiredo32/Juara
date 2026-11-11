import Phaser from 'phaser';
import criarBotao from '../ui/criarBotao.js';
import { Som } from '../audio/SomJogo.js';
import { lerRecorde } from '../config/Recorde.js';

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

    const espuma = this.add.sprite(560, 440, 'espuma_0').setScale(2.5);
    espuma.play('espuma_anim');

    const atirador = this.add.sprite(250, 440, 'atirador_0').setScale(2.5);
    atirador.play('atirador_anim');

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

    this.add.text(centroX, 262,
      'A Lagoa Juara está poluída.\nRecolha o lixo e derrote os monstros da poluição\nem 8 níveis para restaurar o equilíbrio da natureza.', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
        stroke: '#0b1f2a',
        strokeThickness: 4,
        align: 'center'
      }).setOrigin(0.5);

    criarBotao(this, centroX, 360, 'INICIAR', () => this.iniciar());

    const recorde = lerRecorde();
    if (recorde > 0) {
      this.add.text(centroX, 410, 'RECORDE: ' + recorde + ' pontos', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffe082',
        stroke: '#0b1f2a',
        strokeThickness: 4
      }).setOrigin(0.5);
    }

    this.add.text(centroX, 500,
      'Mover: setas ou W A S D  |  Lança: ESPAÇO  |  Onda Purificadora: E\nPausa: P ou ESC  |  Som: M  |  Celular: joystick e botões na tela', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
        stroke: '#0b1f2a',
        strokeThickness: 4,
        align: 'center'
      }).setOrigin(0.5);

    this.input.keyboard.once('keydown-ENTER', () => this.iniciar());
  }

  iniciar() {
    Som.clique();
    Som.iniciarMusica();
    this.scene.start('GameScene', { nivel: 1 });
  }
}