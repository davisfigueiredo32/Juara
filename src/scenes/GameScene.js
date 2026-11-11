import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import HealthBar from '../ui/HealthBar.js';
import TouchControls from '../ui/TouchControls.js';
import { explosao } from '../art/Efeitos.js';
import { Som } from '../audio/SomJogo.js';
import { configNivel, NIVEL_MAXIMO } from '../config/Niveis.js';
import { lerRecorde, salvarRecorde } from '../config/Recorde.js';

const ESTILO_TEXTO = {
  fontFamily: 'monospace',
  fontSize: '16px',
  color: '#ffffff',
  stroke: '#0b1f2a',
  strokeThickness: 4
};

const ESTILO_BOTAO = {
  fontFamily: 'monospace',
  fontSize: '14px',
  color: '#ffffff',
  backgroundColor: 'rgba(11,31,42,0.75)',
  padding: { x: 8, y: 4 }
};

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(dados) {
    dados = dados || {};
    this.nivel = Math.min(Math.max(dados.nivel || 1, 1), NIVEL_MAXIMO);
    this.pontos = dados.pontos || 0;
    this.vidaInicial = dados.vida;
    this.estat = dados.estat ? { ...dados.estat } : { lixo: 0, inimigos: 0, tempo: 0 };
    this.estatInicio = { ...this.estat };
    this.pontosInicio = this.pontos;
  }

  create() {
    this.cfg = configNivel(this.nivel);
    this.recorde = lerRecorde();

    this.finalizando = false;
    this.pausado = false;
    this.tempoInicio = this.time.now;
    this.tempoPausadoTotal = 0;
    this.inicioPausa = 0;
    this.cameras.main.fadeIn(350);

    this.obstaculos = this.physics.add.staticGroup();
    this.inimigos = [];
    this.projeteis = [];
    this.coracoes = [];
    this.ocupados = [];
    this.totalInimigos = 0;
    this.inimigosDerrotados = 0;

    this.criarFundo();
    this.criarLagoa();
    this.criarBrilhos();
    this.criarFlores();
    this.criarArvores();
    this.criarPedras();

    this.controleToque = new TouchControls(this);

    this.player = new Player(this, 400, 500);
    if (this.vidaInicial) {
      this.player.vida = Phaser.Math.Clamp(this.vidaInicial, 1, this.player.vidaMaxima);
    }
    this.player.intervaloAtaque = Math.max(260, 400 - (this.nivel - 1) * 20);
    this.player.intervaloOnda = Math.max(2500, 4000 - (this.nivel - 1) * 200);
    this.player.danoLanca = this.nivel >= 5 ? 2 : 1;
    this.physics.add.collider(this.player, this.obstaculos);

    this.criarInimigos();
    this.criarLixo();
    this.criarInterface();
    this.criarTeclas();
    this.mostrarFaixaNivel();

    this.atualizarInterface();

    Som.iniciarMusica();
  }

  update(time, delta) {
    if (this.finalizando || this.pausado) return;

    this.player.atualizar();

    for (const inimigo of this.inimigos) {
      inimigo.atualizar(this.player);
    }

    this.verificarAtaque();
    this.atualizarProjeteis(delta);
    this.atualizarCoracoes();

    this.inimigos = this.inimigos.filter((inimigo) => inimigo.active);
    this.inimigosDerrotados = this.totalInimigos - this.inimigos.length;

    this.atualizarInterface();

    if (this.player.vida <= 0) {
      this.finalizar(false);
    } else if (this.lixoRecolhido >= this.totalLixo && this.inimigos.length === 0) {
      this.finalizar(true);
    }
  }

  // ---------- Fluxo do jogo ----------

  tempoDoNivel() {
    return Math.round((this.time.now - this.tempoInicio - this.tempoPausadoTotal) / 1000);
  }

  finalizar(vitoria) {
    if (this.finalizando) return;
    this.finalizando = true;

    this.player.body.setVelocity(0, 0);
    this.player.anims.stop();
    for (const inimigo of this.inimigos) {
      if (inimigo.active) inimigo.body.setVelocity(0, 0);
    }

    const tempoNivel = this.tempoDoNivel();
    this.estat.tempo += tempoNivel;
    this.estat.lixo += this.lixoRecolhido;
    this.estat.inimigos += this.inimigosDerrotados;

    let bonus = 0;
    if (vitoria) {
      bonus = this.nivel * 100 + Math.max(0, this.player.vida) * 20;
      this.pontos += bonus;
    }

    this.recorde = Math.max(this.recorde, this.pontos);
    salvarRecorde(this.recorde);

    const final = vitoria && this.nivel >= NIVEL_MAXIMO;

    let mensagem;
    if (!vitoria) {
      mensagem = 'Juara foi derrotada...';
      Som.derrota();
    } else if (final) {
      mensagem = 'A LAGOA JUARA ESTÁ SALVA!';
      Som.vitoriaFinal();
    } else {
      mensagem = 'NÍVEL ' + this.nivel + ' CONCLUÍDO!';
      Som.nivelConcluido();
    }

    this.add.text(400, 280, mensagem, {
      fontFamily: 'monospace',
      fontSize: '40px',
      color: vitoria ? '#b8f5d0' : '#ffb3b3',
      stroke: '#0b1f2a',
      strokeThickness: 7
    }).setOrigin(0.5).setDepth(300);

    if (vitoria) {
      this.add.text(400, 330, 'Bônus: +' + bonus + ' pontos', {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: '#ffe082',
        stroke: '#0b1f2a',
        strokeThickness: 5
      }).setOrigin(0.5).setDepth(300);
    }

    this.time.delayedCall(1100, () => {
      this.cameras.main.fadeOut(400);
    });

    this.time.delayedCall(1500, () => {
      if (vitoria && !final) {
        this.scene.restart({
          nivel: this.nivel + 1,
          pontos: this.pontos,
          vida: Math.min(this.player.vidaMaxima, this.player.vida + 2),
          estat: this.estat
        });
      } else {
        this.scene.start('EndScene', {
          vitoria: vitoria,
          final: final,
          nivel: this.nivel,
          pontos: this.pontos,
          recorde: this.recorde,
          estat: this.estat,
          tentarNovamente: {
            nivel: this.nivel,
            pontos: this.pontosInicio,
            estat: this.estatInicio
          }
        });
      }
    });
  }

  alternarPausa() {
    if (this.finalizando) return;

    this.pausado = !this.pausado;

    if (this.pausado) {
      this.physics.pause();
      this.tweens.pauseAll();
      this.time.paused = true;
      this.inicioPausa = this.time.now;
      this.overlayPausa.setVisible(true);
      this.textoPausa.setVisible(true);
      Som.pausa();
    } else {
      this.physics.resume();
      this.tweens.resumeAll();
      this.time.paused = false;
      this.tempoPausadoTotal += this.time.now - this.inicioPausa;
      this.overlayPausa.setVisible(false);
      this.textoPausa.setVisible(false);
      Som.pausa();
    }
  }

  alternarSom() {
    const mudo = Som.alternarMudo();
    this.textoSom.setText(mudo ? 'SOM: OFF [M]' : 'SOM: ON [M]');
  }

  criarTeclas() {
    this.input.keyboard.on('keydown-P', () => this.alternarPausa());
    this.input.keyboard.on('keydown-ESC', () => this.alternarPausa());
    this.input.keyboard.on('keydown-M', () => this.alternarSom());
  }

  mostrarFaixaNivel() {
    const titulo = this.add.text(400, 230, 'NÍVEL ' + this.nivel, {
      fontFamily: 'monospace',
      fontSize: '60px',
      color: '#ffffff',
      stroke: '#0b1f2a',
      strokeThickness: 8
    }).setOrigin(0.5).setDepth(300);

    const nome = this.add.text(400, 290, this.cfg.nome, {
      fontFamily: 'monospace',
      fontSize: '26px',
      color: '#bfe8d0',
      stroke: '#0b1f2a',
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(300);

    const novidade = this.add.text(400, 330, this.cfg.novidade, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffe082',
      stroke: '#0b1f2a',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(300);

    this.tweens.add({
      targets: [titulo, nome, novidade],
      alpha: 0,
      delay: 1700,
      duration: 600,
      onComplete: () => {
        titulo.destroy();
        nome.destroy();
        novidade.destroy();
      }
    });

    Som.nivelInicio();
  }

  // ---------- Combate ----------

  aplicarOnda(x, y, raio) {
    for (const inimigo of this.inimigos) {
      if (!inimigo.active) continue;

      const distancia = Phaser.Math.Distance.Between(x, y, inimigo.x, inimigo.y);

      if (distancia <= raio) {
        const direcao = new Phaser.Math.Vector2(inimigo.x - x, inimigo.y - y);
        direcao.normalize();
        inimigo.receberDano(direcao);
      }
    }

    this.projeteis = this.projeteis.filter((p) => {
      const distancia = Phaser.Math.Distance.Between(x, y, p.obj.x, p.obj.y);
      if (distancia <= raio) {
        explosao(this, p.obj.x, p.obj.y, [0xb4e33d, 0xbff3ff], 4);
        p.obj.destroy();
        return false;
      }
      return true;
    });
  }

  verificarAtaque() {
    const lanca = this.player.lanca;
    if (!lanca) return;

    const areaLanca = lanca.getBounds();

    for (const inimigo of this.inimigos) {
      if (!inimigo.active) continue;
      if (lanca.atingidos.has(inimigo)) continue;

      const b = inimigo.body;
      const areaInimigo = new Phaser.Geom.Rectangle(b.x, b.y, b.width, b.height);

      if (Phaser.Geom.Intersects.RectangleToRectangle(areaLanca, areaInimigo)) {
        lanca.atingidos.add(inimigo);
        inimigo.receberDano(this.player.direcaoFrente, this.player.danoLanca);
      }
    }
  }

  dispararProjetil(x, y, alvoX, alvoY, dano) {
    if (this.finalizando) return;

    const angulo = Math.atan2(alvoY - y, alvoX - x);
    const velocidade = 165 + this.nivel * 4;

    const obj = this.add.circle(x, y, 6, 0xb4e33d)
      .setStrokeStyle(2, 0x2a1a3d)
      .setDepth(12);

    this.projeteis.push({
      obj: obj,
      vx: Math.cos(angulo) * velocidade,
      vy: Math.sin(angulo) * velocidade,
      ate: this.time.now + 2800,
      dano: dano
    });

    Som.tiro();
  }

  atualizarProjeteis(delta) {
    const dt = delta / 1000;
    const agora = this.time.now;
    const paredes = this.obstaculos.getChildren();

    this.projeteis = this.projeteis.filter((p) => {
      const o = p.obj;
      o.x += p.vx * dt;
      o.y += p.vy * dt;

      let remover = agora > p.ate || o.x < -10 || o.x > 810 || o.y < -10 || o.y > 610;

      if (!remover) {
        const distancia = Phaser.Math.Distance.Between(o.x, o.y, this.player.x, this.player.y);
        if (distancia < 16) {
          this.player.receberDano(o.x - p.vx * 0.1, o.y - p.vy * 0.1, p.dano);
          remover = true;
        }
      }

      if (!remover) {
        for (const parede of paredes) {
          if (parede.agua || !parede.body) continue;
          const b = parede.body;
          if (o.x > b.x && o.x < b.x + b.width && o.y > b.y && o.y < b.y + b.height) {
            remover = true;
            break;
          }
        }
      }

      if (remover) {
        explosao(this, o.x, o.y, [0xb4e33d, 0x2a1a3d], 4);
        o.destroy();
        return false;
      }
      return true;
    });
  }

  aoInimigoMorrer(inimigo) {
    this.pontos += inimigo.pontos;
    this.textoFlutuante(inimigo.x, inimigo.y - 24, '+' + inimigo.pontos, '#ffe082');

    if (Math.random() < inimigo.chanceCoracao) {
      this.soltarCoracao(inimigo.x, inimigo.y);
    }
  }

  soltarCoracao(x, y) {
    const obj = this.add.image(x, y, 'icone_coracao').setDepth(6).setScale(1.6);

    this.tweens.add({
      targets: obj,
      y: y - 4,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    this.coracoes.push({ obj: obj, ate: this.time.now + 9000 });
  }

  atualizarCoracoes() {
    const agora = this.time.now;

    this.coracoes = this.coracoes.filter((c) => {
      const o = c.obj;
      const distancia = Phaser.Math.Distance.Between(o.x, o.y, this.player.x, this.player.y);

      if (distancia < 24) {
        this.player.curar(1);
        Som.cura();
        this.textoFlutuante(o.x, o.y - 14, '+1 vida', '#ff8a80');
        this.tweens.killTweensOf(o);
        o.destroy();
        return false;
      }

      if (agora > c.ate) {
        this.tweens.killTweensOf(o);
        o.destroy();
        return false;
      }

      if (agora > c.ate - 2000) {
        o.setAlpha(Math.floor(agora / 150) % 2 === 0 ? 0.3 : 1);
      }
      return true;
    });
  }

  textoFlutuante(x, y, texto, cor) {
    const t = this.add.text(x, y, texto, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: cor,
      stroke: '#0b1f2a',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(60);

    this.tweens.add({
      targets: t,
      y: y - 30,
      alpha: 0,
      duration: 700,
      onComplete: () => t.destroy()
    });
  }

  // ---------- Cenário ----------

  posicaoLivre(raio, distanciaJogador) {
    for (let tentativa = 0; tentativa < 300; tentativa++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(60, 560);

      const dxAgua = (x - 400) / (170 + raio + 6);
      const dyAgua = (y - 300) / (110 + raio + 6);
      if (dxAgua * dxAgua + dyAgua * dyAgua < 1) continue;

      if (x < 335 && y < 180) continue;
      if (x > 560 && y < 165) continue;

      if (Phaser.Math.Distance.Between(x, y, 400, 500) < distanciaJogador) continue;

      let livre = true;
      for (const o of this.ocupados) {
        if (Phaser.Math.Distance.Between(x, y, o.x, o.y) < o.raio + raio + 8) {
          livre = false;
          break;
        }
      }
      if (!livre) continue;

      this.ocupados.push({ x: x, y: y, raio: raio });
      return { x: x, y: y };
    }

    return { x: Phaser.Math.Between(60, 740), y: 560 };
  }

  criarFundo() {
    this.gramaSuja = this.add.tileSprite(400, 300, 800, 600, 'grama_suja').setDepth(0);
    this.gramaViva = this.add.tileSprite(400, 300, 800, 600, 'grama').setDepth(0.1).setAlpha(0);
  }

  criarLagoa() {
    this.lagoaSuja = this.add.image(400, 300, 'lagoa_suja').setDepth(1);
    this.lagoaLimpa = this.add.image(400, 300, 'lagoa_limpa').setDepth(1.1).setAlpha(0);

    // Bloqueio da água inteira: faixas horizontais que acompanham a elipse
    const cx = 400;
    const cy = 300;
    const rx = 168;
    const ry = 108;
    const passo = 8;

    for (let y = -ry; y < ry; y += passo) {
      const maisAfastado = Math.max(Math.abs(y), Math.abs(y + passo));
      if (maisAfastado >= ry) continue;

      const meiaLargura = rx * Math.sqrt(1 - (maisAfastado / ry) * (maisAfastado / ry));
      if (meiaLargura < 2) continue;

      const faixa = this.add.rectangle(cx, cy + y + passo / 2, meiaLargura * 2, passo).setVisible(false);
      this.physics.add.existing(faixa, true);
      faixa.agua = true;
      this.obstaculos.add(faixa);
    }
  }

  criarBrilhos() {
    for (let i = 0; i < 9; i++) {
      const angulo = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const r = Math.sqrt(Math.random());
      const x = 400 + Math.cos(angulo) * r * 140;
      const y = 300 + Math.sin(angulo) * r * 85;

      const brilho = this.add.rectangle(x, y, 8, 2, 0xdff6ff).setDepth(3).setAlpha(0);

      this.tweens.add({
        targets: brilho,
        alpha: 0.8,
        duration: 900,
        yoyo: true,
        hold: 200,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }
  }

  criarFlores() {
    const posicoes = [
      { x: 200, y: 190 }, { x: 560, y: 170 }, { x: 650, y: 300 }, { x: 150, y: 380 },
      { x: 250, y: 520 }, { x: 460, y: 530 }, { x: 640, y: 540 }, { x: 100, y: 240 },
      { x: 330, y: 470 }, { x: 700, y: 200 }, { x: 480, y: 60 }, { x: 60, y: 420 }
    ];
    const tipos = ['flor_amarela', 'flor_rosa', 'flor_branca'];

    this.flores = [];

    posicoes.forEach((pos, i) => {
      const flor = this.add.image(pos.x, pos.y, tipos[i % tipos.length])
        .setDepth(3)
        .setVisible(false);
      this.flores.push(flor);
    });
  }

  criarArvores() {
    const posicoes = [
      { x: 90, y: 210 },
      { x: 700, y: 90 },
      { x: 120, y: 480 },
      { x: 690, y: 500 },
      { x: 60, y: 330 },
      { x: 745, y: 310 }
    ];

    for (const pos of posicoes) {
      const tronco = this.add.rectangle(pos.x, pos.y + 22, 14, 28, 0x6b4a2b).setVisible(false);
      this.physics.add.existing(tronco, true);
      this.obstaculos.add(tronco);

      this.add.image(pos.x, pos.y + 36, 'arvore').setOrigin(0.5, 1).setDepth(5);

      this.ocupados.push({ x: pos.x, y: pos.y + 15, raio: 32 });
    }
  }

  criarPedras() {
    const fixas = [
      { x: 350, y: 70 },
      { x: 560, y: 470 },
      { x: 220, y: 450 }
    ];

    const posicoes = fixas.slice();
    for (const p of fixas) {
      this.ocupados.push({ x: p.x, y: p.y, raio: 22 });
    }

    const extras = Math.min(this.nivel - 1, 4);
    for (let i = 0; i < extras; i++) {
      posicoes.push(this.posicaoLivre(22, 120));
    }

    for (const pos of posicoes) {
      const pedra = this.add.image(pos.x, pos.y, 'pedra').setDepth(4);
      this.physics.add.existing(pedra, true);
      this.obstaculos.add(pedra);
    }
  }

  criarInimigos() {
    const lista = [];
    for (const tipo of ['lodo', 'espuma', 'atirador', 'bruto']) {
      for (let i = 0; i < this.cfg[tipo]; i++) {
        lista.push(tipo);
      }
    }

    for (const tipo of lista) {
      const pos = this.posicaoLivre(24, 230);
      const inimigo = new Enemy(this, pos.x, pos.y, tipo, this.nivel);
      this.physics.add.collider(inimigo, this.obstaculos);

      this.physics.add.overlap(inimigo, this.player, () => {
        this.player.receberDano(inimigo.x, inimigo.y, inimigo.dano);
      });

      this.inimigos.push(inimigo);
      this.totalInimigos += 1;
    }
  }

  criarLixo() {
    this.lixos = this.physics.add.staticGroup();
    this.totalLixo = 0;
    this.lixoRecolhido = 0;

    const tipos = ['garrafa', 'lata', 'saco'];

    for (let i = 0; i < this.cfg.lixo; i++) {
      const pos = this.posicaoLivre(16, 90);
      const tipo = tipos[i % tipos.length];

      const lixo = this.add.image(pos.x, pos.y, tipo).setDepth(6);
      this.physics.add.existing(lixo, true);
      this.lixos.add(lixo);
      this.totalLixo += 1;

      this.tweens.add({
        targets: lixo,
        y: pos.y - 3,
        duration: Phaser.Math.Between(600, 900),
        yoyo: true,
        repeat: -1
      });
    }

    this.physics.add.overlap(this.player, this.lixos, (jogador, lixo) => {
      this.coletarLixo(lixo);
    });
  }

  coletarLixo(lixo) {
    if (!lixo.active) return;

    this.tweens.killTweensOf(lixo);
    explosao(this, lixo.x, lixo.y, [0x2a9df4, 0xbff3ff, 0xffffff], 10);
    this.textoFlutuante(lixo.x, lixo.y - 14, '+10', '#bff3ff');
    lixo.destroy();

    this.lixoRecolhido += 1;
    this.pontos += 10;
    Som.coleta();

    if (this.lixoRecolhido % 4 === 0) {
      this.player.curar(1);
      Som.cura();
    }
  }

  // ---------- Interface ----------

  criarInterface() {
    this.add.rectangle(10, 68, 310, 104, 0x0b1f2a, 0.45)
      .setOrigin(0, 0)
      .setDepth(99)
      .setScrollFactor(0);

    this.add.image(24, 24, 'icone_coracao').setDepth(102).setScrollFactor(0);
    this.add.image(24, 54, 'icone_gota').setDepth(102).setScrollFactor(0);

    this.barraVida = new HealthBar(this, 44, 24, this.player.vidaMaxima);
    this.barraEquilibrio = new HealthBar(this, 44, 54, 100, 0x2a9df4);

    this.add.text(218, 24, 'Vida', ESTILO_TEXTO).setOrigin(0, 0.5).setDepth(100).setScrollFactor(0);
    this.add.text(218, 54, 'Equilíbrio', ESTILO_TEXTO).setOrigin(0, 0.5).setDepth(100).setScrollFactor(0);

    this.textoMissao = this.add.text(20, 76, '', ESTILO_TEXTO)
      .setOrigin(0, 0).setDepth(100).setScrollFactor(0);

    this.textoOnda = this.add.text(20, 146, '', ESTILO_TEXTO)
      .setOrigin(0, 0).setDepth(100).setScrollFactor(0);

    this.textoNivel = this.add.text(790, 12, '', { ...ESTILO_TEXTO, fontSize: '20px', color: '#ffe082' })
      .setOrigin(1, 0).setDepth(100).setScrollFactor(0);

    this.textoPontos = this.add.text(790, 38, '', ESTILO_TEXTO)
      .setOrigin(1, 0).setDepth(100).setScrollFactor(0);

    this.textoRecorde = this.add.text(790, 60, '', { ...ESTILO_TEXTO, fontSize: '13px', color: '#bfe8d0' })
      .setOrigin(1, 0).setDepth(100).setScrollFactor(0);

    this.textoPausaBotao = this.add.text(790, 86, 'PAUSA [P]', ESTILO_BOTAO)
      .setOrigin(1, 0).setDepth(100).setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    this.textoPausaBotao.on('pointerdown', () => this.alternarPausa());

    this.textoSom = this.add.text(790, 114, Som.estaMudo() ? 'SOM: OFF [M]' : 'SOM: ON [M]', ESTILO_BOTAO)
      .setOrigin(1, 0).setDepth(100).setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    this.textoSom.on('pointerdown', () => this.alternarSom());

    this.overlayPausa = this.add.rectangle(400, 300, 800, 600, 0x0b1f2a, 0.6)
      .setDepth(400).setScrollFactor(0).setVisible(false)
      .setInteractive();
    this.overlayPausa.on('pointerdown', () => this.alternarPausa());

    this.textoPausa = this.add.text(400, 300, 'PAUSADO\n\nP, ESC ou toque para continuar', {
      fontFamily: 'monospace',
      fontSize: '30px',
      color: '#ffffff',
      stroke: '#0b1f2a',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5).setDepth(401).setScrollFactor(0).setVisible(false);
  }

  atualizarInterface() {
    const feitos = this.lixoRecolhido + this.inimigosDerrotados;
    const total = this.totalLixo + this.totalInimigos;
    const progresso = total > 0 ? feitos / total : 0;

    this.barraVida.atualizar(this.player.vida);
    this.barraEquilibrio.atualizar(progresso * 100);

    this.textoMissao.setText(
      'MISSÃO: Restaurar a lagoa\n' +
      '- Lixo: ' + this.lixoRecolhido + '/' + this.totalLixo + '\n' +
      '- Monstros: ' + this.inimigosDerrotados + '/' + this.totalInimigos
    );

    const restante = this.player.ondaRestante();
    if (restante <= 0) {
      this.textoOnda.setText('Onda Purificadora (E): PRONTA');
    } else {
      this.textoOnda.setText('Onda Purificadora: ' + (restante / 1000).toFixed(1) + 's');
    }

    this.textoNivel.setText('NÍVEL ' + this.nivel + '/' + NIVEL_MAXIMO);
    this.textoPontos.setText('PONTOS: ' + this.pontos);
    this.textoRecorde.setText('RECORDE: ' + Math.max(this.recorde, this.pontos));

    this.gramaViva.setAlpha(progresso);
    this.lagoaLimpa.setAlpha(progresso);

    const floresVisiveis = Math.floor(progresso * this.flores.length);
    this.flores.forEach((flor, i) => {
      flor.setVisible(i < floresVisiveis);
    });
  }
}