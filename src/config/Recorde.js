const CHAVE = 'juara_recorde';

export function lerRecorde() {
  try {
    return parseInt(window.localStorage.getItem(CHAVE), 10) || 0;
  } catch (e) {
    return 0;
  }
}

export function salvarRecorde(valor) {
  try {
    window.localStorage.setItem(CHAVE, String(valor));
  } catch (e) {
    // sem armazenamento disponível: ignora
  }
}