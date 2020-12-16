CREATE TABLE corso_di_studi (
    id int NOT NULL AUTO_INCREMENT,
    unict_id varchar(255),
    nome varchar(255),
    classe varchar(255),
    anno_accademico varchar(255),
    id_dipartimento int,
    PRIMARY KEY (id),
    UNIQUE (id, unict_id),
    FOREIGN KEY (id_dipartimento) REFERENCES dipartimenti(id)
)