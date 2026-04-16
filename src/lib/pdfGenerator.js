function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      return resolve();
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Carrega uma imagem e converte para Base64
 */
function getBase64Image(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
}

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
 * Gera o PDF do contrato de locação usando pdfmake via CDN Puro.
 * @param {Object} data - Dados da locação
 * @returns {Promise<Blob>} Blob do PDF gerado
 */
export async function generateContractPDF(data) {
  if (typeof window === "undefined") {
    throw new Error("PDFs só podem ser gerados no client-side");
  }

  try {
    if (!window.pdfMake) {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.min.js");
    }

    if (!window.pdfMake || !window.pdfMake.vfs) {
      throw new Error("Falha ao inicializar o PDFMake via CDN.");
    }

    const pdfMake = window.pdfMake;

    // Carrega a logo Base64
    let logoBase64 = null;
    try {
      logoBase64 = await getBase64Image("/logo.png");
    } catch (e) {
      console.warn("Falha ao carregar logo:", e);
    }

    const equipamentoTexto = `${data.equipamentoNome || "—"}${data.numeroEquipamento ? ` (Série: ${data.numeroEquipamento})` : ""} - Qtd: ${data.quantidade || 1}`;

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [50, 40, 50, 60],
      content: [
        logoBase64 
          ? { image: logoBase64, width: 120, alignment: "center", margin: [0, 0, 0, 10] }
          : { text: "BETONEIRAS MANTOVANI", style: "logo", alignment: "center" },
        
        { text: "Equipamentos para Construção Civil", style: "subtitle", alignment: "center", margin: [0, 0, 0, 20] },
        { text: "CONTRATO DE LOCAÇÃO", style: "mainTitle", alignment: "center", margin: [0, 0, 0, 25] },
        
        {
          columns: [
            {
              width: "*",
              text: [
                { text: "LOCADORA\n", bold: true, fontSize: 11 },
                "Empresa: Betoneiras Mantovani Ltda.\n",
                "CNPJ: 52.342.052/0001-40\n",
                "Endereço: Avenida São João, 1601, Atibaia/SP"
              ],
              style: "bodyText"
            },
            {
              width: "*",
              text: [
                { text: "LOCATÁRIO(A)\n", bold: true, fontSize: 11 },
                `Nome/Razão Social: ${data.clienteNome || "—"}\n`,
                `CPF/CNPJ: ${data.clienteCpf || "—"}\n`,
                `Endereço: ${data.clienteEndereco || "—"}`
              ],
              style: "bodyText"
            }
          ],
          margin: [0, 0, 0, 20]
        },

        { text: "Pelo presente instrumento particular, as partes acima qualificadas celebram entre si o presente Contrato de Locação de Equipamentos, que se regerá pelas cláusulas e condições a seguir:", style: "bodyText", margin: [0, 0, 0, 20] },

        { text: "CLÁUSULA PRIMEIRA – DO OBJETO", style: "sectionTitle" },
        { text: "1.1. O objeto do presente contrato é a locação, pela LOCADORA ao(à) LOCATÁRIO(A), do(s) seguinte(s) equipamento(s) de construção:", style: "bodyText" },
        { text: `Relação de Equipamento(s): ${equipamentoTexto}`, style: "bodyText", margin: [0, 5, 0, 15] },

        { text: "CLÁUSULA SEGUNDA – DO PRAZO E CONDIÇÕES DE LOCAÇÃO", style: "sectionTitle" },
        { text: `2.1. O prazo de locação do(s) equipamento(s) descrito(s) na Cláusula Primeira terá início na data ${formatDate(data.dataInicio)} e término na data ${formatDate(data.dataFim)}.`, style: "bodyText", margin: [0, 0, 0, 8] },
        { text: "2.2. A devolução do equipamento após a data estipulada acarretará em cobrança de diárias adicionais proporcionais, além de possível multa por atraso no importe estipulado pela política da empresa.", style: "bodyText", margin: [0, 0, 0, 15] },

        { text: "CLÁUSULA TERCEIRA – DO VALOR E FORMA DE PAGAMENTO", style: "sectionTitle" },
        { text: `3.1. Pela locação do(s) equipamento(s), o(a) LOCATÁRIO(A) pagará à LOCADORA o valor total de ${formatCurrency(data.valorTotal)}.`, style: "bodyText", margin: [0, 0, 0, 8] },
        { text: "3.2. O pagamento será efetuado através de [Inserir forma de pagamento padrão], na data de assinatura deste contrato ou no ato da retirada do equipamento.", style: "bodyText", margin: [0, 0, 0, 15] },

        { text: "CLÁUSULA QUARTA – DAS OBRIGAÇÕES E RESPONSABILIDADES", style: "sectionTitle" },
        { text: "4.1. Da LOCADORA: Entregar o equipamento em perfeitas condições de uso, funcionamento e segurança, realizando testes prévios na presença do(a) LOCATÁRIO(A) ou de seu representante autorizado.", style: "bodyText", margin: [0, 0, 0, 8] },
        { text: "4.2. Do(a) LOCATÁRIO(A):", style: "bodyText", margin: [0, 0, 0, 5] },
        {
          ul: [
            "Utilizar o equipamento estritamente para os fins a que se destina, operando-o exclusivamente por pessoas capacitadas.",
            "Zelar pela guarda, conservação e manutenção preventiva do equipamento durante todo o período de vigência da locação.",
            "Restituir o equipamento nas mesmas condições iniciais em que o recebeu, ressalvado o desgaste natural pelo uso regular.",
            "Responsabilizar-se integralmente por roubo, furto, perda, incêndio ou danos causados ao equipamento durante o período em que este estiver sob sua posse."
          ],
          style: "bulletPoints",
          margin: [15, 0, 0, 40]
        },

        { text: `Atibaia - SP, ${getDataHoje()}.`, style: "bodyText", alignment: "center", margin: [0, 0, 0, 40] },

        {
          columns: [
            {
              width: "*",
              stack: [
                { text: "________________________________________", margin: [0, 20, 0, 0] },
                { text: "BETONEIRAS MANTOVANI", bold: true },
                { text: "LOCADORA" }
              ],
              alignment: "center",
              style: "signatureArea"
            },
            {
              width: "*",
              stack: [
                { text: "________________________________________", margin: [0, 20, 0, 0] },
                { text: data.clienteNome ? data.clienteNome.toUpperCase() : "LOCATÁRIO(A)", bold: true },
                { text: "LOCATÁRIO(A)" }
              ],
              alignment: "center",
              style: "signatureArea"
            }
          ]
        }
      ],
      styles: {
        logo: { fontSize: 20, bold: true, color: "#1e3a5f" },
        subtitle: { fontSize: 12, color: "#475569" },
        mainTitle: { fontSize: 16, bold: true, decoration: "underline", color: "#000000" },
        sectionTitle: { fontSize: 11, bold: true, margin: [0, 10, 0, 5], color: "#000000" },
        bodyText: { fontSize: 10, lineHeight: 1.4, color: "#000000" },
        bulletPoints: { fontSize: 10, lineHeight: 1.4, color: "#000000" },
        signatureArea: { fontSize: 10 }
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
    throw err;
  }
}
}
