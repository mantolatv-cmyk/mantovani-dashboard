/**
 * Dados fictícios para visualização quando o Firebase não está configurado.
 */

export const mockEquipments = [
  { id: "eq1", nome: "Betoneira 400L", totalComprado: 8, disponivel: 3, criadoEm: new Date("2025-01-10") },
  { id: "eq2", nome: "Andaime Metálico (jogo)", totalComprado: 20, disponivel: 8, criadoEm: new Date("2025-01-10") },
  { id: "eq3", nome: "Compactador de Solo", totalComprado: 5, disponivel: 1, criadoEm: new Date("2025-02-15") },
  { id: "eq4", nome: "Martelete Rompedor", totalComprado: 6, disponivel: 4, criadoEm: new Date("2025-02-15") },
  { id: "eq5", nome: "Vibrador de Concreto", totalComprado: 10, disponivel: 6, criadoEm: new Date("2025-03-01") },
  { id: "eq6", nome: "Serra Circular de Bancada", totalComprado: 4, disponivel: 2, criadoEm: new Date("2025-03-01") },
  { id: "eq7", nome: "Escora Metálica (unidade)", totalComprado: 50, disponivel: 22, criadoEm: new Date("2025-04-10") },
  { id: "eq8", nome: "Placa Vibratória", totalComprado: 3, disponivel: 0, criadoEm: new Date("2025-05-20") },
  { id: "eq9", nome: "Guincho Elétrico 300kg", totalComprado: 2, disponivel: 1, criadoEm: new Date("2025-06-01") },
  { id: "eq10", nome: "Cortadora de Piso", totalComprado: 4, disponivel: 3, criadoEm: new Date("2025-06-15") },
];

export const mockRentals = [
  {
    id: "loc1",
    cliente: { nome: "Carlos Alberto Souza", cpf: "123.456.789-00", email: "carlos@email.com", telefone: "(11) 98765-4321", endereco: "Rua das Acácias, 150 - São Paulo" },
    equipamentoId: "eq1", equipamentoNome: "Betoneira 400L", quantidade: 2,
    dataInicio: "2026-04-01", dataFim: "2026-04-20", valorTotal: 1800.00,
    status: "ativa", contratoUrl: "", criadoEm: new Date("2026-04-01"), encerradoEm: null,
  },
  {
    id: "loc2",
    cliente: { nome: "Fernanda Lima Pereira", cpf: "987.654.321-00", email: "fernanda@construtora.com", telefone: "(21) 99876-5432", endereco: "Av. Brasil, 2500 - Rio de Janeiro" },
    equipamentoId: "eq2", equipamentoNome: "Andaime Metálico (jogo)", quantidade: 6,
    dataInicio: "2026-03-28", dataFim: "2026-04-15", valorTotal: 3600.00,
    status: "ativa", contratoUrl: "", criadoEm: new Date("2026-03-28"), encerradoEm: null,
  },
  {
    id: "loc3",
    cliente: { nome: "Roberto Mendes", cpf: "456.789.123-00", email: "roberto.m@gmail.com", telefone: "(31) 97654-3210", endereco: "Rua Minas Gerais, 800 - Belo Horizonte" },
    equipamentoId: "eq3", equipamentoNome: "Compactador de Solo", quantidade: 2,
    dataInicio: "2026-04-05", dataFim: "2026-04-18", valorTotal: 2200.00,
    status: "ativa", contratoUrl: "", criadoEm: new Date("2026-04-05"), encerradoEm: null,
  },
  {
    id: "loc4",
    cliente: { nome: "Mariana Costa", cpf: "321.654.987-00", email: "mariana.c@hotmail.com", telefone: "(41) 96543-2109", endereco: "Rua Paraná, 300 - Curitiba" },
    equipamentoId: "eq8", equipamentoNome: "Placa Vibratória", quantidade: 3,
    dataInicio: "2026-04-08", dataFim: "2026-04-25", valorTotal: 4500.00,
    status: "ativa", contratoUrl: "", criadoEm: new Date("2026-04-08"), encerradoEm: null,
  },
  {
    id: "loc5",
    cliente: { nome: "João Pedro Almeida", cpf: "654.321.987-00", email: "joao.pa@empresa.com", telefone: "(51) 95432-1098", endereco: "Av. Farrapos, 1200 - Porto Alegre" },
    equipamentoId: "eq1", equipamentoNome: "Betoneira 400L", quantidade: 3,
    dataInicio: "2026-03-10", dataFim: "2026-03-30", valorTotal: 2700.00,
    status: "encerrada", contratoUrl: "", criadoEm: new Date("2026-03-10"), encerradoEm: new Date("2026-03-29"),
  },
  {
    id: "loc6",
    cliente: { nome: "Ana Beatriz Fonseca", cpf: "789.123.456-00", email: "ana.bf@gmail.com", telefone: "(61) 94321-0987", endereco: "SQS 308, Bloco A - Brasília" },
    equipamentoId: "eq5", equipamentoNome: "Vibrador de Concreto", quantidade: 2,
    dataInicio: "2026-03-15", dataFim: "2026-03-28", valorTotal: 1400.00,
    status: "encerrada", contratoUrl: "", criadoEm: new Date("2026-03-15"), encerradoEm: new Date("2026-03-28"),
  },
  {
    id: "loc7",
    cliente: { nome: "Marcos Vinícius Torres", cpf: "147.258.369-00", email: "marcos.vt@obra.com", telefone: "(71) 93210-9876", endereco: "Rua da Bahia, 450 - Salvador" },
    equipamentoId: "eq6", equipamentoNome: "Serra Circular de Bancada", quantidade: 2,
    dataInicio: "2026-02-20", dataFim: "2026-03-10", valorTotal: 1600.00,
    status: "encerrada", contratoUrl: "", criadoEm: new Date("2026-02-20"), encerradoEm: new Date("2026-03-09"),
  },
  {
    id: "loc8",
    cliente: { nome: "Luciana Ribeiro", cpf: "258.369.147-00", email: "luciana.r@constru.com", telefone: "(81) 92109-8765", endereco: "Av. Boa Viagem, 900 - Recife" },
    equipamentoId: "eq7", equipamentoNome: "Escora Metálica (unidade)", quantidade: 28,
    dataInicio: "2026-03-01", dataFim: "2026-04-10", valorTotal: 5600.00,
    status: "ativa", contratoUrl: "", criadoEm: new Date("2026-03-01"), encerradoEm: null,
  },
  {
    id: "loc9",
    cliente: { nome: "Eduardo Campos", cpf: "369.147.258-00", email: "eduardo.c@gmail.com", telefone: "(85) 91098-7654", endereco: "Rua do Ceará, 200 - Fortaleza" },
    equipamentoId: "eq4", equipamentoNome: "Martelete Rompedor", quantidade: 2,
    dataInicio: "2026-02-01", dataFim: "2026-02-15", valorTotal: 1200.00,
    status: "encerrada", contratoUrl: "", criadoEm: new Date("2026-02-01"), encerradoEm: new Date("2026-02-14"),
  },
  {
    id: "loc10",
    cliente: { nome: "Patrícia Gomes", cpf: "951.753.486-00", email: "patricia.g@hotmail.com", telefone: "(91) 90987-6543", endereco: "Travessa Amazonas, 50 - Belém" },
    equipamentoId: "eq9", equipamentoNome: "Guincho Elétrico 300kg", quantidade: 1,
    dataInicio: "2026-04-10", dataFim: "2026-04-30", valorTotal: 3200.00,
    status: "ativa", contratoUrl: "", criadoEm: new Date("2026-04-10"), encerradoEm: null,
  },
];

