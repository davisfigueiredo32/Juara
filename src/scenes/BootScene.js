import Phaser from 'phaser';
import { criarTodasTexturas, criarAnimacoes } from '../art/Texturas.js';
import { criarTexturasInimigos, criarAnimacoesInimigos } from '../art/TexturasInimigos.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    criarTodasTexturas(this);
    criarTexturasInimigos(this);
    criarAnimacoes(this);
    criarAnimacoesInimigos(this);
    this.scene.start('MenuScene');
  }
}