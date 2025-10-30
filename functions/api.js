// functions/api.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();

// Configuração CORS mais robusta
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ** SIMULAÇÃO DE BANCO DE DADOS (MVP) **
// Em um SaaS real, use um DB externo.
let widget_db = {
    // ID inicial para testes. Use um ID único para cada cliente real.
    "ID-DO-SEU-PRIMEIRO-CLIENTE": {
        vagasTotais: 100,
        vendasReais: 50,
        ativo: true // Campo de controle de acesso/reembolso
    }
};

// ==========================================================
// ROTA DE CONFIGURAÇÃO (PAINEL)
// ==========================================================
app.post('/api/config', (req, res) => {
    const { vagasTotais, vendasReais, widgetID } = req.body;

    if (!widgetID) {
        return res.status(400).send({ message: "widgetID é obrigatório." });
    }
    
    // Converte para números e salva
    widget_db[widgetID] = {
        vagasTotais: parseInt(vagasTotais),
        vendasReais: parseInt(vendasReais),
        ativo: true
    };

    console.log(`Configuração salva para ID: ${widgetID}`);
    return res.status(200).send({ message: "Configuração salva com sucesso!", data: widget_db[widgetID] });
});


// ==========================================================
// ROTA DE STATUS (WIDGET DO CLIENTE)
// ==========================================================
app.get('/api/status/:widgetID', (req, res) => {
    const { widgetID } = req.params;
    const cliente = widget_db[widgetID];

    // BLOQUEIO: Se o cliente não existe ou foi reembolsado/desativado
    if (!cliente || cliente.ativo === false) {
        // O código 403 (Forbidden) fará o widget se remover da página.
        return res.status(403).send({ error: "Serviço indisponível ou acesso revogado." });
    }

    const vagasRestantes = cliente.vagasTotais - cliente.vendasReais;
    
    // Retorna os dados que o Widget precisa
    return res.status(200).send({ 
        vagasRestantes: Math.max(0, vagasRestantes),
        vagasTotais: cliente.vagasTotais,
        lastUpdated: new Date().toISOString() 
    });
});

// ==========================================================
// HANDLER PARA PREFLIGHT CORS (OPTIONS)
// ==========================================================
app.options('*', (req, res) => {
    res.status(200).end();
});

// ==========================================================
// EXPORTAÇÃO PARA NETLIFY FUNCTIONS
// ==========================================================
const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Configuração para garantir que o corpo do POST funcione
  const result = await handler(event, context);
  return result;
};