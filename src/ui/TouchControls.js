export default class TouchControls {
  constructor(scene) {
    this.dx = 0;
    this.dy = 0;
    this.ataqueApertado = false;
    this.ondaApertada = false;
    this.idJoystick = null;

    this.ativo = scene.sys.game.device.input.touch;
    if (!this.ativo) return;

    scene.input.addPointer(2);

    this.centroX = 110;
    this.centroY = 480;
    this.raio = 65;

    this.base = scene.add.circle(this.centroX, this.centroY, this.raio, 0xffffff, 0.15)
      .setStrokeStyle(3, 0xffffff, 0.45)
      .setDepth(200)
      .setScrollFactor(0)
      .setInteractive();

    this.knob = scene.add.circle(this.centroX, this.centroY, 28, 0xffffff, 0.4)
      .setDepth(201)
      .setScrollFactor(0);

    this.base.on('pointerdown', (pointer) => {
      this.idJoystick = pointer.id;
      this.moverJoystick(pointer);
    });

    scene.input.on('pointermove', (pointer) => {
      if (pointer.id === this.idJoystick) {
        this.moverJoystick(pointer);
      }
    });

    scene.input.on('pointerup', (pointer) => {
      if (pointer.id === this.idJoystick) {
        this.soltarJoystick();
      }
    });

    this.botaoAtaque = this.criarBotao(scene, 710, 480, 44, 'ATACAR', 0xd84315);
    this.botaoAtaque.on('pointerdown', () => {
      this.ataqueApertado = true;
    });

    this.botaoOnda = this.criarBotao(scene, 600, 530, 34, 'ONDA', 0x1e88e5);
    this.botaoOnda.on('pointerdown', () => {
      this.ondaApertada = true;
    });
  }

  criarBotao(scene, x, y, raio, rotulo, cor) {
    const botao = scene.add.circle(x, y, raio, cor, 0.55)
      .setStrokeStyle(3, 0xffffff, 0.6)
      .setDepth(200)
      .setScrollFactor(0)
      .setInteractive();

    scene.add.text(x, y, rotulo, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

    return botao;
  }

  moverJoystick(pointer) {
    let vx = pointer.x - this.centroX;
    let vy = pointer.y - this.centroY;
    const distancia = Math.sqrt(vx * vx + vy * vy);

    if (distancia > this.raio) {
      vx = (vx / distancia) * this.raio;
      vy = (vy / distancia) * this.raio;
    }

    this.knob.setPosition(this.centroX + vx, this.centroY + vy);

    if (distancia < 14) {
      this.dx = 0;
      this.dy = 0;
    } else {
      this.dx = vx / this.raio;
      this.dy = vy / this.raio;
    }
  }

  soltarJoystick() {
    this.idJoystick = null;
    this.dx = 0;
    this.dy = 0;
    this.knob.setPosition(this.centroX, this.centroY);
  }

  consumirAtaque() {
    const valor = this.ataqueApertado;
    this.ataqueApertado = false;
    return valor;
  }

  consumirOnda() {
    const valor = this.ondaApertada;
    this.ondaApertada = false;
    return valor;
  }
}