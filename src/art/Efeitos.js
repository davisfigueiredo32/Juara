import Phaser from 'phaser';

export function explosao(scene, x, y, cores, quantidade = 10) {
  for (let i = 0; i < quantidade; i++) {
    const cor = cores[i % cores.length];
    const particula = scene.add.rectangle(x, y, 4, 4, cor).setDepth(50);
    const angulo = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const distancia = Phaser.Math.Between(18, 46);

    scene.tweens.add({
      targets: particula,
      x: x + Math.cos(angulo) * distancia,
      y: y + Math.sin(angulo) * distancia,
      alpha: 0,
      duration: Phaser.Math.Between(300, 500),
      onComplete: () => particula.destroy()
    });
  }
}