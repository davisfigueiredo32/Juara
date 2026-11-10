import Phaser from 'phaser';
import { explosao } from '../art/Efeitos.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'lodo_0');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(9);
    this.body.setSize(22, 18);
    this.body.setOffset(5, 9);
    this.body.setCollideWorldBounds(true);

    this.sombra = scene.add.ellipse(x, y + 13, 26, 8, 0x000000, 0.28).setDepth(7);
    this.once('destroy', () => this.sombra.destroy());

    this.anims.play('lodo_pulsar');

    this.vida = 3;
    this.velocidade = 70;
    this.raioVisao = 260;
    this.atordoadoAte = 0;
  }

  atualizar(alvo) {
    const agora = this.scene.time.now;

    this.sombra.setPosition(this.x, this.y + 13);

    if (agora < this.atordoadoAte) return;

    const distancia = Phaser.Math.Distance.Between(this.x, this.y, alvo.x, alvo.y);

    if (distancia < this.raioVisao) {
      const direcao = new Phaser.Math.Vector2(alvo.x - this.x, alvo.y - this.y);
      direcao.normalize();
      this.body.setVelocity(direcao.x * this.velocidade, direcao.y * this.velocidade);
    } else {
      this.body.setVelocity(0, 0);
    }
  }

  receberDano(direcao) {
    this.vida -= 1;
    this.atordoadoAte = this.scene.time.now + 250;
    this.body.setVelocity(direcao.x * 220, direcao.y * 220);
    this.setTintFill(0xffffff);

    if (this.vida <= 0) {
      explosao(this.scene, this.x, this.y, [0x6a4c93, 0xb4e33d, 0xa587d1], 16);
      this.destroy();
      return;
    }

    explosao(this.scene, this.x, this.y, [0xb4e33d, 0xa587d1], 5);

    this.scene.time.delayedCall(100, () => {
      if (this.active) {
        this.clearTint();
      }
    });
  }
}