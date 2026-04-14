"use client";

import { useState, useEffect } from "react";
import { isFirebaseConfigured, mockEquipments } from "@/lib/mockData";

/**
 * Hook para escutar em tempo real a coleção de equipamentos.
 * Usa dados mock quando o Firebase não está configurado.
 */
export function useEquipments() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      // Modo demo com dados fictícios
      const timer = setTimeout(() => {
        setEquipments(mockEquipments);
        setLoading(false);
      }, 400); // Simula loading
      return () => clearTimeout(timer);
    }

    // Modo Firebase real
    let unsubscribe;
    async function setup() {
      try {
        const { db } = await import("@/lib/firebase");
        const { collection, onSnapshot, query, orderBy } = await import("firebase/firestore");

        const q = query(
          collection(db, "equipamentos"),
          orderBy("nome", "asc")
        );

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setEquipments(data);
            setLoading(false);
          },
          (err) => {
            console.error("Erro ao carregar equipamentos:", err);
            setError(err.message);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Erro Firebase:", err);
        setEquipments(mockEquipments);
        setLoading(false);
      }
    }

    setup();
    return () => unsubscribe && unsubscribe();
  }, []);

  return { equipments, loading, error };
}
