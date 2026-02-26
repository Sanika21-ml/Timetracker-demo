-- =============================================================
--  TimeTracker Database Migration
--  Version : 1.0.0
--  Created : 2026-02-26
--  Target  : MySQL 8.0+ (Local Workbench & Azure Database for MySQL)
-- =============================================================

-- -------------------------------------------------------------
-- 0. Create & select the database
-- -------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS timetracker2
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE timetracker2;

-- -------------------------------------------------------------
-- 1. users
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id     CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    azure_ad_id VARCHAR(100),
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 2. projectType
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projectType (
    projectType_id CHAR(36)                                    PRIMARY KEY DEFAULT (UUID()),
    typeValue      ENUM('Internal-Project', 'Client-Project')  NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 3. projectStatus
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projectStatus (
    projectStatus_id CHAR(36)                                 PRIMARY KEY DEFAULT (UUID()),
    StatusValue      ENUM('InProgress', 'Hold', 'Completed')  NOT NULL,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 4. projects
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    project_id          CHAR(36)       PRIMARY KEY DEFAULT (UUID()),
    project_name        VARCHAR(50)    NOT NULL,
    project_manager_id  CHAR(36),
    projectType_id      CHAR(36),
    projectStatus_id    CHAR(36),
    client_name         VARCHAR(100),
    estimated_hours     DECIMAL(5, 2),
    start_date          DATE,
    end_date            DATE,
    project_description VARCHAR(400),
    created_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_project_manager
        FOREIGN KEY (project_manager_id)
        REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_project_type
        FOREIGN KEY (projectType_id)
        REFERENCES projectType(projectType_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_project_status
        FOREIGN KEY (projectStatus_id)
        REFERENCES projectStatus(projectStatus_id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- -------------------------------------------------------------
-- 5. userProjectAssign
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS userProjectAssign (
    userProject_id CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
    user_id        CHAR(36)  NOT NULL,
    project_id     CHAR(36)  NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_up_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_up_project
        FOREIGN KEY (project_id)
        REFERENCES projects(project_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT unique_user_project
        UNIQUE (user_id, project_id)
);

-- -------------------------------------------------------------
-- 6. workstreams
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workstreams (
    workstream_id   CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    workstream_name VARCHAR(100),
    description     VARCHAR(400),
    estimated_hrs   DECIMAL(5, 2),
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 7. ProjectWorkStreamAssign
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ProjectWorkStreamAssign (
    ProjectWorkStream_id CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    project_id           CHAR(36)     NOT NULL,
    workstream_id        CHAR(36)     NOT NULL,
    start_date           DATE,
    end_date             DATE,
    estimated_hours      DECIMAL(5, 2),
    created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pws_project
        FOREIGN KEY (project_id)
        REFERENCES projects(project_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_pws_workstream
        FOREIGN KEY (workstream_id)
        REFERENCES workstreams(workstream_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT unique_project_workstream
        UNIQUE (project_id, workstream_id)
);

-- -------------------------------------------------------------
-- 8. time_entries
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS time_entries (
    timeentry_id         CHAR(36)   PRIMARY KEY DEFAULT (UUID()),
    user_id              CHAR(36)   NOT NULL,
    project_workstream_id CHAR(36)  NOT NULL,
    week_start_date      DATE       NOT NULL,
    week_end_date        DATE       NOT NULL,
    week_entries         JSON       NOT NULL,
    created_at           TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_te_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_te_pws
        FOREIGN KEY (project_workstream_id)
        REFERENCES ProjectWorkStreamAssign(ProjectWorkStream_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT unique_week_entry
        UNIQUE (user_id, project_workstream_id, week_start_date)
);

-- -------------------------------------------------------------
-- 9. Indexes
-- -------------------------------------------------------------
CREATE INDEX idx_time_user    ON time_entries(user_id);
CREATE INDEX idx_time_week    ON time_entries(week_start_date);
CREATE INDEX idx_pws_project  ON ProjectWorkStreamAssign(project_id);

-- -------------------------------------------------------------
-- 10. Seed Data – lookup tables
-- -------------------------------------------------------------
INSERT INTO projectType (projectType_id, typeValue) VALUES
(UUID(), 'Internal-Project'),
(UUID(), 'Client-Project');

INSERT INTO projectStatus (projectStatus_id, StatusValue) VALUES
(UUID(), 'InProgress'),
(UUID(), 'Hold'),
(UUID(), 'Completed');

-- =============================================================
-- Migration complete
-- =============================================================
