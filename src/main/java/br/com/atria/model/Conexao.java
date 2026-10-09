package br.com.atria.model;

public record Conexao(String slug, String nome, String icone, boolean conectada) {
    public Conexao conectar() {
        return new Conexao(slug, nome, icone, true);
    }
}
