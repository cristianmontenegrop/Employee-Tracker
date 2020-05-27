var CRUD = require("./lib/CRUD");
var inquirer = require("inquirer");
var table = require("console.table");
var logo = require("asciiart-logo");

start();

function start() {
    const logotext = logo({
        name: "Employee Manager"
    }).render();
    console.log(logotext);
    runInquirer();
}

function runInquirer() {
    inquirer
        .prompt({
            name: "action",
            type: "rawlist",
            message: "What would you like to do?",
            choices: [
                "Add Department",
                "Add Role",
                "Add Employee",
                "Remove Department",
                // "Remove Role",
                // "Remove Employee",
                "Update Employee Role",
                // "Update Employee Manager",
                "View All Departments",
                "View All Roles",
                "View All Employees",
                // "View All Employees by Manager",
                // "View Total Utilized Budget per Department",
                "I'm done"
            ]
        })
        .then(async function (answer) {
            switch (answer.action) {
                case "Add Department":
                    addDepartment();
                    break;

                case "Add Role":
                    addRole();
                    break;

                case "Add Employee":
                    addEmployee();
                    break;

                case "Remove Department":
                    removeDepartment();
                    break;

                    // case "Remove Role":
                    //     removeRole();
                    //     break;

                case "Remove Employee":
                    removeEmployee();
                    break;

                case "Update Employee Role":
                    updateEmployeeRole();
                    break;

                    // case "Update Employee Manager":
                    //     updateEmployeeManager();
                    //     break;

                case "View All Departments":
                    viewAllDepartments();
                    break;

                case "View All Roles":
                    viewAllRoles();
                    break;
                case "View All Employees":
                    viewAllEmployees();
                    break;

                    // case "View All Employees by Manager":
                    //     viewAllEmployeesByManager();
                    //     break;

                    // case "View Total Utilized Budget per Department":
                    //     viewTotalBudgetPerDepartment();
                    //     break;
                case "I'm done":
                    await new CRUD().end();
                    return;
                    break;

            }
        });
}


addDepartment = () => {

    inquirer.prompt([{
        name: "department",
        type: "input",
        message: "What is the department name you wish to add?"
    }]).then(async function (answer) {
        var table = "department";
        var columns = "department_name";

        var res = await new CRUD(table, columns, answer.department).create();
        if (res.serverStatus === 2) {
            console.log("Department " + answer.department + " Was added with the ID: " + res.insertId);
        };
        setTimeout((function () {
            runInquirer();
        }), 1000);
    });
};

addRole = async () => {

    var departmentRes = await new CRUD("department", "*", null).read();

    var departmentChoices = departmentRes.map(({
        department_id,
        department_name
    }) => ({
        name: department_name,
        value: department_id
    }));
    departmentChoices.push({
        name: "Go back",
        value: -1
    });

    inquirer.prompt([{
        name: "role",
        type: "input",
        message: "What is the role you wish to add?"
    }, {
        name: "salary",
        type: 'number',
        message: "what is the salary this role holds?",
        validate: (input) => {
            if (isNaN(input)) {
                return ("Input must be a valid number");
            }
            return true;
        }
    }, {
        name: "department_id",
        type: "list",
        message: "Which of this department does the role belong to?",
        choices: departmentChoices

    }]).then(async function ({
        role,
        salary,
        department_id
    }) {
        var table = "role";
        var columns = ["title", "salary", "department_id"];
        var data = [role, salary, department_id]
        if (department_id === -1) {
            return runInquirer();
        };
        var res = await new CRUD(table, columns, data).create();
        if (res.serverStatus === 2) {
            console.log("Role " + role + " Was added with the ID: " + res.insertId);
        };
        setTimeout((function () {
            runInquirer();
        }), 1000);
    })
};

