package br.com.atria.model;

import java.time.LocalDateTime;
import java.util.List;

public record Evidencia(
        Long id,
        Long titularId,
        LocalDateTime dataHora,
        String cpfMascarado,
        List<String> plataformas,
        String status,
        String protocolo
) {}
