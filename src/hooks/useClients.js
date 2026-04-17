"use client";

import { useState, useEffect } from "react";
import { isFirebaseConfigured } from "@/lib/mockData";

export function useClients() {
  const [dbClients, setDbClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setDbClients([]);
      setLoading(false);
      return;
    }

    let unsubscribe;
    async function setup() {
      try {
        const { db } = await import("@/lib/firebase");
        const { collection, onSnapshot, query, orderBy } = await import("firebase/firestore");

        const q = query(collection(db, "clientes"), orderBy("nome", "asc"));

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const list = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setDbClients(list);
            setLoading(false);
          },
          (err) => {
            console.error("Erro ao carregar clientes avulsos:", err);
            setError(err.message);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Erro Firebase clientes:", err);
        setDbClients([]);
        setLoading(false);
      }
    }

    setup();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { dbClients, loading, error };
}
