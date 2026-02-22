#!/bin/bash

# Nome do container
CONTAINER_NAME=${1:-"airsense-api"}
TARGET_URL=${2:-"http://localhost:3000/air-quality?lat=-23.55&lon=-46.63"}
STATS_FILE="docker_stats.log"

echo ""
echo "=============================================="
echo "    🧪 INICIANDO TESTE DE PERFORMANCE         "
echo "=============================================="

# Limpa o log antigo se existir
> $STATS_FILE

echo "📊 Coletando métricas do Docker ($CONTAINER_NAME) em background..."
# Usamos um loop com --no-stream para evitar os traços (-- / --) e capturar frames exatos
while true; do
    docker stats --no-stream --format "{{.Name}}: CPU {{.CPUPerc}} | RAM {{.MemUsage}}" $CONTAINER_NAME >> $STATS_FILE
    sleep 1
done &
DOCKER_PID=$!

# Dá tempo pro docker stats inicializar o primeiro frame
sleep 2

# Chamar o teste do autocannon
export TARGET_URL=$TARGET_URL
node scripts/load-test.js

# Desligar a coleta silenciosamente
echo "🛑 Finalizando coleta de métricas..."
# O comando disown desvincula o processo do terminal para esconder a mensagem "Morto"
disown $DOCKER_PID
kill -9 $DOCKER_PID 2>/dev/null

echo ""
echo "📊 === RESUMO DOCKER STATS (AMOSTRAGEM) ==="
echo ""
if [ -s $STATS_FILE ]; then
    head -n 5 $STATS_FILE
    echo "..."
    tail -n 5 $STATS_FILE
else
    echo "Nenhuma métrica capturada."
fi

echo ""
echo "✅ Teste Concluído! O arquivo '$STATS_FILE' foi salvo na raiz do projeto com o log completo."
echo ""
