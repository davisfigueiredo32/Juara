import Phaser from 'phaser';
import { explosao } from '../art/Efeitos.js';
import { Som } from '../audio/SomJogo.js';

const TIPOS = {
  lodo: {
    textura: 'lodo_0', anim: 'lodo_pulsar', vida: 3, velocidade: 70, raio: 260, escala: 1,
    corpo: [22, 18], desloc: [5, 9], sombra: [26, 8, 13], pontos: 30, dano: 1, chanceCoracao: 0.15,
    cores: [0x6a4c93, 0xb4e33d, 0xa587d1], empurrao: 220
  },
  espuma: {
    textura: 'espuma_0', anim: 'espuma_anim', vida: 2, velocidade: 125, raio: 340, escala: 1,
    corpo: [20, 16], desloc: [6, 9], sombra: [22, 7, 12], pontos: 25, dano: 1, chanceCoracao: 0.15,
    cores: [0xc8f04a, 0xffffff, 0x7a2d8f], empurrao: 220
  },
  atirador: {
    textura: 'atirador_0', anim: 'atirador_anim', vida: 3, velocidade: 55, raio: 400, escala: 1,
    corpo: [22, 18], desloc: [5, 9], sombra: [26, 8, 13], pontos: 40, dano: 1, chanceCoracao: 0.25,
    cores: [0x23233a, 0x46466a, 0xe53935], empurrao: 200, atira: true
  },
  bruto: {
    textura: 'bruto_0', anim: 'bruto_anim', vida: 8, velocidade: 42, raio: 300, escala: 1.5,
    corpo: [24, 20], desloc: [4, 8], sombra: [40, 12, 20], pontos: 80, dano: 2, chanceCoracao: 1,
    cores: [0x6b5a45, 0x8c7a60, 0x9be7ff], empurrao: 100
  }
};

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, tipo = 'lodo', nivel = 1) {
    const cfg = TIPOS[tipo] || TIPOS.lodo;
    super(scene, x, y, cfg.textura);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.cfg = cfg;
    this.tipo = tipo;

    this.setScale(cfg.escala);
    this.setDepth(9);
    this.body.setSize(cfg.corpo[0], cfg.corpo[1]);
    this.body.setOffset(cfg.desloc[0], cfg.desloc[1]);
    this.body.setCollideWorldBounds(true);

    this.sombra = scene.add.ellipse(x, y + cfg.sombra[2], cfg.sombra[0], cfg.sombra[1], 0x000000, 0.28).setDepth(7);

    this.larguraBarra = 30 * cfg.escala;
    this.alturaBarraOffset = 24 * cfg.escala;
    this.barraFundo = scene.add.rectangle(x, y, this.larguraBarra + 2, 6, 0x0b1f2a)
      .setOrigin(0, 0.5).setDepth(20).setVisible(false);
    this.barraVida = scene.add.rectangle(x, y, this.larguraBarra, 4, 0xe53935)
      .setOrigin(0, 0.5).setDepth(21).setVisible(false);

    this.once('destroy', () => {
      this.sombra.destroy();
      this.barraFundo.destroy();
      this.barraVida.destroy();
    });

    this.anims.play(cfg.anim);

    this.vidaMaxima = cfg.vida + Math.floor((nivel - 1) / 3);
    this.vida = this.vidaMaxima;
    this.velocidade = cfg.velocidade * (1 + 0.03 * (nivel - 1));
    this.raioVisao = cfg.raio;
    this.pontos = cfg.pontos;
    this.dano = cfg.dano;
    this.chanceCoracao = cfg.chanceCoracao;

    this.intervaloTiro = Math.max(900, 1900 - nivel * 80);
    this.proximoTiro = scene.time.now + 2500;
    this.ladoTiro = Math.random() < 0.5 ? 1 : -1;
    this.trocaLado = scene.time.now + 1500;

    this.ladoDesvio = 1;
    this.desvioAte = 0;

    this.atordoadoAte = scene.time.now + 1500;
  }

  atualizarBarra() {
    const mostrar = this.vida < this.vidaMaxima;
    const bx = this.x - this.larguraBarra / 2;
    const by = this.y - this.alturaBarraOffset;

    this.barraFundo.setVisible(mostrar).setPosition(bx - 1, by);
    this.barraVida.setVisible(mostrar).setPosition(bx, by);
    this.barraVida.width = this.larguraBarra * Math.max(0, this.vida) / this.vidaMaxima;
  }

  atualizar(alvo) {
    const agora = this.scene.time.now;

    this.sombra.setPosition(this.x, this.y + this.cfg.sombra[2]);
    this.atualizarBarra();

    if (agora < this.atordoadoAte) return;

    const distancia = Phaser.Math.Distance.Between(this.x, this.y, alvo.x, alvo.y);
    const dir = new Phaser.Math.Vector2(alvo.x - this.x, alvo.y - this.y).normalize();
    let mover = null;

    if (this.cfg.atira) {
      if (agora > this.trocaLado) {
        this.ladoTiro *= -1;
        this.trocaLado = agora + 1500;
      }

      if (distancia < 150) {
        mover = dir.clone().scale(-1);
      } else if (distancia > 250) {
        if (distancia < this.raioVisao) mover = dir.clone();
      } else {
        mover = new Phaser.Math.Vector2(-dir.y, dir.x).scale(this.ladoTiro);
      }

      if (agora >= this.proximoTiro && distancia < this.raioVisao) {
        this.proximoTiro = agora + this.intervaloTiro;
        this.scene.dispararProjetil(this.x, this.y - 4, alvo.x, alvo.y, this.dano);
      }
    } else if (distancia < this.raioVisao) {
      mover = dir.clone();
    }

    if (mover) {
      const bloqueado = !this.body.touching.none || !this.body.blocked.none;
      if (bloqueado && agora > this.desvioAte) {
        this.desvioAte = agora + 500;
        this.ladoDesvio = Math.random() < 0.5 ? 1 : -1;
      }

      if (agora < this.desvioAte) {
        const perp = new Phaser.Math.Vector2(-mover.y, mover.x).scale(this.ladoDesvio);
        mover = perp.add(mover.clone().scale(0.25)).normalize();
      }

      this.body.setVelocity(mover.x * this.velocidade, mover.y * this.velocidade);
    } else {
      this.body.setVelocity(0, 0);
    }
  }

  receberDano(direcao, dano = 1) {
    this.vida -= dano;
    this.atordoadoAte = this.scene.time.now + (this.cfg.escala > 1 ? 120 : 250);
    this.body.setVelocity(direcao.x * this.cfg.empurrao, direcao.y * this.cfg.empurrao);
    this.setTintFill(0xffffff);
    Som.acerto();

    if (this.vida <= 0) {
      Som.morte();
      explosao(this.scene, this.x, this.y, this.cfg.cores, 16);
      if (this.scene.aoInimigoMorrer) {
        this.scene.aoInimigoMorrer(this);
      }
      this.destroy();
      return;
    }

    explosao(this.scene, this.x, this.y, this.cfg.cores, 5);

    this.scene.time.delayedCall(100, () => {
      if (this.active) {
        this.clearTint();
      }
    });
  }
}