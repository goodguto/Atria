const API = '/api';
const state = {
    dashboard: null,
    titulares: [],
    solicitacoes: [],
    conexoes: [],
    evidencias: [],
    titularAtual: null,
    dataAtual: new Date(),
    diaSelecionado: new Date().getDate()
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

async function api(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options
    });
    if (!response.ok) {
        let message = `Erro ${response.status}`;
        try { message = (await response.json()).erro || message; } catch (_) {}
        throw new Error(message);
    }
    const contentType = response.headers.get('content-type') || '';
    return contentType.includes('application/json') ? response.json() : response;
}

function toast(message, type = '') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    $('#toast-container').appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

function diasAte(dataIso) {
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    const prazo = new Date(`${dataIso}T00:00:00`);
    return Math.ceil((prazo - hoje) / 86400000);
}

function formatarData(data) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(data));
}

function moeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(valor || 0);
}

function navegar(route) {
    location.hash = route;
}

function aplicarRota() {
    const route = (location.hash || '#home').replace('#','').split('/')[0];
    const valid = ['home','cat','riscos','hub','esg'].includes(route) ? route : 'home';
    $$('.view-section').forEach(section => section.classList.toggle('hidden', section.id !== valid));
    $$('.nav-menu .nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.route === valid));
    if (valid === 'cat' && !location.hash.includes('/')) fecharDetalhe();
    if (valid === 'esg') carregarEvidencias();
}

function alertCard(solicitacao) {
    const dias = diasAte(solicitacao.prazo);
    return `<div class="alert-card orange">
        <div class="alert-icon-circle">!</div><div class="alert-avatar"></div>
        <div class="alert-details"><strong>${solicitacao.titularNome}</strong><span>E-mail: ${solicitacao.email}</span></div>
        <div class="alert-divider"></div>
        <div class="alert-meta"><span class="meta-label">${solicitacao.tipo}</span><span class="meta-timer">Prazo: ${dias >= 0 ? `${dias} dia(s)` : 'vencido'}</span></div>
        <button class="btn-outline-white" data-client-id="${solicitacao.titularId}">Visualizar</button>
    </div>`;
}

function clientRow(t) {
    return `<div class="client-white-row">
        <div class="client-info-group"><div class="client-circle-placeholder"></div><div class="client-text-block"><strong>${t.nome}</strong><span>CPF: ${t.cpf}</span><span>E-mail: ${t.email}</span></div></div>
        <button class="btn-row-visualizar" data-client-id="${t.id}">Visualizar</button>
    </div>`;
}

function empty(text) { return `<div class="empty-state">${text}</div>`; }

async function carregarDashboard() {
    try {
        state.dashboard = await api('/dashboard');
        state.solicitacoes = state.dashboard.alertas;
        $('#dashboard-stats').innerHTML = `
            <div class="stat-card"><span>Titulares cadastrados</span><strong>${state.dashboard.totalTitulares}</strong></div>
            <div class="stat-card"><span>Plataformas conectadas</span><strong>${state.dashboard.plataformasConectadas}</strong></div>
            <div class="stat-card"><span>Solicitações pendentes</span><strong>${state.dashboard.alertas.length}</strong></div>`;
        renderAlertas();
        $('#anpd-status').textContent = state.dashboard.statusAnpd;
        $('#marketplace-status').textContent = state.dashboard.statusMarketplace;
    } catch (e) { toast(`Falha ao carregar dashboard: ${e.message}`, 'error'); }
}

function renderAlertas(filtro = '') {
    const termo = filtro.trim().toLowerCase();
    const lista = state.solicitacoes.filter(s => !termo || `${s.titularNome} ${s.email} ${s.tipo}`.toLowerCase().includes(termo));
    const html = lista.length ? lista.map(alertCard).join('') : empty('Nenhum risco pendente encontrado.');
    $('#home-alerts').innerHTML = html;
    $('#risk-alerts').innerHTML = html;
}

async function carregarTitulares(query = '') {
    try {
        state.titulares = await api(`/titulares?query=${encodeURIComponent(query)}`);
        $('#cat-client-list').innerHTML = state.titulares.length ? state.titulares.map(clientRow).join('') : empty('Nenhum titular encontrado.');
        return state.titulares;
    } catch (e) { toast(`Falha ao buscar titulares: ${e.message}`, 'error'); return []; }
}

async function abrirDetalhe(id) {
    try {
        const titular = await api(`/titulares/${id}`);
        state.titularAtual = titular;
        $('#client-profile-info').innerHTML = `
            <div><strong>${titular.nome}</strong></div><div><span>CPF: ${titular.cpf}</span></div>
            <div><span>Telefone: ${titular.telefone}</span></div><div><span>CEP: ${titular.cep}</span></div>
            <div><span>E-mail: ${titular.email}</span></div><div><strong>Gastos Totais: ${moeda(titular.gastosTotais)}</strong></div>`;
        $('#client-platforms').innerHTML = titular.plataformas.map(p => `<div class="platform-row"><span>${p}</span><span class="action-arrow">➔</span></div>`).join('');
        $('#client-interactions').innerHTML = titular.interacoes.length ? titular.interacoes.map(i => `<div class="interaction-card mb-1"><strong>${i.categoria}</strong><span>Data: ${formatarData(i.data)}</span></div>`).join('') : empty('Sem interações registradas.');
        $('#btn-purga').classList.remove('hidden');
        $('#btn-purga').disabled = false;
        $('#receipt-area').classList.add('hidden');
        $('#cat-main-view').classList.add('hidden');
        $('#cat-detail-view').classList.remove('hidden');
        location.hash = `cat/${id}`;
    } catch (e) { toast(e.message, 'error'); }
}

function fecharDetalhe() {
    $('#cat-detail-view').classList.add('hidden');
    $('#cat-main-view').classList.remove('hidden');
    state.titularAtual = null;
}

async function purgarAtual() {
    if (!state.titularAtual) return;
    const btn = $('#btn-purga');
    btn.disabled = true;
    btn.textContent = '⏳ Processando purga...';
    const rows = $$('#client-platforms .platform-row');
    rows.forEach((row, i) => setTimeout(() => { row.querySelector('.action-arrow').textContent = '⏳ Removendo...'; }, i * 250));
    try {
        const resultado = await api(`/titulares/${state.titularAtual.id}/purga`, { method:'POST' });
        rows.forEach(row => row.querySelector('.action-arrow').textContent = '✅ Deletado');
        btn.classList.add('hidden');
        $('#receipt-message').textContent = `Operação concluída. Protocolo: ${resultado.protocolo}`;
        $('#receipt-area').classList.remove('hidden');
        toast('Purga registrada com sucesso.', 'success');
        await carregarDashboard();
        await carregarEvidencias();
    } catch (e) {
        btn.disabled = false;
        btn.textContent = 'Deletar todos os dados';
        toast(`Falha na purga: ${e.message}`, 'error');
    }
}

async function carregarConexoes() {
    try {
        state.conexoes = await api('/conexoes');
        $('#connections-list').innerHTML = state.conexoes.map(c => `<div class="platform-row connection-card ${c.conectada ? 'connected-style' : ''}" data-connection="${c.slug}"><span>${c.icone} ${c.nome}</span><span class="action-arrow btn-connect ${c.conectada ? 'connected' : ''}">${c.conectada ? '✓ Conectado' : '➔ Conectar'}</span></div>`).join('');
    } catch (e) { toast(e.message, 'error'); }
}

async function conectar(slug, card) {
    const status = card.querySelector('.btn-connect');
    if (status.classList.contains('connected')) return;
    status.textContent = '⏳ Autenticando API...';
    try {
        await new Promise(r => setTimeout(r, 500));
        await api(`/conexoes/${slug}/conectar`, { method:'POST' });
        await carregarConexoes();
        await carregarDashboard();
        toast('Plataforma conectada.', 'success');
    } catch (e) { status.textContent = '➔ Conectar'; toast(e.message, 'error'); }
}

async function carregarEvidencias() {
    try {
        state.evidencias = await api('/evidencias');
        $('#esg-history').innerHTML = state.evidencias.length ? state.evidencias.map(e => `<tr><td>${formatarData(e.dataHora)}</td><td>${e.cpfMascarado}</td><td>${e.plataformas.join(', ')}</td><td>${e.protocolo}</td><td><span class="badge-success">${e.status}</span></td></tr>`).join('') : `<tr><td colspan="5">Nenhuma evidência registrada ainda.</td></tr>`;
    } catch (e) { toast(e.message, 'error'); }
}

function baixarRelatorio(tipo) {
    window.location.href = `${API}/relatorios/${tipo}`;
}

function renderizarCalendario() {
    const d = state.dataAtual;
    $('#calendar-month-year').textContent = new Intl.DateTimeFormat('pt-BR', { month:'long', year:'numeric' }).format(d);
    const grid = $('#calendar-days'); grid.innerHTML = '';
    ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'].forEach(label => grid.insertAdjacentHTML('beforeend', `<span class="calendar-day-label">${label}</span>`));
    const primeiro = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
    const total = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    for (let i=0; i<primeiro; i++) grid.appendChild(document.createElement('span'));
    for (let dia=1; dia<=total; dia++) {
        const el = document.createElement('span'); el.textContent = dia; el.className = 'day-clickable';
        if (dia === state.diaSelecionado) el.classList.add('active-day');
        el.onclick = () => { state.diaSelecionado = dia; renderizarCalendario(); };
        grid.appendChild(el);
    }
}

function bindEvents() {
    $$('.nav-menu .nav-btn').forEach(btn => btn.addEventListener('click', () => navegar(btn.dataset.route)));
    window.addEventListener('hashchange', aplicarRota);
    document.addEventListener('click', (event) => {
        const clientBtn = event.target.closest('[data-client-id]');
        if (clientBtn) { navegar('cat'); abrirDetalhe(clientBtn.dataset.clientId); }
        const report = event.target.closest('[data-report]');
        if (report) baixarRelatorio(report.dataset.report);
        const connection = event.target.closest('[data-connection]');
        if (connection) conectar(connection.dataset.connection, connection);
    });

    let homeTimer;
    $('#home-search-input').addEventListener('input', (e) => {
        clearTimeout(homeTimer);
        homeTimer = setTimeout(async () => {
            const termo = e.target.value.trim();
            if (!termo) return $('#home-search-results').classList.add('hidden');
            const lista = await api(`/titulares?query=${encodeURIComponent(termo)}`).catch(() => []);
            $('#home-search-results').innerHTML = lista.length ? lista.map(clientRow).join('') : empty('Nenhum titular encontrado.');
            $('#home-search-results').classList.remove('hidden');
        }, 250);
    });
    $('#cat-search-button').addEventListener('click', () => carregarTitulares($('#cat-search').value));
    $('#cat-search').addEventListener('keydown', e => { if (e.key === 'Enter') carregarTitulares(e.target.value); });
    $('#cat-back').addEventListener('click', () => { fecharDetalhe(); navegar('cat'); });
    $('#btn-purga').addEventListener('click', purgarAtual);
    $('#risk-search').addEventListener('input', e => renderAlertas(e.target.value));
    $('#risk-filter').addEventListener('click', () => renderAlertas($('#risk-search').value));
    $('#calendar-prev').addEventListener('click', () => { state.dataAtual.setMonth(state.dataAtual.getMonth()-1); state.diaSelecionado=1; renderizarCalendario(); });
    $('#calendar-next').addEventListener('click', () => { state.dataAtual.setMonth(state.dataAtual.getMonth()+1); state.diaSelecionado=1; renderizarCalendario(); });
    $('#new-platform').addEventListener('click', () => toast('Cadastro de novas integrações fica para o próximo incremento.'));
}

async function init() {
    bindEvents();
    aplicarRota();
    renderizarCalendario();
    await Promise.all([carregarDashboard(), carregarTitulares(), carregarConexoes(), carregarEvidencias()]);
    const hash = location.hash.replace('#','');
    if (hash.startsWith('cat/')) abrirDetalhe(hash.split('/')[1]);
}

document.addEventListener('DOMContentLoaded', init);
