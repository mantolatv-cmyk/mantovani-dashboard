import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

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
export function generateContractPDF(data) {
  return Promise.race([
    new Promise((resolve, reject) => {
      try {
        if (typeof window !== "undefined") {
           const vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts;
           pdfMake.vfs = vfs;
        } else {
           return reject(new Error("PDFs só podem ser gerados no client-side"));
        }

      const docDefinition = {
        pageSize: "A4",
        pageMargins: [50, 60, 50, 60],

        content: [
          // Cabeçalho
          {
            text: "MANTOVANI",
            style: "companyName",
            alignment: "center",
          },
          {
            text: "Locação de Equipamentos de Construção",
            style: "companySubtitle",
            alignment: "center",
            margin: [0, 0, 0, 8],
          },
          {
            canvas: [
              {
                type: "line",
                x1: 0,
                y1: 0,
                x2: 495,
                y2: 0,
                lineWidth: 2,
                lineColor: "#1e40af",
              },
            ],
            margin: [0, 0, 0, 20],
          },
          {
            text: "CONTRATO DE LOCAÇÃO DE EQUIPAMENTOS",
            style: "title",
            alignment: "center",
            margin: [0, 0, 0, 25],
          },

          // Dados das partes
          {
            text: "PARTES CONTRATANTES",
            style: "sectionHeader",
            margin: [0, 0, 0, 10],
          },
          {
            text: [
              { text: "LOCADORA: ", bold: true },
              "MANTOVANI LOCAÇÃO DE EQUIPAMENTOS DE CONSTRUÇÃO",
            ],
            style: "body",
            margin: [0, 0, 0, 6],
          },
          {
            text: [
              { text: "LOCATÁRIO(A): ", bold: true },
              data.clienteNome || "—",
            ],
            style: "body",
            margin: [0, 0, 0, 4],
          },
          {
            text: [{ text: "CPF: ", bold: true }, data.clienteCpf || "—"],
            style: "body",
            margin: [0, 0, 0, 4],
          },
          {
            text: [{ text: "E-mail: ", bold: true }, data.clienteEmail || "—"],
            style: "body",
            margin: [0, 0, 0, 4],
          },
          {
            text: [
              { text: "Telefone: ", bold: true },
              data.clienteTelefone || "—",
            ],
            style: "body",
            margin: [0, 0, 0, 4],
          },
          {
            text: [
              { text: "Endereço: ", bold: true },
              data.clienteEndereco || "—",
            ],
            style: "body",
            margin: [0, 0, 0, 20],
          },

          // Cláusula Primeira
          {
            text: "CLÁUSULA PRIMEIRA – DO OBJETO",
            style: "sectionHeader",
            margin: [0, 0, 0, 8],
          },
          {
            text: `1.1. O objeto do presente contrato é a locação, pela LOCADORA ao(à) LOCATÁRIO(A), do(s) seguinte(s) equipamento(s) de construção:`,
            style: "body",
            margin: [0, 0, 0, 8],
          },
          {
            table: {
              widths: ["*", "auto"],
              body: [
                [
                  {
                    text: "Equipamento",
                    bold: true,
                    fillColor: "#1e3a5f",
                    color: "#ffffff",
                    margin: [8, 6, 8, 6],
                  },
                  {
                    text: "Quantidade",
                    bold: true,
                    fillColor: "#1e3a5f",
                    color: "#ffffff",
                    margin: [8, 6, 8, 6],
                    alignment: "center",
                  },
                ],
                [
                  {
                    text: `${data.equipamentoNome || "—"}${data.numeroEquipamento ? `\nUnidade/Série: ${data.numeroEquipamento}` : ""}`,
                    margin: [8, 6, 8, 6],
                  },
                  {
                    text: String(data.quantidade || 1),
                    margin: [8, 6, 8, 6],
                    alignment: "center",
                  },
                ],
              ],
            },
            layout: {
              hLineColor: () => "#d1d5db",
              vLineColor: () => "#d1d5db",
            },
            margin: [0, 0, 0, 15],
          },

          // Cláusula Segunda
          {
            text: "CLÁUSULA SEGUNDA – DO PRAZO DE LOCAÇÃO",
            style: "sectionHeader",
            margin: [0, 0, 0, 8],
          },
          {
            text: `2.1. O prazo de locação do(s) equipamento(s) descrito(s) na Cláusula Primeira terá início na data ${formatDate(data.dataInicio)} e término na data ${formatDate(data.dataFim)}.`,
            style: "body",
            margin: [0, 0, 0, 6],
          },
          {
            text: "2.2. A devolução do equipamento após a data estipulada acarretará em cobrança de diárias adicionais proporcionais, além de possível multa por atraso.",
            style: "body",
            margin: [0, 0, 0, 15],
          },

          // Cláusula Terceira
          {
            text: "CLÁUSULA TERCEIRA – DO VALOR E CONDIÇÕES DE PAGAMENTO",
            style: "sectionHeader",
            margin: [0, 0, 0, 8],
          },
          {
            text: `3.1. Pela locação do(s) equipamento(s), o(a) LOCATÁRIO(A) pagará à LOCADORA o valor total de ${formatCurrency(data.valorTotal)}.`,
            style: "body",
            margin: [0, 0, 0, 6],
          },
          {
            text: "3.2. O pagamento será efetuado através de PIX, Boleto Bancário ou Cartão, na data de assinatura deste contrato ou na retirada do equipamento.",
            style: "body",
            margin: [0, 0, 0, 15],
          },

          // Cláusula Quarta
          {
            text: "CLÁUSULA QUARTA – DAS OBRIGAÇÕES E RESPONSABILIDADES",
            style: "sectionHeader",
            margin: [0, 0, 0, 8],
          },
          {
            text: "4.1. Da LOCADORA: Entregar o equipamento em perfeitas condições de uso, funcionamento e segurança, realizando testes prévios na presença do(a) LOCATÁRIO(A) ou de seu representante.",
            style: "body",
            margin: [0, 0, 0, 6],
          },
          {
            text: "4.2. Do(a) LOCATÁRIO(A):",
            style: "body",
            margin: [0, 0, 0, 4],
          },
          {
            ul: [
              "Utilizar o equipamento estritamente para os fins a que se destina, operando-o por pessoas capacitadas.",
              "Zelar pela guarda, conservação e manutenção preventiva do equipamento durante todo o período de locação.",
              "Restituir o equipamento nas mesmas condições em que o recebeu, ressalvado o desgaste natural pelo uso regular.",
              "Responsabilizar-se integralmente por roubo, furto, perda, incêndio ou danos causados ao equipamento durante o período em que este estiver sob sua posse, arcando com os custos de conserto ou reposição.",
            ],
            style: "body",
            margin: [15, 0, 0, 15],
          },

          // Cláusula Quinta
          {
            text: "CLÁUSULA QUINTA – DA RESCISÃO",
            style: "sectionHeader",
            margin: [0, 0, 0, 8],
          },
          {
            text: "5.1. O presente contrato poderá ser rescindido de imediato por qualquer das partes em caso de descumprimento de qualquer de suas cláusulas, sujeitando a parte infratora ao pagamento de perdas e danos.",
            style: "body",
            margin: [0, 0, 0, 15],
          },

          // Cláusula Sexta
          {
            text: "CLÁUSULA SEXTA – DO FORO",
            style: "sectionHeader",
            margin: [0, 0, 0, 8],
          },
          {
            text: "6.1. As partes elegem o foro da Comarca local, para dirimir quaisquer dúvidas ou controvérsias oriundas deste contrato, renunciando a qualquer outro, por mais privilegiado que seja.",
            style: "body",
            margin: [0, 0, 0, 25],
          },

          // Término
          {
            text: `E, por estarem justos e contratados, assinam o presente instrumento em 02 (duas) vias de igual teor e forma.`,
            style: "body",
            margin: [0, 0, 0, 8],
          },
          {
            text: getDataHoje(),
            style: "body",
            alignment: "right",
            margin: [0, 0, 0, 40],
          },

          // Assinaturas
          {
            columns: [
              {
                width: "*",
                stack: [
                  {
                    canvas: [
                      {
                        type: "line",
                        x1: 0,
                        y1: 0,
                        x2: 200,
                        y2: 0,
                        lineWidth: 1,
                      },
                    ],
                  },
                  {
                    text: "MANTOVANI",
                    style: "signatureName",
                    margin: [0, 6, 0, 0],
                  },
                  { text: "LOCADORA", style: "signatureRole" },
                ],
                alignment: "center",
              },
              {
                width: "*",
                stack: [
                  {
                    canvas: [
                      {
                        type: "line",
                        x1: 0,
                        y1: 0,
                        x2: 200,
                        y2: 0,
                        lineWidth: 1,
                      },
                    ],
                  },
                  {
                    text: data.clienteNome || "LOCATÁRIO(A)",
                    style: "signatureName",
                    margin: [0, 6, 0, 0],
                  },
                  { text: "LOCATÁRIO(A)", style: "signatureRole" },
                ],
                alignment: "center",
              },
            ],
          },
        ],

        styles: {
          companyName: {
            fontSize: 24,
            bold: true,
            color: "#1e3a5f",
          },
          companySubtitle: {
            fontSize: 11,
            color: "#6b7280",
            italics: true,
          },
          title: {
            fontSize: 16,
            bold: true,
            color: "#1f2937",
          },
          sectionHeader: {
            fontSize: 12,
            bold: true,
            color: "#1e3a5f",
            decoration: "underline",
          },
          body: {
            fontSize: 10,
            lineHeight: 1.5,
            color: "#374151",
          },
          signatureName: {
            fontSize: 10,
            bold: true,
            alignment: "center",
          },
          signatureRole: {
            fontSize: 9,
            color: "#6b7280",
            alignment: "center",
          },
        },

        defaultStyle: {
          font: "Roboto",
        },
      };

      const pdfDoc = pdfMake.createPdf(docDefinition);

      pdfDoc.getBlob((blob) => {
        if (!blob) {
          reject(new Error("Falha ao gerar o Blob do PDF"));
          return;
        }
        resolve(blob);
      });
    } catch (error) {
      reject(error);
    }
  }),
  new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout pdfMake")), 5000))
  ]);
}
