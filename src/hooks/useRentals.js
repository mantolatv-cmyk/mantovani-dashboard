"use client";

import { useState, useEffect } from "react";
import { isFirebaseConfigured, mockRentals } from "@/lib/mockData";

/**
 * Hook para escutar em tempo real a coleção de locações.
 * Usa dados mock quando o Firebase não está configurado.
 * @param {string|null} statusFilter - "ativa", "encerrada", ou null para todas
 * @param {number|null} limitCount - Limite de documentos (null = sem limite)
 */
export function useRentals(statusFilter = null, limitCount = null) {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      // Modo demo com dados fictícios
      const timer = setTimeout(() => {
        let filtered = [...mockRentals];
        if (statusFilter) {
          filtered = filtered.filter((r) => r.status === statusFilter);
        }
        // Ordena por data decrescente
        filtered.sort((a, b) => {
          const dateA = a.criadoEm instanceof Date ? a.criadoEm.getTime() : 0;
          const dateB = b.criadoEm instanceof Date ? b.criadoEm.getTime() : 0;
          return dateB - dateA;
        });
        if (limitCount) {
          filtered = filtered.slice(0, limitCount);
        }
        setRentals(filtered);
        setLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }

    // Modo Firebase real
    let unsubscribe;
    async function setup() {
      try {
        const { db } = await import("@/lib/firebase");
        const { collection, onSnapshot, query, where, orderBy, limit } = await import("firebase/firestore");

        const constraints = [];
        if (statusFilter) {
          constraints.push(where("status", "==", statusFilter));
        }
        constraints.push(orderBy("criadoEm", "desc"));
        if (limitCount) {
          constraints.push(limit(limitCount));
        }

        const q = query(collection(db, "locacoes"), ...constraints);

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setRentals(data);
            setLoading(false);
          },
          (err) => {
            console.error("Erro ao carregar locações:", err);
            setError(err.message);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Erro Firebase:", err);
        let filtered = [...mockRentals];
        if (statusFilter) filtered = filtered.filter((r) => r.status === statusFilter);
        if (limitCount) filtered = filtered.slice(0, limitCount);
        setRentals(filtered);
        setLoading(false);
      }
    }

    setup();
    return () => unsubscribe && unsubscribe();
  }, [statusFilter, limitCount]);

  return { rentals, loading, error };
}
