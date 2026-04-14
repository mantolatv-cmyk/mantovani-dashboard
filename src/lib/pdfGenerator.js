// Imports dinâmicos usados dentro da função para segurança no App Router

/**
 * Formata data ISO para formato brasileiro dd/mm/aaaa
 */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Retorna a data de hoje formatada em pt-BR
 */
function getDataHoje() {
  const now = new Date();
  const options = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  };
  return now.toLocaleDateString("pt-BR", options);
}

/**
 * Formata valor em reais
 */
function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Gera o PDF do contrato de locação usando pdfmake.
 * @param {Object} data - Dados da locação
 * @returns {Promise<Blob>} Blob do PDF gerado
 */
export async function generateContractPDF(data) {
  if (typeof window === "undefined") {
    throw new Error("PDFs só podem ser gerados no client-side");
  }

  try {
    // Carregamento dinâmico para evitar problemas de SSR no Next.js
    const pdfMakeModule = await import("pdfmake/build/pdfmake");
    const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
    
    const pdfMake = pdfMakeModule.default || pdfMakeModule;
    const pdfFonts = pdfFontsModule.default || pdfFontsModule;
    
    // Atribuição padrão do VFS para pdfmake
    if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
    } else if (pdfFonts && pdfFonts.vfs) {
      pdfMake.vfs = pdfFonts.vfs;
    }

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],
      content: [
        { text: "MANTOVANI", style: "header", alignment: "center" },
        { text: "Locação de Equipamentos", style: "subtitle", alignment: "center", margin: [0, 0, 0, 20] },
        { text: "CONTRATO DE LOCAÇÃO", style: "title", alignment: "center", margin: [0, 0, 0, 20] },
        
        { text: "DADOS DO LOCATÁRIO", style: "section" },
        { text: `Nome: ${data.clienteNome || "—"}`, margin: [0, 2] },
        { text: `CPF: ${data.clienteCpf || "—"}`, margin: [0, 2] },
        { text: `Endereço: ${data.clienteEndereco || "—"}`, margin: [0, 2, 0, 15] },

        { text: "DADOS DA LOCAÇÃO", style: "section" },
        {
          table: {
            widths: ["*", "auto", "auto"],
            body: [
              [{ text: "Item", bold: true }, { text: "Ref/Série", bold: true }, { text: "Qtd", bold: true }],
              [
                { text: data.equipamentoNome || "—" },
                { text: data.numeroEquipamento || "—" },
                { text: String(data.quantidade || 1), alignment: "center" }
              ]
            ]
          },
          margin: [0, 5, 0, 15]
        },

        { text: `Vigência: ${formatDate(data.dataInicio)} até ${formatDate(data.dataFim)}`, margin: [0, 5] },
        { text: `Valor Total: ${formatCurrency(data.valorTotal)}`, bold: true, margin: [0, 5, 0, 20] },

        { text: "Assinaturas:", margin: [0, 40, 0, 0] },
        {
          columns: [
            {
              stack: [
                { text: "__________________________", margin: [0, 20, 0, 0] },
                { text: "MANTOVANI", bold: true },
                { text: "Locadora", fontSize: 8 }
              ],
              alignment: "center"
            },
            {
              stack: [
                { text: "__________________________", margin: [0, 20, 0, 0] },
                { text: data.clienteNome || "LOCATÁRIO", bold: true },
                { text: "Locatário", fontSize: 8 }
              ],
              alignment: "center"
            }
          ]
        },
        { text: getDataHoje(), alignment: "right", margin: [0, 20, 0, 0], fontSize: 8, color: "#999" }
      ],
      styles: {
        header: { fontSize: 22, bold: true, color: "#1e3a5f" },
        subtitle: { fontSize: 10, color: "#666" },
        title: { fontSize: 14, bold: true, decoration: "underline" },
        section: { fontSize: 11, bold: true, margin: [0, 10, 0, 5], color: "#1e3a5f" }
      },
      defaultStyle: { font: "Roboto", fontSize: 10 }
    };

    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = pdfMake.createPdf(docDefinition);
        pdfDoc.getBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Erro ao gerar Blob do PDF"));
        });
      } catch (err) {
        reject(err);
      }
    });

  } catch (err) {
    console.error("Erro fatal no PDF Generator:", err);
    throw err;
  }
}
