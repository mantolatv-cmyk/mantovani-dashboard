import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// ========================
// EQUIPAMENTOS
// ========================

const equipamentosRef = collection(db, "equipamentos");

export async function getEquipments() {
  const q = query(equipamentosRef, orderBy("nome", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function addEquipment(data) {
  const docRef = await addDoc(equipamentosRef, {
    nome: data.nome,
    totalComprado: Number(data.totalComprado),
    disponivel: Number(data.totalComprado),
    criadoEm: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateEquipment(id, data) {
  const docRef = doc(db, "equipamentos", id);

  await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(docRef);
    if (!docSnap.exists()) throw new Error("Equipamento não encontrado.");

    const oldData = docSnap.data();
    const oldTotal = Number(oldData.totalComprado) || 0;
    const newTotal = Number(data.totalComprado);
    const diff = newTotal - oldTotal;

    transaction.update(docRef, {
      nome: data.nome,
      totalComprado: newTotal,
      disponivel: (Number(oldData.disponivel) || 0) + diff,
    });
  });
}

export async function deleteEquipment(id) {
  await deleteDoc(doc(db, "equipamentos", id));
}

// ========================
// LOCAÇÕES
// ========================

const locacoesRef = collection(db, "locacoes");

export async function getRentals(statusFilter = null) {
  let q;
  if (statusFilter) {
    q = query(
      locacoesRef,
      where("status", "==", statusFilter),
      orderBy("criadoEm", "desc")
    );
  } else {
    q = query(locacoesRef, orderBy("criadoEm", "desc"));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getRecentRentals(count = 5) {
  const q = query(locacoesRef, orderBy("criadoEm", "desc"), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Cria uma nova locação com dedução atômica de estoque.
 * Usa runTransaction para garantir consistência.
 * @throws Error se estoque insuficiente
 */
export async function createRental(rentalData) {
  const equipRef = doc(db, "equipamentos", rentalData.equipamentoId);
  const quantidade = Number(rentalData.quantidade);

  const rentalId = await runTransaction(db, async (transaction) => {
    const equipDoc = await transaction.get(equipRef);

    if (!equipDoc.exists()) {
      throw new Error("Equipamento não encontrado.");
    }

    const equipData = equipDoc.data();
    const novoDisponivel = equipData.disponivel - quantidade;

    if (novoDisponivel < 0) {
      throw new Error(
        `Estoque insuficiente. Disponível: ${equipData.disponivel}, Solicitado: ${quantidade}`
      );
    }

    // Deduz estoque
    transaction.update(equipRef, { disponivel: novoDisponivel });

    // Cria documento da locação
    const newRentalRef = doc(collection(db, "locacoes"));
    transaction.set(newRentalRef, {
      cliente: {
        nome: rentalData.clienteNome,
        cpf: rentalData.clienteCpf,
        email: rentalData.clienteEmail,
        telefone: rentalData.clienteTelefone,
        endereco: rentalData.clienteEndereco,
      },
      equipamentoId: rentalData.equipamentoId,
      equipamentoNome: rentalData.equipamentoNome,
      numeroEquipamento: rentalData.numeroEquipamento || "",
      quantidade: quantidade,
      dataInicio: rentalData.dataInicio,
      dataFim: rentalData.dataFim,
      valorTotal: Number(rentalData.valorTotal),
      status: "ativa",
      contratoUrl: rentalData.contratoUrl || "",
      criadoEm: serverTimestamp(),
      encerradoEm: null,
    });

    return newRentalRef.id;
  });

  return rentalId;
}

// ========================
// CLIENTES (Independentes)
// ========================

export async function addCliente(clienteData) {
  const docRef = await addDoc(collection(db, "clientes"), {
    nome: clienteData.nome || "",
    cpf: clienteData.cpf || "",
    email: clienteData.email || "",
    telefone: clienteData.telefone || "",
    endereco: clienteData.endereco || "",
    criadoEm: serverTimestamp(),
  });
  return { id: docRef.id, ...clienteData };
}

/**
 * Registra devolução: encerra locação + restaura estoque atomicamente.
 */
export async function returnRental(rentalId, quantityToReturn) {
  const rentalRef = doc(db, "locacoes", rentalId);

  await runTransaction(db, async (transaction) => {
    const rentalDoc = await transaction.get(rentalRef);

    if (!rentalDoc.exists()) {
      throw new Error("Locação não encontrada.");
    }

    const rentalData = rentalDoc.data();

    if (rentalData.status === "encerrada") {
      throw new Error("Esta locação já foi encerrada.");
    }

    const qtdOriginal = Number(rentalData.quantidade) || 1;
    const qtdDevolvidaAnterior = Number(rentalData.quantidadeDevolvida) || 0;
    const saldoRestante = qtdOriginal - qtdDevolvidaAnterior;
    
    // Se a quantidade não foi informada, assume devolução total do saldo
    let qtd = quantityToReturn !== undefined ? Number(quantityToReturn) : saldoRestante;
    if (isNaN(qtd) || qtd <= 0) throw new Error("Quantidade inválida para devolução.");
    if (qtd > saldoRestante) throw new Error(`Não é possível devolver mais do que o saldo restante (${saldoRestante}).`);

    // Atualiza estoque
    if (rentalData.equipamentoId && typeof rentalData.equipamentoId === 'string') {
      const equipRef = doc(db, "equipamentos", rentalData.equipamentoId);
      const equipDoc = await transaction.get(equipRef);

      if (equipDoc.exists()) {
        const equipData = equipDoc.data();
        transaction.update(equipRef, {
          disponivel: equipData.disponivel + qtd,
        });
      }
    }

    const novaQtdDevolvida = qtdDevolvidaAnterior + qtd;
    const historicoAtual = rentalData.historicoDevolucoes || [];
    
    // IMPORTANTE: FieldValue.serverTimestamp() não pode ser colocado dentro de um array. 
    // Precisamos usar Timestamp.now() (tempo do cliente) ou salvar fora do array.
    const novoHistorico = [...historicoAtual, { quantidade: qtd, data: Timestamp.now() }];

    const updates = {
      quantidadeDevolvida: novaQtdDevolvida,
      historicoDevolucoes: novoHistorico,
      atualizadoEm: serverTimestamp()
    };

    if (novaQtdDevolvida >= qtdOriginal) {
      updates.status = "encerrada";
      updates.encerradoEm = serverTimestamp();
    }

    transaction.update(rentalRef, updates);
  });
}

/**
 * Atualiza a URL do contrato em uma locação existente.
 */
export async function updateRentalContractUrl(rentalId, url) {
  const rentalRef = doc(db, "locacoes", rentalId);
  await updateDoc(rentalRef, { contratoUrl: url });
}

// ========================
// MANUTENÇÕES
// ========================

/**
 * Envia equipamento para manutenção: deduz do estoque disponível atomicamente.
 */
export async function sendToMaintenance(data) {
  const equipRef = doc(db, "equipamentos", data.equipamentoId);
  const quantidade = Number(data.quantidade);

  const maintenanceId = await runTransaction(db, async (transaction) => {
    const equipDoc = await transaction.get(equipRef);

    if (!equipDoc.exists()) {
      throw new Error("Equipamento não encontrado.");
    }

    const equipData = equipDoc.data();
    const novoDisponivel = equipData.disponivel - quantidade;

    if (novoDisponivel < 0) {
      throw new Error(
        `Estoque insuficiente. Disponível: ${equipData.disponivel}, Solicitado: ${quantidade}`
      );
    }

    // Deduz estoque
    transaction.update(equipRef, { disponivel: novoDisponivel });

    // Cria registro de manutenção
    const newMainRef = doc(collection(db, "manutencoes"));
    transaction.set(newMainRef, {
      equipamentoId: data.equipamentoId,
      equipamentoNome: data.equipamentoNome,
      numeroEquipamento: data.numeroEquipamento || "",
      quantidade: quantidade,
      status: "esperando_pecas",
      observacao: data.observacao || "",
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });

    return newMainRef.id;
  });

  return maintenanceId;
}

/**
 * Atualiza o status de uma manutenção.
 */
export async function updateMaintenanceStatus(maintenanceId, newStatus) {
  const mainRef = doc(db, "manutencoes", maintenanceId);
  await updateDoc(mainRef, {
    status: newStatus,
    atualizadoEm: serverTimestamp(),
  });
}

/**
 * Devolve equipamento da manutenção ao estoque (quando pronto).
 * Remove o registro de manutenção e restaura o estoque.
 */
export async function returnFromMaintenance(maintenanceId) {
  const mainRef = doc(db, "manutencoes", maintenanceId);

  await runTransaction(db, async (transaction) => {
    const mainDoc = await transaction.get(mainRef);

    if (!mainDoc.exists()) {
      throw new Error("Registro de manutenção não encontrado.");
    }

    const mainData = mainDoc.data();
    if (mainData.equipamentoId) {
      const equipRef = doc(db, "equipamentos", mainData.equipamentoId);
      const equipDoc = await transaction.get(equipRef);

      if (equipDoc.exists()) {
        const equipData = equipDoc.data();
        transaction.update(equipRef, {
          disponivel: equipData.disponivel + mainData.quantidade,
        });
      }
    }

    // Remove registro de manutenção
    transaction.delete(mainRef);
  });
}

/**
 * Dá baixa em equipamento irreparável.
 * Deduz do totalComprado e remove o registro de manutenção.
 */
export async function writeOffEquipment(maintenanceId) {
  const mainRef = doc(db, "manutencoes", maintenanceId);

  await runTransaction(db, async (transaction) => {
    const mainDoc = await transaction.get(mainRef);

    if (!mainDoc.exists()) {
      throw new Error("Registro de manutenção não encontrado.");
    }

    const mainData = mainDoc.data();
    if (mainData.equipamentoId) {
      const equipRef = doc(db, "equipamentos", mainData.equipamentoId);
      const equipDoc = await transaction.get(equipRef);

      if (equipDoc.exists()) {
        const equipData = equipDoc.data();
        transaction.update(equipRef, {
          totalComprado: Math.max(0, equipData.totalComprado - mainData.quantidade),
        });
      }
    }

    // Remove registro de manutenção
    transaction.delete(mainRef);
  });
}

// ========================
// NOTAS FISCAIS
// ========================

const notasFiscaisRef = collection(db, "notas_fiscais");

export async function getNotasFiscais() {
  const q = query(notasFiscaisRef, orderBy("criadoEm", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function addNotaFiscal(data) {
  const docRef = await addDoc(notasFiscaisRef, {
    clienteNome: data.clienteNome,
    clienteCpf: data.clienteCpf || "",
    numeroNota: data.numeroNota,
    valor: Number(data.valor) || 0,
    dataEmissao: data.dataEmissao,
    arquivoUrl: data.arquivoUrl || "",
    criadoEm: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteNotaFiscal(id) {
  await deleteDoc(doc(db, "notas_fiscais", id));
}

/**
 * LIMPEZA TOTAL (Reset do sistema para dados reais)
 */
export async function wipeAllData() {
  // 1. Limpa todas as locações
  const rentals = await getDocs(locacoesRef);
  for (const docSnap of rentals.docs) {
    await deleteDoc(doc(db, "locacoes", docSnap.id));
  }

  // 2. Limpa todas as notas fiscais
  const notas = await getDocs(notasFiscaisRef);
  for (const docSnap of notas.docs) {
    await deleteDoc(doc(db, "notas_fiscais", docSnap.id));
  }

  // 3. Limpa todas as manutenções
  const manut = await getDocs(collection(db, "manutencoes"));
  for (const docSnap of manut.docs) {
    await deleteDoc(doc(db, "manutencoes", docSnap.id));
  }

  // 4. Restaura estoque disponível para o valor total em todos os equipamentos
  const equips = await getDocs(equipamentosRef);
  for (const docSnap of equips.docs) {
    const data = docSnap.data();
    await updateDoc(doc(db, "equipamentos", docSnap.id), {
      disponivel: Number(data.totalComprado) || 0,
    });
  }
}
