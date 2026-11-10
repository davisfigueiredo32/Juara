import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import HealthBar from '../ui/HealthBar.js';
import TouchControls from '../ui/TouchControls.js';
import { explosao } from '../art/Efeitos.js';

const ESTILO_TEXTO = {
  fontFamily: 'monospace',
  fontSize: '16px',
  color: '#ffffff',
  stroke: '#0b1f2a',
  strokeThickness: 4
};

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.finalizando = false;
    this.tempoInicio = this.time.now;
    this.cameras.main.fadeIn(350);

    this.obstaculos = this.physics.add.staticGroup();
    this.inimigos = [];
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
    this.physics.add.collider(this.player, this.obstaculos);

    this.criarInimigos();
    this.criarLixo();
    this.criarInterface();

    this.atualizarInterface();
  }

  update() {
    if (this.finalizando) return;

    this.player.atualizar();

    for (const inimigo of this.inimigos) {
      inimigo.atualizar(this.player);
    }

    this.verificarAtaque();

    this.inimigos = this.inimigos.filter((inimigo) => inimigo.active);
    this.inimigosDerrotados = this.totalInimigos - this.inimigos.length;

    this.atualizarInterface();

    if (this.player.vida <= 0) {
      this.finalizar(false);
    } else if (this.lixoRecolhido >= this.totalLixo && this.inimigos.length === 0) {
      this.finalizar(true);
    }
  }

  finalizar(vitoria) {
    if (this.finalizando) return;
    this.finalizando = true;

    this.player.body.setVelocity(0, 0);
    this.player.anims.stop();
    for (const inimigo of this.inimigos) {
      if (inimigo.active) inimigo.body.setVelocity(0, 0);
    }

    const dados = {
      vitoria: vitoria,
      lixo: this.lixoRecolhido,
      totalLixo: this.totalLixo,
      derrotados: this.inimigosDerrotados,
      totalInimigos: this.totalInimigos,
      tempo: Math.round((this.time.now - this.tempoInicio) / 1000)
    };

    const mensagem = vitoria ? 'A lagoa foi restaurada!' : 'Juara foi derrotada...';

    this.add.text(400, 300, mensagem, {
      fontFamily: 'monospace',
      fontSize: '40px',
      color: vitoria ? '#b8f5d0' : '#ffb3b3',
      stroke: '#0b1f2a',
      strokeThickness: 7
    }).setOrigin(0.5).setDepth(300);

    this.time.delayedCall(900, () => {
      this.cameras.main.fadeOut(400);
    });

    this.time.delayedCall(1300, () => {
      this.scene.start('EndScene', dados);
    });
  }

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
        inimigo.receberDano(this.player.direcaoFrente);
      }
    }
  }

  criarFundo() {
    this.gramaSuja = this.add.tileSprite(400, 300, 800, 600, 'grama_suja').setDepth(0);
    this.gramaViva = this.add.tileSprite(400, 300, 800, 600, 'grama').setDepth(0.1).setAlpha(0);
  }

  criarLagoa() {
    this.lagoaSuja = this.add.image(400, 300, 'lagoa_suja').setDepth(1);
    this.lagoaLimpa = this.add.image(400, 300, 'lagoa_limpa').setDepth(1.1).setAlpha(0);

    const areaAgua = this.add.circle(400, 300, 100).setVisible(false);
    this.physics.add.existing(areaAgua, true);
    this.obstaculos.add(areaAgua);
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
      { x: 200, y: 170 }, { x: 560, y: 160 }, { x: 650, y: 300 }, { x: 150, y: 380 },
      { x: 250, y: 520 }, { x: 460, y: 530 }, { x: 640, y: 540 }, { x: 100, y: 230 },
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
    }
  }

  criarPedras() {
    const posicoes = [
      { x: 350, y: 70 },
      { x: 560, y: 470 },
      { x: 220, y: 450 }
    ];

    for (const pos of posicoes) {
      const pedra = this.add.image(pos.x, pos.y, 'pedra').setDepth(4);
      this.physics.add.existing(pedra, true);
      this.obstaculos.add(pedra);
    }
  }

  criarInimigos() {
    const posicoes = [
      { x: 200, y: 250 },
      { x: 620, y: 230 },
      { x: 150, y: 400 },
      { x: 660, y: 400 }
    ];

    for (const pos of posicoes) {
      const inimigo = new Enemy(this, pos.x, pos.y);
      this.physics.add.collider(inimigo, this.obstaculos);

      this.physics.add.overlap(inimigo, this.player, () => {
        this.player.receberDano(inimigo.x, inimigo.y);
      });

      this.inimigos.push(inimigo);
      this.totalInimigos += 1;
    }
  }

  criarLixo() {
    this.lixos = this.physics.add.staticGroup();
    this.totalLixo = 0;
    this.lixoRecolhido = 0;

    const posicoes = [
      { x: 200, y: 330, tipo: 'garrafa' },
      { x: 600, y: 360, tipo: 'lata' },
      { x: 300, y: 530, tipo: 'saco' },
      { x: 520, y: 100, tipo: 'garrafa' },
      { x: 420, y: 90, tipo: 'lata' },
      { x: 710, y: 410, tipo: 'saco' },
      { x: 130, y: 400, tipo: 'garrafa' },
      { x: 660, y: 170, tipo: 'lata' }
    ];

    for (const pos of posicoes) {
      const lixo = this.add.image(pos.x, pos.y, pos.tipo).setDepth(6);
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
    lixo.destroy();
    this.lixoRecolhido += 1;

    if (this.lixoRecolhido % 3 === 0) {
      this.player.curar(1);
    }
  }

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
      .setOrigin(0, 0)
      .setDepth(100)
      .setScrollFactor(0);

    this.textoOnda = this.add.text(20, 146, '', ESTILO_TEXTO)
      .setOrigin(0, 0)
      .setDepth(100)
      .setScrollFactor(0);
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
      '- Lodos derrotados: ' + this.inimigosDerrotados + '/' + this.totalInimigos
    );

    const restante = this.player.ondaRestante();
    if (restante <= 0) {
      this.textoOnda.setText('Onda Purificadora (E): PRONTA');
    } else {
      this.textoOnda.setText('Onda Purificadora: ' + (restante / 1000).toFixed(1) + 's');
    }

    this.gramaViva.setAlpha(progresso);
    this.lagoaLimpa.setAlpha(progresso);

    const floresVisiveis = Math.floor(progresso * this.flores.length);
    this.flores.forEach((flor, i) => {
      flor.setVisible(i < floresVisiveis);
    });
  }
}