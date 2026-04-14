"use client";

import { useState, useEffect } from "react";
import { getNotasFiscais, addNotaFiscal, deleteNotaFiscal } from "@/lib/firestore";
import { uploadNotaFiscal } from "@/lib/storage";

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
      const data = await getNotasFiscais();
      setNotas(data);
    } catch (err) {
      console.error("Erro ao buscar notas fiscais:", err);
      setError("Não foi possível carregar as notas fiscais.");
    } finally {
      setLoading(false);
    }
  }

  const handleAddNota = async (data, fileBlob) => {
    try {
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
      await deleteNotaFiscal(id);
      await fetchNotas();
    } catch (err) {
      console.error("Erro ao deletar nota fiscal:", err);
      throw err;
    }
  };

  return { notas, loading, error, refresh: fetchNotas, handleAddNota, handleDeleteNota };
}
