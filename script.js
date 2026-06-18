let dataAtual = new Date();
let diaSelecionado = dataAtual.getDate();

document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-menu .nav-btn');
    const sections = document.querySelectorAll('.view-section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            let targetId = e.target.getAttribute('data-target');

            navButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            sections.forEach(sec => sec.classList.add('hidden'));
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }

            if(targetId === 'cat') fecharCATDetalhe();
        });
    });

    /* MAPEAMENTO DA SIMULAÇÃO DE PESQUISA LOCAL NA HOME */
    const homeSearchInput = document.getElementById('home-search-input');
    const homeSearchResults = document.getElementById('home-search-results');
    
    if (homeSearchInput && homeSearchResults) {
        homeSearchInput.addEventListener('focus', () => {
            homeSearchResults.classList.remove('hidden');
        });

        homeSearchInput.addEventListener('input', (e) => {
            if (e.target.value.trim().length > 0) {
                homeSearchResults.classList.remove('hidden');
            }
        });

        document.addEventListener('click', (e) => {
            if (!homeSearchInput.contains(e.target) && !homeSearchResults.contains(e.target)) {
                homeSearchResults.classList.add('hidden');
            }
        });
    }

    renderizarCalendario();
});

function renderizarCalendario() {
    const monthYearText = document.getElementById('calendar-month-year');
    const daysGrid = document.getElementById('calendar-days');
    if (!daysGrid || !monthYearText) return;

    daysGrid.innerHTML = '';

    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

    monthYearText.innerText = `${meses[dataAtual.getMonth()]} de ${dataAtual.getFullYear()}`;

    diasSemana.forEach(dia => {
        const span = document.createElement('span');
        span.className = 'calendar-day-label';
        span.innerText = dia;
        daysGrid.appendChild(span);
    });

    const primeiroDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1).getDay();
    const totalDiasMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0).getDate();

    for (let i = 0; i < primeiroDiaMes; i++) {
        const empySpan = document.createElement('span');
        daysGrid.appendChild(empySpan);
    }

    for (let dia = 1; dia <= totalDiasMes; dia++) {
        const daySpan = document.createElement('span');
        daySpan.innerText = dia;
        daySpan.className = 'day-clickable';

        if (dia === diaSelecionado) {
            daySpan.classList.add('active-day');
        }

        daySpan.addEventListener('click', () => {
            document.querySelectorAll('.day-clickable').forEach(el => el.classList.remove('active-day'));
            daySpan.classList.add('active-day');
            diaSelecionado = dia;
        });

        daysGrid.appendChild(daySpan);
    }
}

function mudarMes(direcao) {
    dataAtual.setMonth(dataAtual.getMonth() + direcao);
    if (direcao !== 0) {
        diaSelecionado = 1;
    }
    renderizarCalendario();
}

/* FUNÇÃO ORIGINAL DE CONEXÃO RESTAURADA */
function conectarApp(card, nomeApp) {
    const btn = card.querySelector('.btn-connect');
    if (btn.classList.contains('connected')) return;

    btn.innerText = `⏳ Autenticando API...`;
    card.style.opacity = '0.7';

    setTimeout(() => {
        card.classList.add('connected-style'); // Aplica a borda verde do figma
        btn.classList.add('connected');
        btn.innerText = `✓ Conectado`;
        card.style.opacity = '1';
        card.style.borderColor = '#418233'; // Força a cor verde institucional
    }, 1500);
}

function irParaPerfilCliente() {
    const catBtn = document.querySelector('.nav-btn[data-target="cat"]');
    if (catBtn) {
        catBtn.click(); 
        abrirCATDetalhe(); 
    }
}

function irParaCAT() {
    const catBtn = document.querySelector('.nav-btn[data-target="cat"]');
    if (catBtn) catBtn.click();
}

function toggleExpandir(event, containerId) {
    event.stopPropagation();
    const container = document.getElementById(containerId);
    if (!container) return;
    const extraData = container.querySelector('.extra-data');
    if (extraData) {
        extraData.classList.toggle('hidden');
    }
}

function abrirCATDetalhe() {
    document.getElementById('cat-main-view').classList.add('hidden');
    document.getElementById('cat-detail-view').classList.remove('hidden');
}

function fecharCATDetalhe() {
    document.getElementById('cat-detail-view').classList.add('hidden');
    document.getElementById('cat-main-view').classList.remove('hidden');
}

function buscarTitular() {
    const termo = document.getElementById('cat-search').value;
    if(!termo) {
        alert("Digite um CPF ou E-mail para buscar nas bases integradas.");
        return;
    }
    abrirCATDetalhe();
    document.getElementById('detail-name').innerText = `Resultado para: ${termo}`;
}

function iniciarPurgaUnificada() {
    const btn = document.getElementById('btn-purga');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = "⏳ Varrendo sistemas...";
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.7';

    const plataformas = document.querySelectorAll('.platform-row');
    let delay = 600;

    plataformas.forEach((row, index) => {
        setTimeout(() => {
            const status = row.querySelector('.action-arrow');
            status.innerHTML = "⏳ Removendo...";
            status.style.color = "#d32f2f";

            setTimeout(() => {
                status.innerText = "✅ Deletado";
                status.style.color = "#2e7d32";
                
                if (index === plataformas.length - 1) {
                    btn.innerHTML = originalText;
                    btn.style.pointerEvents = 'auto';
                    btn.style.opacity = '1';
                    btn.style.display = 'none';
                    
                    document.getElementById('receipt-area').classList.remove('hidden');
                    inserirEvidenciaESG();
                }
            }, 600);
        }, delay);
        delay += 800;
    });
}

function baixarPDF() {
    alert("Iniciando o download do recibo criptografado (PDF).");
}

function gerarRelatorioESG() {
    alert("Compilando dados de governança (Pilar G)...");
}

function inserirEvidenciaESG() {
    const tbody = document.getElementById('esg-history');
    if (!tbody) return;
    const tr = document.createElement('tr');
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    tr.innerHTML = `
        <td>${hoje}</td>
        <td>***.***.***-**</td>
        <td>WhatsApp, Instagram, X, Tiktok</td>
        <td><span class="badge-success">Certificado</span></td>
    `;
    tbody.insertBefore(tr, tbody.firstChild);
}