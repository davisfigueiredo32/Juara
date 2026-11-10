import Phaser from 'phaser';
import { criarTodasTexturas, criarAnimacoes } from '../art/Texturas.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    criarTodasTexturas(this);
    criarAnimacoes(this);
    this.scene.start('MenuScene');
  }
}