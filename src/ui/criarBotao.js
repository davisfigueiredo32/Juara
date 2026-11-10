export default function criarBotao(scene, x, y, texto, aoClicar, cor = '#2a8f5a', corHover = '#34b36f') {
  const botao = scene.add.text(x, y, texto, {
    fontFamily: 'monospace',
    fontSize: '30px',
    color: '#ffffff',
    backgroundColor: cor,
    padding: { x: 24, y: 12 }
  }).setOrigin(0.5);

  botao.setInteractive({ useHandCursor: true });

  botao.on('pointerover', () => {
    botao.setStyle({ backgroundColor: corHover });
  });

  botao.on('pointerout', () => {
    botao.setStyle({ backgroundColor: cor });
  });

  botao.on('pointerdown', aoClicar);

  return botao;
}