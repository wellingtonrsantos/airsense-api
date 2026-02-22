const autocannon = require('autocannon');

const url = process.env.TARGET_URL || 'http://localhost:3000/air-quality?lat=-23.55&lon=-46.63';
const connections = 100;
const duration = 10;

console.log(`\n🚀 Iniciando Teste de Carga no API Gateway: ${url}`);
console.log(`🔥 Conexões Simultâneas: ${connections}`);
console.log(`⏱️  Duração: ${duration} segundos\n`);

const instance = autocannon({
  url: url,
  connections: connections,
  duration: duration,
}, (err, result) => {
  if (err) {
    console.error('❌ Erro ao executar teste:', err);
    process.exit(1);
  }

  console.log('\n📊 === RELATÓRIO DO AUTOCANNON ===\n');
  console.log(`📡 URL Testada:        ${result.url}`);
  console.log(`⏱️  Duração do Teste:  ${result.duration}s`);
  console.log(`🚀 Total de Envio:     ${result.requests.total} requisições\n`);

  console.log('--- LATÊNCIA (ms) ---');
  console.log(`• Média:               ${result.latency.average} ms`);
  console.log(`• Mínima:              ${result.latency.min} ms`);
  console.log(`• Máxima:              ${result.latency.max} ms`);
  console.log(`• p99:                 ${result.latency.p99} ms (99% das requisições foram mais rápidas que isso)\n`);

  console.log('--- THROUGHPUT (Req/Seg) ---');
  console.log(`• Média:               ${result.requests.average} req/s`);
  console.log(`• Mínimo:              ${result.requests.min} req/s`);
  console.log(`• Máximo:              ${result.requests.max} req/s\n`);

  console.log('--- ERROS E TIMEOUTS ---');
  console.log(`• Status não-2xx:      ${result.non2xx} erros HTTP`);
  console.log(`• Erros Totais:        ${result.errors}`);
  console.log(`• Timeouts:            ${result.timeouts}`);
  console.log('\n===================================\n');
});

process.once('SIGINT', () => {
  instance.stop();
});
