package br.com.atria.model;

import java.time.LocalDate;

public record Solicitacao(
        Long id,
        Long titularId,
        String titularNome,
        String email,
        String tipo,
        LocalDate prazo,
        String status
) {}
