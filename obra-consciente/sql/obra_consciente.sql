CREATE DATABASE obra_consciente;
USE obra_consciente;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil ENUM('admin', 'estoquista', 'consulta') NOT NULL DEFAULT 'consulta',
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE materiais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(140) NOT NULL,
  categoria VARCHAR(80) NOT NULL DEFAULT 'Outros',
  unidade VARCHAR(20) NOT NULL,
  quantidade DECIMAL(12,2) NOT NULL DEFAULT 0,
  estoque_minimo DECIMAL(12,2) NOT NULL DEFAULT 0,
  descricao TEXT,
  criado_por INT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_materiais_quantidade CHECK (quantidade >= 0),
  CONSTRAINT chk_materiais_estoque_minimo CHECK (estoque_minimo >= 0),
  CONSTRAINT fk_materiais_criado_por
    FOREIGN KEY (criado_por) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE movimentacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  material_id INT NOT NULL,
  usuario_id INT NULL,
  tipo ENUM('entrada', 'saida') NOT NULL,
  quantidade DECIMAL(12,2) NOT NULL,
  observacao VARCHAR(255),
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_movimentacao_quantidade CHECK (quantidade > 0),
  CONSTRAINT fk_movimentacoes_material
    FOREIGN KEY (material_id) REFERENCES materiais(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_movimentacoes_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX idx_materiais_nome ON materiais(nome);
CREATE INDEX idx_movimentacoes_data ON movimentacoes(criado_em);
