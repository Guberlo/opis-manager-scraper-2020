CREATE TABLE dipartimento (
    id int NOT NULL AUTO_INCREMENT,
    unict_id int NOT NULL,
    anno_accademico varchar(255),
    nome varchar(255),
    PRIMARY KEY (id),
    UNIQUE (unict_id)
)