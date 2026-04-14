"use client";

import { useState, useEffect } from "react";
import { isFirebaseConfigured, mockMaintenances } from "@/lib/mockData";

/**
 * Hook para escutar em tempo real a coleção de manutenções.
 * Usa dados mock quando o Firebase não está configurado.
 */
export function useMaintenance() {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      const timer = setTimeout(() => {
        setMaintenances([...mockMaintenances]);
        setLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }

    let unsubscribe;
    async function setup() {
      try {
        const { db } = await import("@/lib/firebase");
        const { collection, onSnapshot, query, orderBy } = await import("firebase/firestore");

        const q = query(
          collection(db, "manutencoes"),
          orderBy("criadoEm", "desc")
        );

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setMaintenances(data);
            setLoading(false);
          },
          (err) => {
            console.error("Erro ao carregar manutenções:", err);
            setError(err.message);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Erro Firebase:", err);
        setMaintenances([...mockMaintenances]);
        setLoading(false);
      }
    }

    setup();
    return () => unsubscribe && unsubscribe();
  }, []);

  return { maintenances, loading, error };
}
