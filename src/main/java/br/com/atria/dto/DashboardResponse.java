package br.com.atria.dto;

import br.com.atria.model.Solicitacao;
import java.util.List;

public record DashboardResponse(
        List<Solicitacao> alertas,
        long totalTitulares,
        long plataformasConectadas,
        String statusAnpd,
        String statusMarketplace
) {}
