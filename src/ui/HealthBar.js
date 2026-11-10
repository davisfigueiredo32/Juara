export default class HealthBar {
  constructor(scene, x, y, valorMaximo, cor = 0x4cd964) {
    this.largura = 160;
    this.altura = 18;
    this.valorMaximo = valorMaximo;

    this.fundo = scene.add.rectangle(x, y, this.largura + 6, this.altura + 6, 0x0b1f2a)
      .setOrigin(0, 0.5)
      .setDepth(100)
      .setScrollFactor(0);

    this.preenchimento = scene.add.rectangle(x + 3, y, this.largura, this.altura, cor)
      .setOrigin(0, 0.5)
      .setDepth(101)
      .setScrollFactor(0);
  }

  atualizar(valorAtual) {
    const proporcao = Math.max(0, valorAtual) / this.valorMaximo;
    this.preenchimento.width = this.largura * proporcao;
  }
}