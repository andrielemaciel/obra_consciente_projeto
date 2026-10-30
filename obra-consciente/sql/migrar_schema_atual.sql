USE obra_consciente;

ALTER TABLE usuarios MODIFY COLUMN nome VARCHAR(120) NOT NULL;

ALTER TABLE usuarios
  MODIFY perfil ENUM('administrador', 'responsavel', 'funcionario', 'admin', 'estoquista', 'consulta')
  NOT NULL DEFAULT 'funcionario';

UPDATE usuarios
SET perfil = CASE perfil
  WHEN 'administrador' THEN 'admin'
  WHEN 'responsavel' THEN 'estoquista'
  WHEN 'funcionario' THEN 'consulta'
  ELSE perfil
END;

ALTER TABLE usuarios
  MODIFY perfil ENUM('admin', 'estoquista', 'consulta')
  NOT NULL DEFAULT 'consulta';

ALTER TABLE materiais
  DROP CHECK chk_quantidade_atual,
  DROP CHECK chk_quantidade_minima;

ALTER TABLE materiais
  MODIFY COLUMN obra_id INT NULL,
  CHANGE COLUMN unidade_medida unidade VARCHAR(20) NOT NULL,
  CHANGE COLUMN quantidade_atual quantidade DECIMAL(12,2) NOT NULL DEFAULT 0,
  CHANGE COLUMN quantidade_minima estoque_minimo DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN descricao TEXT NULL,
  ADD COLUMN criado_por INT NULL,
  ADD CONSTRAINT fk_materiais_criado_por
    FOREIGN KEY (criado_por) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE materiais
  ADD CONSTRAINT chk_materiais_quantidade CHECK (quantidade >= 0),
  ADD CONSTRAINT chk_materiais_estoque_minimo CHECK (estoque_minimo >= 0);

ALTER TABLE movimentacoes
  DROP FOREIGN KEY fk_movimentacoes_material,
  CHANGE COLUMN movimentada_em criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD CONSTRAINT fk_movimentacoes_material
    FOREIGN KEY (material_id) REFERENCES materiais(id)
    ON UPDATE CASCADE ON DELETE RESTRICT;
