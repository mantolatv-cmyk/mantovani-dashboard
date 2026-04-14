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
  await updateDoc(docRef, {
    nome: data.nome,
    totalComprado: Number(data.totalComprado),
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

/**
 * Registra devolução: encerra locação + restaura estoque atomicamente.
 */
export async function returnRental(rentalId) {
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

    const equipRef = doc(db, "equipamentos", rentalData.equipamentoId);
    const equipDoc = await transaction.get(equipRef);

    if (equipDoc.exists()) {
      const equipData = equipDoc.data();
      transaction.update(equipRef, {
        disponivel: equipData.disponivel + rentalData.quantidade,
      });
    }

    // Encerra locação
    transaction.update(rentalRef, {
      status: "encerrada",
      encerradoEm: serverTimestamp(),
    });
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
    const equipRef = doc(db, "equipamentos", mainData.equipamentoId);
    const equipDoc = await transaction.get(equipRef);

    if (equipDoc.exists()) {
      const equipData = equipDoc.data();
      transaction.update(equipRef, {
        disponivel: equipData.disponivel + mainData.quantidade,
      });
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
    const equipRef = doc(db, "equipamentos", mainData.equipamentoId);
    const equipDoc = await transaction.get(equipRef);

    if (equipDoc.exists()) {
      const equipData = equipDoc.data();
      transaction.update(equipRef, {
        totalComprado: Math.max(0, equipData.totalComprado - mainData.quantidade),
      });
    }

    // Remove registro de manutenção
    transaction.delete(mainRef);
  });
}
