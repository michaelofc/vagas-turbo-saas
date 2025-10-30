// Vagas Turbo Widget - Client-Side Logic

// --- CONFIGURAÇÃO ---
// URL dinâmica baseada no domínio onde o script está hospedado
const scriptElement = document.currentScript;
const WIDGET_API_BASE_URL = scriptElement ? new URL(scriptElement.src).origin : window.location.origin;
const API_ENDPOINT = '/api/status/';
const SIMULATION_INCREMENT = 1; // Quantidade a diminuir por simulação
const SIMULATION_INTERVAL_MS = 30000; // 30 segundos (simulação de venda a cada 30s)

// Elementos Globais
let widgetContainer = null;
let vagasRestantesSpan = null;
let currentWidgetId = null;

// Helper para criar elementos HTML
function createEl(tag, className, textContent = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = textContent;
    return el;
}

// ----------------------------------------------------
// 1. FUNÇÕES DE DADOS (API)
// ----------------------------------------------------

async function buscarStatusAPI(widgetId) {
    if (!widgetId) {
        console.error('Vagas Turbo: ID do widget não encontrado.');
        return { vagasRestantes: 0 };
    }

    // Usando a URL base fixa para o deploy no Netlify
    const apiUrl = `${WIDGET_API_BASE_URL}${API_ENDPOINT}${widgetId}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            // Se a API retornar um erro (404/500), loga o problema, mas não quebra a aplicação
            console.error(`[VAGAS TURBO] Erro API: Resposta HTTP ${response.status} ao buscar ID: ${widgetId}`);
            // Retorna 0 para evitar o crash e desativar o widget
            return { vagasRestantes: 0 }; 
        }

        const data = await response.json();
        return data;
        
    } catch (error) {
        // Loga o erro de fetch (ex: problema de rede)
        console.error(`[VAGAS TURBO] Erro Fatal no Fetch:`, error);
        
        // Retorna um valor seguro (0) para que o widget não seja exibido
        return { vagasRestantes: 0 }; 
    }
}

// ----------------------------------------------------
// 2. FUNÇÕES DE RENDERIZAÇÃO E ATUALIZAÇÃO
// ----------------------------------------------------

function renderizarWidget(vagasRestantes) {
    // Se o container não existe, cria o HTML do widget
    if (!widgetContainer) {
        widgetContainer = createEl('div', 'vagas-turbo-widget');
        
        // CSS INLINE para garantir o posicionamento e aparência
        widgetContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #FF4500, #FF6347); /* Degradê Laranja/Vermelho */
            color: white;
            padding: 12px 18px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            font-family: 'Arial', sans-serif;
            font-size: 16px;
            font-weight: bold;
            z-index: 9999;
            cursor: pointer;
            text-align: center;
            transition: transform 0.3s ease;
            max-width: 250px;
            line-height: 1.4;
        `;

        // Efeitos visuais básicos (hover)
        widgetContainer.onmouseover = () => widgetContainer.style.transform = 'scale(1.05)';
        widgetContainer.onmouseout = () => widgetContainer.style.transform = 'scale(1.0)';
        
        const text = createEl('p', null);
        text.innerHTML = `🔥 ÚLTIMAS <span id="vagas-count" style="color: #FFFF00; font-size: 1.2em;">${vagasRestantes}</span> VAGAS!`;
        
        vagasRestantesSpan = text.querySelector('#vagas-count');
        widgetContainer.appendChild(text);

        // Adiciona ao corpo do documento
        document.body.appendChild(widgetContainer);
    } else {
        // Se já existe, apenas atualiza o texto
        atualizarContador(vagasRestantes);
    }
}

function atualizarContador(vagasRestantes) {
    // Garante que o contador nunca seja negativo
    const vagasDisplay = vagasRestantes < 0 ? 0 : vagasRestantes;
    
    if (vagasRestantesSpan) {
        vagasRestantesSpan.textContent = vagasDisplay;
        
        // Efeito de pulso para chamar atenção
        widgetContainer.style.transform = 'scale(1.1)';
        setTimeout(() => {
            widgetContainer.style.transform = 'scale(1.0)';
        }, 150);

        // Se zerar, esconder o widget
        if (vagasDisplay <= 0) {
            widgetContainer.style.display = 'none';
        } else {
            widgetContainer.style.display = 'block';
        }
    }
}

// ----------------------------------------------------
// 3. LÓGICA DE SIMULAÇÃO (CLIENT-SIDE)
// ----------------------------------------------------

let vagasSimuladas = 0;
let vendasSimuladas = 0;

async function iniciarSimulacao() {
    
    // 1. Buscar status real na API
    const data = await buscarStatusAPI(currentWidgetId);
    vagasSimuladas = data.vagasRestantes;

    if (vagasSimuladas <= 0) {
        renderizarWidget(0);
        console.log('Vagas Turbo: Vagas esgotadas ou erro na API. Widget desativado.');
        return; 
    }
    
    // 2. Renderizar a primeira vez
    renderizarWidget(vagasSimuladas);

    // 3. Iniciar o Loop de Simulação
    setInterval(() => {
        
        // Simula uma venda apenas se ainda houver vagas
        if (vagasSimuladas > 0) {
            vagasSimuladas -= SIMULATION_INCREMENT;
            vendasSimuladas += SIMULATION_INCREMENT;
            atualizarContador(vagasSimuladas);
            console.log(`Vagas Turbo: Simulação de venda. Restantes: ${vagasSimuladas}`);
        } else {
            vagasSimuladas = 0;
            atualizarContador(0);
        }
        
    }, SIMULATION_INTERVAL_MS);
}


// ----------------------------------------------------
// 4. INICIALIZAÇÃO
// ----------------------------------------------------

function initVagasTurbo() {
    // Acessa o atributo data-widget-id no elemento script
    const currentScript = document.querySelector('script[src*="widget.js"]');
    
    if (!currentScript) {
        console.error('Vagas Turbo: Não foi possível encontrar o elemento script.');
        return;
    }
    
    currentWidgetId = currentScript.getAttribute('data-widget-id');
    
    if (currentWidgetId) {
        iniciarSimulacao();
    } else {
        console.error('Vagas Turbo: Atributo data-widget-id não encontrado. Verifique a instalação.');
    }
}

// Garante que o script é executado assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initVagasTurbo);
