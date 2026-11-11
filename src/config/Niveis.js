export const NIVEL_MAXIMO = 8;

const TABELA = [
  { lixo: 8, lodo: 3, espuma: 0, atirador: 0, bruto: 0, nome: 'Margem da Lagoa', novidade: 'Colete o lixo e derrote os Lodos!' },
  { lixo: 10, lodo: 3, espuma: 2, atirador: 0, bruto: 0, nome: 'Praia Suja', novidade: 'Novo inimigo: Espuma Tóxica (rápida)' },
  { lixo: 12, lodo: 3, espuma: 2, atirador: 2, bruto: 0, nome: 'Bosque Sombrio', novidade: 'Novo inimigo: Cuspidor de Óleo (atira à distância)' },
  { lixo: 14, lodo: 3, espuma: 3, atirador: 2, bruto: 1, nome: 'Campo de Resíduos', novidade: 'Novo inimigo: Golem de Lixo (resistente)' },
  { lixo: 16, lodo: 4, espuma: 3, atirador: 3, bruto: 1, nome: 'Pântano Tóxico', novidade: 'Sua lança ficou mais forte!' },
  { lixo: 18, lodo: 4, espuma: 4, atirador: 3, bruto: 2, nome: 'Ruínas do Lixão', novidade: 'Os monstros estão mais numerosos!' },
  { lixo: 20, lodo: 5, espuma: 4, atirador: 4, bruto: 2, nome: 'Coração da Poluição', novidade: 'Os monstros ficaram mais fortes!' },
  { lixo: 22, lodo: 5, espuma: 5, atirador: 4, bruto: 3, nome: 'A Fonte Corrompida', novidade: 'Último nível: salve a Lagoa Juara!' }
];

export function configNivel(nivel) {
  const n = Math.min(Math.max(nivel, 1), NIVEL_MAXIMO);
  return { ...TABELA[n - 1] };
}