ALTER TABLE reports
    ADD COLUMN created_by INT NULL AFTER creator_name,
    ADD COLUMN report_filters JSON NULL AFTER file_url,
    ADD INDEX idx_reports_created_by (created_by),
    ADD CONSTRAINT fk_reports_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
