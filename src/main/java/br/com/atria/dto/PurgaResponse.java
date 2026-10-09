package br.com.atria.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PurgaResponse(
        String protocolo,
        Long titularId,
        String titularNome,
        LocalDateTime concluidaEm,
        List<String> plataformas,
        String status
) {}
