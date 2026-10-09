package br.com.atria.model;

import java.math.BigDecimal;
import java.util.List;

public record Titular(
        Long id,
        String nome,
        String cpf,
        String email,
        String telefone,
        String cep,
        BigDecimal gastosTotais,
        List<String> plataformas,
        List<Interacao> interacoes
) {}
