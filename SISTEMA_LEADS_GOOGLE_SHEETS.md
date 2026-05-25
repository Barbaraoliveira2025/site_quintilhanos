# 📊 SISTEMA DE LEADS - GOOGLE SHEETS + AUTOMAÇÃO

## 🎯 ARQUITETURA DO SISTEMA

```
VISITANTE PREENCHE FORMULÁRIO
        ↓
   CALCULA SCORE
        ↓
SALVA EM GOOGLE SHEETS
        ↓
VERIFICA SE É QUENTE
        ↓
ENVIA WHATSAPP + EMAIL
        ↓
PAINEL ADMIN ATUALIZA
```

---

## 📋 PASSO 1: CRIAR GOOGLE SHEET

### **1.1 Acesse Google Sheets**
- URL: https://sheets.google.com
- Crie nova planilha chamada: **"Quintilhanos - Leads"**

### **1.2 Estrutura de Abas (Sheets)**

Você terá **4 abas**:

#### **ABA 1: "LEADS" (Dados brutos)**
```
| ID | Nome | Telefone | Email | Serviço | Mensagem | Data | Página | Score |
|----|------|----------|-------|---------|----------|------|--------|-------|
| 1  | João | 4799277.. | - | Drywall | Quero orçamento | 2025-05-25 | home | 8 |
```

#### **ABA 2: "SCORING"** (Regras de pontuação)
```
| Evento | Pontos | Descrição |
|--------|--------|-----------|
| Preencheu formulário | +5 | Lead básico |
| Selecionou serviço | +3 | Definiu interesse |
| Deixou mensagem | +4 | Engajado |
| Clicou WhatsApp | +10 | MUITO QUENTE |
| Voltou 2x no site | +2 | Recorrência |
| Respondeu email | +8 | Confirmou interesse |
```

#### **ABA 3: "DASHBOARD"** (Estatísticas em tempo real)
```
📊 ÚLTIMOS 30 DIAS:
- Total de Leads: 12
- Leads Quentes (≥8): 5
- Leads Mornos (5-7): 4
- Leads Frios (<5): 3

📈 POR SERVIÇO:
- Drywall: 7 leads
- Forros: 3 leads
- Reformas: 2 leads

⏰ RESPOSTA MÉDIA: 0.5 horas
```

#### **ABA 4: "TEMPLATES"** (Mensagens automáticas)
```
| Tipo | Mensagem |
|------|----------|
| Boas-vindas | "Olá [NOME]! Recebemos seu contato..." |
| Quente | "Lead QUENTE detectado em [SERVIÇO]!" |
| Agradecimento | "Obrigado por contatar Quintilhanos!" |
| Follow-up 24h | "Oi [NOME], como vai? Temos solução..." |
```

---

## 🤖 PASSO 2: INTEGRAÇÃO COM GOOGLE APPS SCRIPT

### **2.1 Criar Script no Google Sheets**

1. Abra a planilha "Quintilhanos - Leads"
2. Clique em **Extensões → Apps Script**
3. Cole o código abaixo:

```javascript
// ═══════════════════════════════════════════════════════════
// SISTEMA DE LEADS QUINTILHANOS - GOOGLE APPS SCRIPT
// ═══════════════════════════════════════════════════════════

// ✅ CONFIGURAÇÕES INICIAIS
const SHEET_ID = "[COLOQUE SEU ID DO GOOGLE SHEETS]";
const SHEET_NAME = "LEADS";
const WEBHOOK_URL = "https://hook.make.com/[COLOQUE SEU TOKEN]";
const WHATSAPP_PHONE = "5547992772453";

function doPost(e) {
  try {
    const params = e.parameter;
    const nome = params.nome;
    const telefone = params.telefone;
    const email = params.email || "";
    const servico = params.servico;
    const mensagem = params.mensagem || "";
    const evento = params.evento || "formulario";

    const score = calcularScore(evento, servico);
    const statusLead = classificarLead(score);

    salvarLead(nome, telefone, email, servico, mensagem, score, statusLead);

    if (statusLead === "🔴 QUENTE") {
      enviarWhatsApp(nome, telefone, servico, score);
      enviarEmailAlert(nome, servico, score);
    }

    registrarEvento(telefone, evento, score);

    return ContentService.createTextOutput(JSON.stringify({
      sucesso: true,
      score: score,
      status: statusLead
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (erro) {
    console.error("Erro:", erro);
    return ContentService.createTextOutput(JSON.stringify({
      sucesso: false,
      erro: erro.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function calcularScore(evento, servico) {
  let pontos = 0;

  switch(evento) {
    case "formulario":
      pontos = 5;
      break;
    case "whatsapp_click":
      pontos = 10;
      break;
    case "ligacao":
      pontos = 12;
      break;
    case "email_resposta":
      pontos = 8;
      break;
    case "segundo_acesso":
      pontos = 3;
      break;
    case "tempo_site":
      pontos = 2;
      break;
    default:
      pontos = 5;
  }

  const bonusServico = {
    "Drywall": 2,
    "Reforma Completa": 3,
    "Isolamento Acústico": 2,
    "Forros": 1,
    "Divisórias": 1
  };

  pontos += bonusServico[servico] || 0;

  return pontos;
}

function classificarLead(score) {
  if (score >= 10) return "🔴 QUENTE";
  if (score >= 6) return "🟡 MORNO";
  return "🔵 FRIO";
}

function salvarLead(nome, telefone, email, servico, mensagem, score, status) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  
  const dados = [
    [
      sheet.getLastRow() + 1,
      new Date(),
      nome,
      telefone,
      email,
      servico,
      mensagem,
      score,
      status,
      "Novo",
      ""
    ]
  ];

  sheet.appendRow(dados[0]);
  formatarLinhaStatus(sheet, sheet.getLastRow(), status);
  
  console.log(`✅ Lead salvo: ${nome} - ${status}`);
}

function formatarLinhaStatus(sheet, linha, status) {
  const range = sheet.getRange(linha, 1, 1, 11);
  
  if (status === "🔴 QUENTE") {
    range.setBackground("#ffcccc");
  } else if (status === "🟡 MORNO") {
    range.setBackground("#ffffcc");
  } else {
    range.setBackground("#ccccff");
  }
}

function enviarWhatsApp(nome, telefone, servico, score) {
  const mensagem = `
