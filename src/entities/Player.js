import Phaser from 'phaser';
import { explosao } from '../art/Efeitos.js';
import { Som } from '../audio/SomJogo.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'juara_baixo_0');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(10);
    this.body.setSize(18, 14);
    this.body.setOffset(7, 18);
    this.body.setCollideWorldBounds(true);

    this.sombra = scene.add.ellipse(x, y + 14, 22, 8, 0x000000, 0.28).setDepth(7);

    this.velocidade = 170;

    this.setas = scene.input.keyboard.createCursorKeys();
    this.teclas = scene.input.keyboard.addKeys('W,A,S,D');

    this.teclaAtaque = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.teclaOnda = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.direcaoFrente = new Phaser.Math.Vector2(0, 1);
    this.tempoUltimoAtaque = 0;
    this.intervaloAtaque = 400;
    this.danoLanca = 1;
    this.lanca = null;

    this.intervaloOnda = 4000;
    this.tempoUltimaOnda = -10000;

    this.vidaMaxima = 5;
    this.vida = this.vidaMaxima;
    this.invulneravelAte = 0;
    this.atordoadoAte = 0;
  }

  nomeDirecao() {
    const f = this.direcaoFrente;
    if (Math.abs(f.x) > Math.abs(f.y)) {
      return f.x > 0 ? 'direita' : 'esquerda';
    }
    return f.y > 0 ? 'baixo' : 'cima';
  }

  atualizar() {
    const agora = this.scene.time.now;
    const toque = this.scene.controleToque;

    this.sombra.setPosition(this.x, this.y + 14);

    if (agora < this.invulneravelAte) {
      this.setAlpha(Math.floor(agora / 100) % 2 === 0 ? 0.35 : 1);
    } else {
      this.setAlpha(1);
    }

    if (agora < this.atordoadoAte) return;

    let dx = 0;
    let dy = 0;

    if (this.setas.left.isDown || this.teclas.A.isDown) dx -= 1;
    if (this.setas.right.isDown || this.teclas.D.isDown) dx += 1;
    if (this.setas.up.isDown || this.teclas.W.isDown) dy -= 1;
    if (this.setas.down.isDown || this.teclas.S.isDown) dy += 1;

    if (toque && toque.ativo && (toque.dx !== 0 || toque.dy !== 0)) {
      dx = toque.dx;
      dy = toque.dy;
    }

    const direcao = new Phaser.Math.Vector2(dx, dy);
    direcao.normalize();

    if (dx !== 0 || dy !== 0) {
      this.direcaoFrente.set(direcao.x, direcao.y);
    }

    this.body.setVelocity(direcao.x * this.velocidade, direcao.y * this.velocidade);

    const nome = this.nomeDirecao();
    if (dx !== 0 || dy !== 0) {
      this.anims.play('juara_' + nome, true);
    } else {
      this.anims.stop();
      this.setTexture('juara_' + nome + '_0');
    }

    const quiserAtacar = Phaser.Input.Keyboard.JustDown(this.teclaAtaque) ||
      (toque && toque.ativo && toque.consumirAtaque());
    if (quiserAtacar) {
      this.atacar();
    }

    const quiserOnda = Phaser.Input.Keyboard.JustDown(this.teclaOnda) ||
      (toque && toque.ativo && toque.consumirOnda());
    if (quiserOnda) {
      this.usarOnda();
    }
  }

  atacar() {
    const agora = this.scene.time.now;

    if (agora - this.tempoUltimoAtaque < this.intervaloAtaque) return;
    if (this.lanca) return;

    this.tempoUltimoAtaque = agora;
    Som.ataque();

    const alcance = 34;
    const lx = this.x + this.direcaoFrente.x * alcance;
    const ly = this.y + this.direcaoFrente.y * alcance;

    const lanca = this.scene.add.image(lx, ly, 'lanca');
    lanca.setDepth(11);
    lanca.setRotation(Math.atan2(this.direcaoFrente.y, this.direcaoFrente.x));
    lanca.atingidos = new Set();
    this.lanca = lanca;

    this.scene.tweens.add({
      targets: lanca,
      x: lx + this.direcaoFrente.x * 10,
      y: ly + this.direcaoFrente.y * 10,
      duration: 120
    });

    this.scene.time.delayedCall(120, () => {
      lanca.destroy();
      this.lanca = null;
    });
  }

  usarOnda() {
    const agora = this.scene.time.now;

    if (agora - this.tempoUltimaOnda < this.intervaloOnda) return;

    this.tempoUltimaOnda = agora;
    Som.onda();

    const raio = 130;

    const anel = this.scene.add.circle(this.x, this.y, 10, 0x6bd5ff, 0.25)
      .setStrokeStyle(4, 0xbff3ff)
      .setDepth(12);

    this.scene.tweens.add({
      targets: anel,
      scale: raio / 10,
      alpha: 0,
      duration: 450,
      onComplete: () => anel.destroy()
    });

    explosao(this.scene, this.x, this.y, [0x6bd5ff, 0xbff3ff, 0x2a9df4], 16);

    this.scene.aplicarOnda(this.x, this.y, raio);
  }

  ondaRestante() {
    const passado = this.scene.time.now - this.tempoUltimaOnda;
    return Math.max(0, this.intervaloOnda - passado);
  }

  curar(quantidade) {
    this.vida = Math.min(this.vidaMaxima, this.vida + quantidade);
  }

  receberDano(origemX, origemY, dano = 1) {
    const agora = this.scene.time.now;

    if (agora < this.invulneravelAte) return;

    this.vida -= dano;
    this.invulneravelAte = agora + 1000;
    this.atordoadoAte = agora + 200;
    Som.dano();

    const empurrao = new Phaser.Math.Vector2(this.x - origemX, this.y - origemY);
    empurrao.normalize();
    this.body.setVelocity(empurrao.x * 240, empurrao.y * 240);

    this.scene.cameras.main.shake(120, 0.005);
    explosao(this.scene, this.x, this.y, [0xe53935, 0xff8a80], 8);
  }
}