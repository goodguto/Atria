package br.com.atria.service;

import br.com.atria.dto.DashboardResponse;
import br.com.atria.dto.PurgaResponse;
import br.com.atria.model.*;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class AtriaService {
    private final Map<Long, Titular> titulares = new ConcurrentHashMap<>();
    private final Map<String, Conexao> conexoes = new LinkedHashMap<>();
    private final List<Solicitacao> solicitacoes = Collections.synchronizedList(new ArrayList<>());
    private final List<Evidencia> evidencias = Collections.synchronizedList(new ArrayList<>());
    private final AtomicLong evidenciaSequence = new AtomicLong(1);

    @PostConstruct
    void seed() {
        titulares.put(1L, new Titular(
                1L, "Roberto Lucas Almeida", "123.456.789-10", "betinhokiller12@gmail.com",
                "(81) 99999-0001", "50000-000", new BigDecimal("1280.40"),
                List.of("WhatsApp", "Instagram", "TikTok", "Nuvemshop"),
                List.of(new Interacao("Solicitação de exclusão", LocalDate.now().minusDays(2)))));

        titulares.put(2L, new Titular(
                2L, "Mariana Souza Lima", "987.654.321-00", "mariana.souza@email.com",
                "(81) 98888-1002", "51000-100", new BigDecimal("754.90"),
                List.of("Instagram", "Mercado Livre"),
                List.of(new Interacao("Consulta de dados", LocalDate.now().minusDays(6)))));

        titulares.put(3L, new Titular(
                3L, "Carlos Henrique Melo", "111.222.333-44", "carlos.melo@email.com",
                "(81) 97777-2003", "52000-200", new BigDecimal("230.00"),
                List.of("WhatsApp", "TikTok"),
                List.of(new Interacao("Atualização cadastral", LocalDate.now().minusDays(12)))));

        solicitacoes.add(new Solicitacao(1L, 1L, "Roberto Lucas Almeida", "betinhokiller12@gmail.com",
                "Exclusão de dados", LocalDate.now().plusDays(4), "PENDENTE"));
        solicitacoes.add(new Solicitacao(2L, 2L, "Mariana Souza Lima", "mariana.souza@email.com",
                "Acesso aos dados", LocalDate.now().plusDays(9), "PENDENTE"));

        conexoes.put("whatsapp", new Conexao("whatsapp", "WhatsApp", "💬", true));
        conexoes.put("instagram", new Conexao("instagram", "Instagram", "📸", true));
        conexoes.put("tiktok", new Conexao("tiktok", "TikTok", "🎵", false));
        conexoes.put("nuvemshop", new Conexao("nuvemshop", "Nuvemshop", "🛍️", false));
        conexoes.put("mercado-livre", new Conexao("mercado-livre", "Mercado Livre", "📦", false));
    }

    public DashboardResponse dashboard() {
        long conectadas = conexoes.values().stream().filter(Conexao::conectada).count();
        return new DashboardResponse(
                listarSolicitacoes(), titulares.size(), conectadas,
                "Conformidade monitorada", "Nenhuma pendência crítica identificada");
    }

    public List<Titular> buscarTitulares(String query) {
        String termo = Optional.ofNullable(query).orElse("").trim().toLowerCase(Locale.ROOT);
        return titulares.values().stream()
                .filter(t -> termo.isBlank()
                        || t.nome().toLowerCase(Locale.ROOT).contains(termo)
                        || t.email().toLowerCase(Locale.ROOT).contains(termo)
                        || somenteDigitos(t.cpf()).contains(somenteDigitos(termo)))
                .sorted(Comparator.comparing(Titular::nome))
                .toList();
    }

    public Titular obterTitular(Long id) {
        Titular titular = titulares.get(id);
        if (titular == null) throw new NoSuchElementException("Titular não encontrado");
        return titular;
    }

    public List<Solicitacao> listarSolicitacoes() {
        synchronized (solicitacoes) {
            return solicitacoes.stream()
                    .filter(s -> !"CONCLUIDA".equals(s.status()))
                    .sorted(Comparator.comparing(Solicitacao::prazo))
                    .toList();
        }
    }

    public List<Conexao> listarConexoes() {
        return List.copyOf(conexoes.values());
    }

    public Conexao conectar(String slug) {
        Conexao atual = conexoes.get(slug);
        if (atual == null) throw new NoSuchElementException("Plataforma não encontrada");
        Conexao conectada = atual.conectar();
        conexoes.put(slug, conectada);
        return conectada;
    }

    public PurgaResponse purgar(Long titularId) {
        Titular titular = obterTitular(titularId);
        String protocolo = "ATR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        LocalDateTime agora = LocalDateTime.now();

        evidencias.add(0, new Evidencia(
                evidenciaSequence.getAndIncrement(), titularId, agora,
                mascararCpf(titular.cpf()), titular.plataformas(), "CERTIFICADO", protocolo));

        synchronized (solicitacoes) {
            for (int i = 0; i < solicitacoes.size(); i++) {
                Solicitacao s = solicitacoes.get(i);
                if (Objects.equals(s.titularId(), titularId)) {
                    solicitacoes.set(i, new Solicitacao(s.id(), s.titularId(), s.titularNome(), s.email(), s.tipo(), s.prazo(), "CONCLUIDA"));
                }
            }
        }

        return new PurgaResponse(protocolo, titular.id(), titular.nome(), agora, titular.plataformas(), "CONCLUIDA");
    }

    public List<Evidencia> listarEvidencias() {
        synchronized (evidencias) {
            return List.copyOf(evidencias);
        }
    }

    public String gerarRelatorio(String tipo) {
        String titulo = switch (tipo.toLowerCase(Locale.ROOT)) {
            case "esg" -> "Relatório ESG - Governança (Pilar G)";
            case "anpd" -> "Relatório de Conformidade ANPD";
            case "comercial" -> "Diferencial Comercial de Privacidade";
            default -> throw new IllegalArgumentException("Tipo de relatório inválido");
        };
        return titulo + "\nGerado em: " + LocalDateTime.now() +
                "\nTitulares cadastrados: " + titulares.size() +
                "\nPlataformas conectadas: " + conexoes.values().stream().filter(Conexao::conectada).count() +
                "\nEvidências registradas: " + evidencias.size() + "\n";
    }

    private static String somenteDigitos(String valor) {
        return valor == null ? "" : valor.replaceAll("\\D", "");
    }

    private static String mascararCpf(String cpf) {
        String d = somenteDigitos(cpf);
        if (d.length() != 11) return "***.***.***-**";
        return "***.***." + d.substring(6, 9) + "-**";
    }
}