🎯 *NOVO LEAD QUENTE!* 🎯
Nome: ${nome}
Telefone: ${telefone}
Serviço: ${servico}
Score: ${score} pontos

⚡ *AÇÃO IMEDIATA NECESSÁRIA!*
Entre em contato via WhatsApp em até 30 min.
  `.trim();

  try {
    const options = {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      payload: JSON.stringify({
        telefone: WHATSAPP_PHONE,
        mensagem: mensagem
      })
    };

    UrlFetchApp.fetch(WEBHOOK_URL, options);
    console.log(`✅ WhatsApp enviado para: ${WHATSAPP_PHONE}`);
  } catch (erro) {
    console.error("❌ Erro ao enviar WhatsApp:", erro);
  }
}

function enviarEmailAlert(nome, servico, score) {
  const email = "[SEU_EMAIL@GMAIL.COM]";
  const assunto = `🔴 LEAD QUENTE: ${nome} - ${servico}`;
  const corpo = `Lead quente recebido! Score: ${score}`;

  GmailApp.sendEmail(email, assunto, corpo);
  console.log(`✅ Email enviado para: ${email}`);
}

function registrarEvento(telefone, evento, score) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("EVENTOS") || 
    SpreadsheetApp.openById(SHEET_ID).insertSheet("EVENTOS");

  sheet.appendRow([
    new Date(),
    telefone,
    evento,
    score
  ]);

  console.log(`📊 Evento registrado: ${evento} (+${score} pts)`);
}

function testarSistema() {
  const dados = {
    nome: "João Silva",
    telefone: "47992772453",
    email: "joao@email.com",
    servico: "Drywall",
    mensagem: "Quero orçamento",
    evento: "formulario"
  };

  const e = {
    parameter: dados
  };

  const resultado = doPost(e);
  console.log("Teste:", resultado.getContent());
}

function atualizarDashboard() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("LEADS");
  const dados = sheet.getDataRange().getValues();

  let quentes = 0, mornos = 0, frios = 0;
  let totalServiços = {};

  for (let i = 1; i < dados.length; i++) {
    const status = dados[i][8];
    const servico = dados[i][5];

    if (status.includes("QUENTE")) quentes++;
    else if (status.includes("MORNO")) mornos++;
    else frios++;

    totalServiços[servico] = (totalServiços[servico] || 0) + 1;
  }

  console.log(`📊 DASHBOARD ATUALIZADO:`);
  console.log(`Quentes: ${quentes} | Mornos: ${mornos} | Frios: ${frios}`);
  console.log(`Serviços:`, totalServiços);
}
```

---

## 🔌 PASSO 3: CONECTAR COM FORMULÁRIO DO SITE

Cole este código no seu HTML:

```html
<!-- FORMULÁRIO DE LEADS -->
<form id="leadForm">
  <input type="text" name="nome" placeholder="Seu nome" required>
  <input type="tel" name="telefone" placeholder="WhatsApp" required>
  <input type="email" name="email" placeholder="Email (opcional)">
  <select name="servico" required>
    <option value="">Selecione um serviço</option>
    <option value="Drywall">Drywall</option>
    <option value="Forros">Forros</option>
    <option value="Divisórias">Divisórias</option>
    <option value="Isolamento Acústico">Isolamento Acústico</option>
    <option value="Reforma Completa">Reforma Completa</option>
  </select>
  <textarea name="mensagem" placeholder="Conte mais"></textarea>
  <button type="submit">Enviar</button>
</form>

<script>
document.getElementById('leadForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  formData.append('evento', 'formulario');
  
  fetch('SEU_SCRIPT_URL', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(dados => {
      alert(`✅ Recebido! Score: ${dados.score}`);
      this.reset();
    });
});
</script>
```

---

## ✅ RESULTADO FINAL

Você terá um sistema **100% automático e dinâmico** que:

✅ Recebe leads em tempo real
✅ Calcula score automaticamente
✅ Alerta via WhatsApp + Email (leads quentes)
✅ Organiza por cores (vermelho/amarelo/azul)
✅ Funciona no celular (Google Sheets app)
✅ Grátis (sem custos)
✅ Seguro (dados em Google Drive)

**Pronto para ativar?** 🚀
