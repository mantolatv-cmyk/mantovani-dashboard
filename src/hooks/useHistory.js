"use client";

import { useState, useEffect } from "react";
import { isFirebaseConfigured, getMockHistory } from "@/lib/mockData";

/**
 * Hook para carregar o histórico de movimentações (entregas e devoluções).
 * Combina dados de locações ativas e encerradas.
 */
export function useHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      // Modo demo
      const timer = setTimeout(() => {
        setHistory(getMockHistory());
        setLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }

    // Modo Firebase real
    let unsubscribe;
    async function setup() {
      try {
        const { db } = await import("@/lib/firebase");
        const { collection, onSnapshot, query, orderBy } = await import("firebase/firestore");

        const q = query(collection(db, "locacoes"), orderBy("criadoEm", "desc"));

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const entries = [];
            snapshot.docs.forEach((doc) => {
              const data = doc.data();

              // Entrega
              entries.push({
                id: `entrega-${doc.id}`,
                tipo: "entrega",
                clienteNome: data.cliente?.nome || "—",
                equipamentoNome: data.equipamentoNome || "—",
                quantidade: data.quantidade || 1,
                data: data.dataInicio || "",
                locacaoId: doc.id,
              });

              // Devolução
              if (data.status === "encerrada") {
                const encerradoDate = data.encerradoEm?.toDate
                  ? data.encerradoEm.toDate().toISOString().split("T")[0]
                  : data.dataFim || "";

                entries.push({
                  id: `devol-${doc.id}`,
                  tipo: "devolucao",
                  clienteNome: data.cliente?.nome || "—",
                  equipamentoNome: data.equipamentoNome || "—",
                  quantidade: data.quantidade || 1,
                  data: encerradoDate,
                  locacaoId: doc.id,
                });
              }
            });

            entries.sort((a, b) => b.data.localeCompare(a.data));
            setHistory(entries);
            setLoading(false);
          },
          (err) => {
            console.error("Erro ao carregar histórico:", err);
            setError(err.message);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Erro Firebase:", err);
        setHistory(getMockHistory());
        setLoading(false);
      }
    }

    setup();
    return () => unsubscribe && unsubscribe();
  }, []);

  return { history, loading, error };
}
