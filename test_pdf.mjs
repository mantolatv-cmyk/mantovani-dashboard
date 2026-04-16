import { generateContractPDF } from './src/lib/pdfGenerator.js';

async function test() {
  try {
    const blob = await generateContractPDF({
      clienteNome: 'Teste',
      clienteCpf: '111',
      clienteEndereco: 'Rua',
      equipamentoNome: 'Betoneira',
      numeroEquipamento: '1',
      quantidade: 1,
      dataInicio: '2023-01-01',
      dataFim: '2023-01-02',
      valorTotal: 100
    });
    console.log('BLOB SUCCESS:', blob);
  } catch (e) {
    console.error('ERROR:', e);
  }
}
test();
