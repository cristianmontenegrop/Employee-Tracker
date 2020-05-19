DROP DATABASE IF EXISTS employee_trackerDB;
CREATE database employee_trackerDB;

USE employee_trackerDB;

CREATE TABLE employee (
    id INT AUTO_INCREMENT NOT NULL,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INT,
    manager_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (role_id),
    FOREIGN KEY (manager_id)
);

CREATE TABLE role (
    id INT AUTO_INCREMENT NOT NULL,
    title VARCHAR(30),
    salary DECIMAL(7,2),
    department_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (department_id)
);

CREATE TABLE department (
    id INT AUTO INCREMENT,
    name VARCHAR(30),
    PRIMARY KEY(id)
);

