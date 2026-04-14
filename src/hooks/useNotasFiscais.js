"use client";

import { useState, useEffect } from "react";
import { getNotasFiscais, addNotaFiscal, deleteNotaFiscal } from "@/lib/firestore";
import { uploadNotaFiscal } from "@/lib/storage";
import { isFirebaseConfigured, mockNotasFiscais } from "@/lib/mockData";

export function useNotasFiscais() {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotas();
  }, []);

  async function fetchNotas() {
    try {
      setLoading(true);
      
      if (!isFirebaseConfigured()) {
        setTimeout(() => {
          setNotas([...mockNotasFiscais].sort((a,b) => b.criadoEm.getTime() - a.criadoEm.getTime()));
          setLoading(false);
        }, 400);
        return;
      }

      const data = await getNotasFiscais();
      setNotas(data);
    } catch (err) {
      console.error("Erro ao buscar notas fiscais:", err);
      setError("Não foi possível carregar as notas fiscais.");
    } finally {
      if (isFirebaseConfigured()) {
        setLoading(false);
      }
    }
  }

  const handleAddNota = async (data, fileBlob) => {
    try {
      if (!isFirebaseConfigured()) {
        // Apenas recarrega para simular ação, em produção não faz upload real sem FB
        console.warn("Firebase não configurado. Upload ignorado no modo demo.");
        return;
      }

      let arquivoUrl = "";
      if (fileBlob) {
        arquivoUrl = await uploadNotaFiscal(data.clienteNome, fileBlob);
      }
      
      const newNotaData = { ...data, arquivoUrl };
      await addNotaFiscal(newNotaData);
      await fetchNotas(); // recarrega a lista
    } catch (err) {
      console.error("Erro ao adicionar nota fiscal:", err);
      throw err;
    }
  };

  const handleDeleteNota = async (id) => {
    try {
      if (!isFirebaseConfigured()) {
        console.warn("Firebase não configurado. Delete ignorado no modo demo.");
        return;
      }

      await deleteNotaFiscal(id);
      await fetchNotas();
    } catch (err) {
      console.error("Erro ao deletar nota fiscal:", err);
      throw err;
    }
  };

  return { notas, loading, error, refresh: fetchNotas, handleAddNota, handleDeleteNota };
}
