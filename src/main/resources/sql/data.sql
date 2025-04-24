CREATE TABLE attendance_status (
                                   code INT PRIMARY KEY,
                                   description VARCHAR(20) NOT NULL
);

-- 예시 데이터
INSERT INTO attendance_status (code, description) VALUES
                                                      (1, '출석'),
                                                      (2, '지각'),
                                                      (3, '결석'),
                                                      (4, '외출'),
                                                      (5, '휴가'),
                                                      (6, '질병/입원'),
                                                      (7, '조퇴'),
                                                      (8, '기타');


CREATE TABLE attendance (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            mb_no BIGINT NOT NULL,
                            work_date DATE NULL,
                            in_time DATETIME,
                            out_time DATETIME,
                            work_minutes INT,
                            status INT NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                            UNIQUE (mb_no, work_date),
                            FOREIGN KEY (mb_no) REFERENCES members(mb_no),
                            FOREIGN KEY (status) REFERENCES attendance_status(code)
);