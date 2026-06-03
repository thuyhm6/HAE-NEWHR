-- Script tạo các bảng phân quyền cho hệ thống HR
-- sy_user_relation, sy_role_group, sy_role, sy_role_group_relation, sy_menu, sy_role_relation

-- Tạo bảng sy_user_relation
CREATE TABLE sy_user_relation (
    USER_NO VARCHAR(20) NOT NULL,
    ROLE_GROUP_NO VARCHAR(20) NOT NULL,
    CREATE_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CREATED_BY VARCHAR(50),
    UPDATE_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY VARCHAR(50),
    ORDERNO INTEGER,
    ACTIVITY INTEGER DEFAULT 1,
    PRIMARY KEY (USER_NO, ROLE_GROUP_NO),
    FOREIGN KEY (USER_NO) REFERENCES sy_user(USER_NO),
    FOREIGN KEY (ROLE_GROUP_NO) REFERENCES sy_role_group(ROLE_GROUP_NO)
);

-- Tạo bảng sy_role_group
CREATE TABLE sy_role_group (
    ROLE_GROUP_NO VARCHAR(20) PRIMARY KEY,
    ROLE_GROUP_ID VARCHAR(50) NOT NULL,
    JOIN_DEFAULT VARCHAR(1) DEFAULT 'N',
    CPNY_ID VARCHAR(10) NOT NULL,
    CREATE_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CREATED_BY VARCHAR(50),
    UPDATE_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY VARCHAR(50),
    ORDERNO INTEGER,
    ACTIVITY INTEGER DEFAULT 1,
    SYS_TYPE VARCHAR(20)
);

-- Tạo bảng sy_role
CREATE TABLE sy_role (
    ROLE_NO VARCHAR(20) PRIMARY KEY,
    ROLE_ID VARCHAR(50) NOT NULL,
    CPNY_ID VARCHAR(10) NOT NULL,
    CREATE_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CREATED_BY VARCHAR(50),
    UPDATE_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY VARCHAR(50),
    ORDERNO INTEGER,
    ACTIVITY INTEGER DEFAULT 1,
    SYS_TYPE VARCHAR(20)
);

-- Tạo bảng sy_role_group_relation
CREATE TABLE sy_role_group_relation (
    ROLE_GROUP_NO VARCHAR(20) NOT NULL,
    ROLE_NO VARCHAR(20) NOT NULL,
    CREATE_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CREATED_BY VARCHAR(50),
    UPDATE_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY VARCHAR(50),
    ORDERNO INTEGER,
    ACTIVITY INTEGER DEFAULT 1,
    PRIMARY KEY (ROLE_GROUP_NO, ROLE_NO),
    FOREIGN KEY (ROLE_GROUP_NO) REFERENCES sy_role_group(ROLE_GROUP_NO),
    FOREIGN KEY (ROLE_NO) REFERENCES sy_role(ROLE_NO)
);

-- Tạo bảng sy_menu
CREATE TABLE sy_menu (
    MENU_NO VARCHAR(20) PRIMARY KEY,
    MENU_PARENT_NO VARCHAR(20),
    MENU_CODE VARCHAR(50) NOT NULL,
    MENU_IMG VARCHAR(100),
    DEPTH INTEGER DEFAULT 1,
    MENU_URL VARCHAR(200),
    CREATE_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CREATED_BY VARCHAR(50),
    UPDATE_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY VARCHAR(50),
    ORDERNO INTEGER,
    ACTIVITY INTEGER DEFAULT 1,
    FOREIGN KEY (MENU_PARENT_NO) REFERENCES sy_menu(MENU_NO)
);

-- Tạo bảng sy_role_relation
CREATE TABLE sy_role_relation (
    ROLE_NO VARCHAR(20) NOT NULL,
    MENU_NO VARCHAR(20) NOT NULL,
    SELECTR VARCHAR(1) DEFAULT 'N',
    INSERTR VARCHAR(1) DEFAULT 'N',
    UPDATER VARCHAR(1) DEFAULT 'N',
    DELETER VARCHAR(1) DEFAULT 'N',
    CREATE_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CREATED_BY VARCHAR(50),
    UPDATE_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY VARCHAR(50),
    ORDERNO INTEGER,
    ACTIVITY INTEGER DEFAULT 1,
    PRIMARY KEY (ROLE_NO, MENU_NO),
    FOREIGN KEY (ROLE_NO) REFERENCES sy_role(ROLE_NO),
    FOREIGN KEY (MENU_NO) REFERENCES sy_menu(MENU_NO)
);

-- Tạo indexes để tối ưu performance
CREATE INDEX idx_sy_user_relation_user_no ON sy_user_relation(USER_NO);
CREATE INDEX idx_sy_user_relation_role_group_no ON sy_user_relation(ROLE_GROUP_NO);
CREATE INDEX idx_sy_user_relation_activity ON sy_user_relation(ACTIVITY);

CREATE INDEX idx_sy_role_group_cpny_id ON sy_role_group(CPNY_ID);
CREATE INDEX idx_sy_role_group_activity ON sy_role_group(ACTIVITY);
CREATE INDEX idx_sy_role_group_join_default ON sy_role_group(JOIN_DEFAULT);

CREATE INDEX idx_sy_role_cpny_id ON sy_role(CPNY_ID);
CREATE INDEX idx_sy_role_activity ON sy_role(ACTIVITY);

CREATE INDEX idx_sy_role_group_relation_role_group_no ON sy_role_group_relation(ROLE_GROUP_NO);
CREATE INDEX idx_sy_role_group_relation_role_no ON sy_role_group_relation(ROLE_NO);
CREATE INDEX idx_sy_role_group_relation_activity ON sy_role_group_relation(ACTIVITY);

CREATE INDEX idx_sy_menu_parent_no ON sy_menu(MENU_PARENT_NO);
CREATE INDEX idx_sy_menu_code ON sy_menu(MENU_CODE);
CREATE INDEX idx_sy_menu_activity ON sy_menu(ACTIVITY);
CREATE INDEX idx_sy_menu_depth ON sy_menu(DEPTH);

CREATE INDEX idx_sy_role_relation_role_no ON sy_role_relation(ROLE_NO);
CREATE INDEX idx_sy_role_relation_menu_no ON sy_role_relation(MENU_NO);
CREATE INDEX idx_sy_role_relation_activity ON sy_role_relation(ACTIVITY);
CREATE INDEX idx_sy_role_relation_selectr ON sy_role_relation(SELECTR);
CREATE INDEX idx_sy_role_relation_insertr ON sy_role_relation(INSERTR);
CREATE INDEX idx_sy_role_relation_updater ON sy_role_relation(UPDATER);
CREATE INDEX idx_sy_role_relation_deleter ON sy_role_relation(DELETER);