/**
 * Gera dados de histórico a partir das locações mockadas.
 * Cada locação gera uma "entrega" e, se encerrada, uma "devolução".
 */
export function getMockHistory() {
  const history = [];

  for (const rental of mockRentals) {
    // Registro de entrega
    history.push({
      id: `hist-entrega-${rental.id}`,
      tipo: "entrega",
      clienteNome: rental.cliente.nome,
      equipamentoNome: rental.equipamentoNome,
      quantidade: rental.quantidade,
      data: rental.dataInicio,
      locacaoId: rental.id,
    });

    // Registro de devolução (se encerrada)
    if (rental.status === "encerrada" && rental.encerradoEm) {
      const encerradoDate = rental.encerradoEm instanceof Date
        ? rental.encerradoEm.toISOString().split("T")[0]
        : rental.dataFim;

      history.push({
        id: `hist-devol-${rental.id}`,
        tipo: "devolucao",
        clienteNome: rental.cliente.nome,
        equipamentoNome: rental.equipamentoNome,
        quantidade: rental.quantidade,
        data: encerradoDate,
        locacaoId: rental.id,
      });
    }
  }

  // Ordena por data decrescente
  history.sort((a, b) => b.data.localeCompare(a.data));

  return history;
}

/**
 * Dados fictícios de manutenções.
 * Status: "esperando_pecas" | "pronto" | "irreparavel"
 */
export const mockMaintenances = [
  {
    id: "man1",
    equipamentoId: "eq1",
    equipamentoNome: "Betoneira 400L",
    quantidade: 1,
    status: "esperando_pecas",
    observacao: "Motor apresentando superaquecimento. Peça do motor encomendada.",
    criadoEm: new Date("2026-04-02"),
    atualizadoEm: new Date("2026-04-05"),
  },
  {
    id: "man2",
    equipamentoId: "eq3",
    equipamentoNome: "Compactador de Solo",
    quantidade: 1,
    status: "pronto",
    observacao: "Troca do filtro de ar e regulagem concluída. Pronto para uso.",
    criadoEm: new Date("2026-03-25"),
    atualizadoEm: new Date("2026-04-08"),
  },
  {
    id: "man3",
    equipamentoId: "eq5",
    equipamentoNome: "Vibrador de Concreto",
    quantidade: 1,
    status: "irreparavel",
    observacao: "Eixo central quebrado. Custo de reparo superior ao valor do equipamento.",
    criadoEm: new Date("2026-03-10"),
    atualizadoEm: new Date("2026-03-18"),
  },
  {
    id: "man4",
    equipamentoId: "eq6",
    equipamentoNome: "Serra Circular de Bancada",
    quantidade: 1,
    status: "esperando_pecas",
    observacao: "Disco de corte e rolamentos danificados. Aguardando fornecedor.",
    criadoEm: new Date("2026-04-10"),
    atualizadoEm: new Date("2026-04-10"),
  },
  {
    id: "man5",
    equipamentoId: "eq9",
    equipamentoNome: "Guincho Elétrico 300kg",
    quantidade: 1,
    status: "pronto",
    observacao: "Cabo de aço substituído e sistema elétrico revisado.",
    criadoEm: new Date("2026-04-01"),
    atualizadoEm: new Date("2026-04-12"),
  },
];

/**
 * Verifica se o Firebase está configurado (possui API key válida)
 */
export function isFirebaseConfigured() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  return apiKey && apiKey !== "sua-api-key-aqui" && apiKey.length > 10;
}
