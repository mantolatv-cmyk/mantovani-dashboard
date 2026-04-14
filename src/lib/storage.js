import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Faz upload do PDF do contrato para o Firebase Storage.
 * Organiza em pastas: contratos/{nomeCliente}/{timestamp}.pdf
 * @returns URL pública do arquivo
 */
export async function uploadContract(clientName, pdfBlob) {
  // Normaliza nome do cliente para usar como nome de pasta
  const sanitizedName = clientName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase();

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filePath = `contratos/${sanitizedName}/contrato_${timestamp}.pdf`;

  const storageRef = ref(storage, filePath);
  const snapshot = await uploadBytes(storageRef, pdfBlob, {
    contentType: "application/pdf",
  });

  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}
