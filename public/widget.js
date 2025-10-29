// public/widget.js
(function() {
    // URL base da sua API no Netlify. O /api/ é mapeado pelo netlify.toml
    const API_BASE_URL = window.location.origin + '/api/status/'; 
    const INTERVALO_ATUALIZACAO_API = 10000; // 10 segundos
    const INTERVALO_SIMULACAO_VENDA = 30000; // 30 segundos

    // 1. Encontra o ID do Widget na tag script
    const scriptTag = document.currentScript;
    if (!scriptTag) return;
    
    const widgetID = scriptTag.getAttribute('data-widget-id');
    if (!widgetID) {
        console.error("Vagas Turbo: data-widget-id não encontrado.");
        return;
    }

    let vagasRestantes = 0;
    let vagasTotais = 0;
    let elementoWidget = null;
    let contadorSimulado = 0;


    // ----------------------------------------------------
    // FUNÇÕES DE EXIBIÇÃO
    // ----------------------------------------------------

    function criarEstilo() {
        // CSS de urgência, injetado dinamicamente para não depender do cliente
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes pulse-shake {
                0% { transform: scale(1); }
                50% { transform: scale(1.05) rotate(1deg); }
                100% { transform: scale(1) rotate(-1deg); }
            }
            #vagas-turbo-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: #e74c3c; /* Vermelho de Urgência */
                color: white;
                padding: 12px 18px;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
                z-index: 99999;
                font-family: Arial, sans-serif;
                font-size: 18px;
                font-weight: bold;
                text-align: center;
                animation: pulse-shake 0.5s infinite alternate;
                cursor: pointer;
            }
            #vagas-turbo-widget span {
                color: #ffeb3b; /* Amarelo Forte */
            }
            @media (max-width: 600px) {
                #vagas-turbo-widget {
                    bottom: 10px;
                    right: 10px;
                    font-size: 14px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function criarElementoWidget() {
        elementoWidget = document.createElement('div');
        elementoWidget.id = 'vagas-turbo-widget';
        document.body.appendChild(elementoWidget);
        // Opcional: Adicionar um link de CTA aqui
        // elementoWidget.onclick = () => window.location.href = 'URL_DE_COMPRA_DO_CLIENTE';
    }

    function atualizarDisplay() {
        if (elementoWidget && vagasRestantes > 0) {
            elementoWidget.innerHTML = `🔥 ÚLTIMAS <span>${contadorSimulado}</span> VAGAS! Corra antes que acabe!`;
            elementoWidget.style.display = 'block';
        } else if (elementoWidget) {
            elementoWidget.style.display = 'none'; // Esconde quando as vagas acabam
        }
    }
    
    // ----------------------------------------------------
    // LÓGICA DE SIMULAÇÃO (URGÊNCIA)
    // ----------------------------------------------------

    function simularVenda() {
        // A simulação só acontece se o contador simulado ainda tiver vagas e
        // se ainda não atingiu o valor real retornado pela API.
        if (contadorSimulado > 1 && contadorSimulado > vagasRestantes) {
            const vendasSimuladas = Math.floor(Math.random() * 2) + 1; // Subtrai 1 ou 2
            contadorSimulado = Math.max(1, contadorSimulado - vendasSimuladas);
            atualizarDisplay();
        }
        // Se a simulação esgotou, a próxima atualização da API irá reajustar.
    }
    
    // ----------------------------------------------------
    // INTEGRAÇÃO COM A API (VALOR REAL)
    // ----------------------------------------------------

    async function buscarStatusAPI() {
        try {
            const response = await fetch(API_BASE_URL + widgetID);
            
            // Se o servidor retornar 403 (Bloqueio/Reembolso)
            if (response.status === 403) {
                console.error("Vagas Turbo: Acesso revogado. Removendo Widget.");
                elementoWidget.remove();
                clearInterval(intervaloAPI);
                clearInterval(intervaloSimulacao);
                return;
            }

            if (!response.ok) throw new Error('Falha ao buscar status da API.');

            const data = await response.json();
            
            vagasRestantes = data.vagasRestantes;
            vagasTotais = data.vagasTotais;

            // Se o contador simulado for 0 ou menor que o valor real (indicando nova venda),
            // ele é reiniciado para o valor real da API.
            if (contadorSimulado <= vagasRestantes) {
                contadorSimulado = vagasRestantes;
            }
            
            atualizarDisplay();

        } catch (error) {
            console.error("Vagas Turbo Error:", error);
            // Em caso de erro, o widget permanece com o último valor
        }
    }

    // ----------------------------------------------------
    // INICIALIZAÇÃO
    // ----------------------------------------------------

    criarEstilo();
    criarElementoWidget();

    // 1. Primeira busca imediata
    buscarStatusAPI(); 
    
    // 2. Agendamento para atualização do valor real da API
    const intervaloAPI = setInterval(buscarStatusAPI, INTERVALO_ATUALIZACAO_API);

    // 3. Agendamento para simular vendas e criar urgência visual
    const intervaloSimulacao = setInterval(simularVenda, INTERVALO_SIMULACAO_VENDA);

})();