addEmployee = async () => {

    var roleRes = await new CRUD("role", "*", null).read();

    var roleChoices = roleRes.map(({
        role_id,
        title
    }) => ({
        name: title,
        value: role_id
    }));

    inquirer.prompt([{
        name: "first_name",
        type: "input",
        message: "What is the Employee's First Name?"
    }, {
        name: "last_name",
        type: "input",
        message: "What is the Employee's Last Name?"
    }, {
        name: "role_id",
        type: "list",
        message: "Which of this roles does the employee have?",
        choices: roleChoices
    }, {
        name: "is_manager",
        type: "confirm",
        message: "Is this Employee a Manager?"


    }]).then(async function ({
        first_name,
        last_name,
        role_id,
        is_manager
    }) {
        var table = "employee";
        var columns = ["first_name", "last_name", "role_id"];
        var data = [first_name, last_name, role_id];
        var createEmployee = await new CRUD(table, columns, data).create();

        if (is_manager === true) {
            console.log(createEmployee)
            var sql = `UPDATE employee SET manager_id = ${createEmployee.insertId} WHERE
                employee_id = ${createEmployee.insertId}`;

            var manager_id_insertion = await new CRUD(table, null, sql, true).update();
            console.log(manager_id_insertion);
        }

        if (createEmployee.serverStatus === 2) {
            console.table(`Employee ${first_name} ${last_name} Was added with the ID: ${createEmployee.insertId}`);
        }

        setTimeout((function () {
            runInquirer();
        }), 1000);

    });
};


viewAllDepartments = async () => {
    var res = await new CRUD("department", "*", null).read();
    console.table(res);

    setTimeout((function () {
        runInquirer();
    }), 1000);
};


viewAllRoles = async () => {
    var res = await new CRUD("role", "*", null).read();
    console.table(res);

    setTimeout((function () {
        runInquirer();
    }), 1000);
};

viewAllEmployees = async () => {
    var res = await new CRUD("employee", "*", null).read();
    console.table(res);

    setTimeout((function () {
        runInquirer();
    }), 1000);
};

removeDepartment = async () => {
    var res = await new CRUD("department", "*", null).read();

    const departmentChoices = res.map(({
        department_id,
        department_name
    }) => ({
        name: department_name,
        value: department_id
    }));
    departmentChoices.push({
        name: "Go back",
        value: -1
    });
    inquirer.prompt([{
        name: "department_id",
        type: "list",
        message: "Which of this departments would you like to remove?",
        choices: departmentChoices

    }]).then(async function ({
        department_id
    }) {
        var table = "department";
        var columns = "department_id";
        var data = department_id;
        if (department_id === -1) {
            return runInquirer();
        };

        var res = await new CRUD(table, columns, data).delete();
        if (res.serverStatus === 2) {
            var message = null;
            departmentChoices.forEach(element => {
                if (element.value === data) {
                    message = element.name;
                }
            });
            console.table("Department " + message + " Was removed succesfully");
        }
        setTimeout((function () {
            runInquirer();
        }), 1000);

    })

};

removeEmployee = async () => {
    var res = await new CRUD("employee", "*", null).read();

    const employeeChoices = res.map(({
        employee_id,
        first_name,
        last_name,

    }) => ({
        name: first_name + " " + last_name,
        value: employee_id
    }));
    departmentChoices.push({
        name: "Go back",
        value: -1
    });
    inquirer.prompt([{
        name: "employee_id",
        type: "list",
        message: "Which of this Employees would you like to remove?",
        choices: employeeChoices

    }]).then(async function ({
        employee_id
    }) {
        var table = "employee";
        var columns = "employee_id";
        var data = employee_id;
        if (employee_id === -1) {
            return runInquirer();
        };

        var res = await new CRUD(table, columns, data).delete();
        if (res.serverStatus === 2) {
            var message = null;
            employeeChoices.forEach(element => {
                if (element.value === data) {
                    message = element.name;
                }
            });
            console.table("Employee " + message + " Was removed succesfully");
        }
        setTimeout((function () {
            runInquirer();
        }), 1000);

    })

};