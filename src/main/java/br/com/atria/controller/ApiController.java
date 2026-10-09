package br.com.atria.controller;

import br.com.atria.dto.DashboardResponse;
import br.com.atria.dto.PurgaResponse;
import br.com.atria.model.*;
import br.com.atria.service.AtriaService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final AtriaService service;

    public ApiController(AtriaService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "aplicacao", "Atria");
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return service.dashboard();
    }

    @GetMapping("/titulares")
    public List<Titular> titulares(@RequestParam(defaultValue = "") String query) {
        return service.buscarTitulares(query);
    }

    @GetMapping("/titulares/{id}")
    public Titular titular(@PathVariable Long id) {
        return service.obterTitular(id);
    }

    @PostMapping("/titulares/{id}/purga")
    public PurgaResponse purgar(@PathVariable Long id) {
        return service.purgar(id);
    }

    @GetMapping("/solicitacoes")
    public List<Solicitacao> solicitacoes() {
        return service.listarSolicitacoes();
    }

    @GetMapping("/conexoes")
    public List<Conexao> conexoes() {
        return service.listarConexoes();
    }

    @PostMapping("/conexoes/{slug}/conectar")
    public Conexao conectar(@PathVariable String slug) {
        return service.conectar(slug);
    }

    @GetMapping("/evidencias")
    public List<Evidencia> evidencias() {
        return service.listarEvidencias();
    }

    @GetMapping(value = "/relatorios/{tipo}", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<byte[]> relatorio(@PathVariable String tipo) {
        byte[] conteudo = service.gerarRelatorio(tipo).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=atria-" + tipo + ".txt")
                .contentType(new MediaType("text", "plain", StandardCharsets.UTF_8))
                .body(conteudo);
    }
}
