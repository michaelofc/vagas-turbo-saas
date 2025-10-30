# Exemplo de Configuração para Produção

## Variáveis de Ambiente (opcional)
```bash
# .env (não commitado)
NODE_ENV=production
WIDGET_SECRET_KEY=sua-chave-secreta-aqui
DATABASE_URL=mongodb://sua-url-do-banco
```

## IDs de Widget Sugeridos
```javascript
// Use IDs únicos para cada cliente:
"CLIENTE-LOJA-ABC-2024"
"PRODUTO-CURSO-XYZ-001"
"LANCAMENTO-PREMIUM-456"
```

## URLs de Teste
```
Painel: https://seu-site.netlify.app/
API Config: https://seu-site.netlify.app/api/config
API Status: https://seu-site.netlify.app/api/status/ID-DO-CLIENTE
Widget: https://seu-site.netlify.app/widget.js
```

## Código de Instalação
```html
<!-- Cole antes do </body> -->
<script src="https://seu-site.netlify.app/widget.js" data-widget-id="SEU-ID-UNICO"></script>
```