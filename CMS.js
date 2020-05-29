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
                "Remove Role",
                "Remove Employee",
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

                case "Remove Role":
                    removeRole();
                    break;

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

    var sql = `SELECT employee.employee_id, employee.first_name, employee.last_name, role.title, department.department_name FROM ((role INNER JOIN employee ON employee.role_id = role.role_id) INNER JOIN department ON role.department_id = department.department_id) WHERE employee.manager_id IS NULL;`
    var managers = await new CRUD(null, null, sql, true).read();

    var managersChoices = managers.map(({
        employee_id,
        first_name,
        last_name,
        title,
        department_name
    }) => ({
        name: `Name: ${first_name} ${last_name}  Title: ${title}  Department: ${department_name}`,
        value: employee_id
    }));
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

        if (is_manager === false) {
            await inquirer.prompt({
                name: "who_is_manager",
                type: "list",
                message: "Who is your manager?",
                choices: managersChoices
            }).then(async function ({
                who_is_manager
            }) {
                columns = ["first_name", "last_name", "role_id", "manager_id"];
                data = [first_name, last_name, role_id, who_is_manager];
            })
        };

        var createEmployee = await new CRUD(table, columns, data).create();

        if (createEmployee.serverStatus === 2) {
            console.table(`Employee ${first_name} ${last_name} Was added with the ID: ${createEmployee.insertId}`);
        }

        setTimeout((function () {
            runInquirer();
        }), 1000);
    })
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
    var sql = `SELECT employee.employee_id, employee.first_name, employee.last_name, role.title, department.department_name, role.salary FROM ((role INNER JOIN employee ON employee.role_id = role.role_id) INNER JOIN department ON role.department_id = department.department_id);`
    var res = await new CRUD(null, null, sql, true).read();
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
    var search = [];
    inquirer.prompt([{
        name: "first_name",
        type: "input",
        message: "What is the employee's first name?"
    }, {
        name: "last_name",
        type: "input",
        message: "What is the employee's last name?"
    }]).then(async ({
        first_name,
        last_name
    }) => {
        var sql = `SELECT employee.employee_id, employee.first_name, employee.last_name, role.title, department.department_name FROM ((role INNER JOIN employee ON employee.role_id = role.role_id) INNER JOIN department ON role.department_id = department.department_id) WHERE (first_name, last_name) = ("${first_name}", "${last_name}");`
        var res = await new CRUD(null, null, sql, true).read();
        // console.log(res);
        search = res.map(({
            employee_id,
            first_name,
            last_name,
            title,
            department_name
        }) => ({
            name: `First name: ${first_name}  Last name: ${last_name}  Title: ${title}  Department: ${department_name}  Employee ID: ${employee_id}`,
            value: employee_id
        }));
        search.push({
            name: "Go back",
            value: -1
        });

        inquirer.prompt([{
            name: "employee_id",
            type: "list",
            message: "Which of this Employees would you like to remove?",
            choices: search

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
                search.forEach(element => {
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
    })
};

removeRole = async () => {
    var res = await new CRUD("role", "*", null).read();

    const roleChoices = res.map(({
        role_id,
        title
    }) => ({
        name: title,
        value: role_id
    }));
    roleChoices.push({
        name: "Go back",
        value: -1
    });
    inquirer.prompt([{
        name: "role_id",
        type: "list",
        message: "Which of this roles would you like to remove?",
        choices: roleChoices

    }]).then(async function ({
        role_id
    }) {
        var table = "role";
        var columns = "role_id";
        var data = role_id;
        if (role_id === -1) {
            return runInquirer();
        };

        var res = await new CRUD(table, columns, data).delete();
        if (res.serverStatus === 2) {
            var message = null;
            roleChoices.forEach(element => {
                if (element.value === data) {
                    message = element.name;
                }
            });
            console.table("Role " + message + " Was removed succesfully");
        }
        setTimeout((function () {
            runInquirer();
        }), 1000);

    })


}

// updateEmployeeManager = async () => {

//     var search = [];
//     await inquirer.prompt([{
//         name: "first_name",
//         type: "input",
//         message: "What is the employee's first name?"
//     }, {
//         name: "last_name",
//         type: "input",
//         message: "What is the employee's last name?"
//     }]).then(async ({
//         first_name,
//         last_name
//     }) => {
//         var sql = `SELECT employee.employee_id, employee.first_name, employee.last_name, role.title, department.department_name FROM ((role INNER JOIN employee ON employee.role_id = role.role_id) INNER JOIN department ON role.department_id = department.department_id) WHERE (first_name, last_name) = ("${first_name}", "${last_name}");`
//         var res = await new CRUD(null, null, sql, true).read();
//         // console.log(res);
//         search = res.map(({
//             employee_id,
//             first_name,
//             last_name,
//             title,
//             department_name
//         }) => ({
//             name: `First name: ${first_name}  Last name: ${last_name}  Title: ${title}  Department: ${department_name}  Employee ID: ${employee_id}`,
//             value: employee_id
//         }));
//         search.push({
//             name: "Go back",
//             value: -1
//         });

//         inquirer.prompt([{
//             name: "employee_id",
//             type: "list",
//             message: "Which of this Employee's manager is the one you'd wish to edit",
//             choices: search

//         }]).then(async function ({
//             employee_id
//         }) {

//             // var table = "employee";
//             // var columns = "employee_id";
//             // var data = employee_id;
//             if (employee_id === -1) {
//                 return runInquirer();
//             };

//         })
//     })

// console.log(employee_id)

// var sql = `SELECT employee.employee_id, employee.first_name, employee.last_name, role.title, department.department_name FROM ((role INNER JOIN employee ON employee.role_id = role.role_id) INNER JOIN department ON role.department_id = department.department_id) WHERE employee.manager_id IS NULL;`
// var managers = await new CRUD(null, null, sql, true).read();

// var managersChoices = managers.map(({
//     employee_id,
//     first_name,
//     last_name,
//     title,
//     department_name
// }) => ({
//     name: `Name: ${first_name} ${last_name}  Title: ${title}  Department: ${department_name}`,
//     value: employee_id
// }));






//     // var res = await new CRUD(table, columns, data).delete();
//     if (res.serverStatus === 2) {
//         var message = null;
//         search.forEach(element => {
//             if (element.value === data) {
//                 message = element.name;
//             }
//         });
//         console.table("Employee " + message + " Was removed succesfully");
//     }
//     setTimeout((function () {
//         runInquirer();
//     }), 1000);











//     var sql = `SELECT employee.employee_id, employee.first_name, employee.last_name, role.title, department.department_name FROM ((role INNER JOIN employee ON employee.role_id = role.role_id) INNER JOIN department ON role.department_id = department.department_id) WHERE employee.manager_id IS NULL;`
//     var managers = await new CRUD(null, null, sql, true).read();

//     var managersChoices = managers.map(({
//         employee_id,
//         first_name,
//         last_name,
//         title,
//         department_name
//     }) => ({
//         name: `Name: ${first_name} ${last_name}  Title: ${title}  Department: ${department_name}`,
//         value: employee_id
//     }));

//     var roleRes = await new CRUD("role", "*", null).read();
//     var roleChoices = roleRes.map(({
//         role_id,
//         title
//     }) => ({
//         name: title,
//         value: role_id
//     }));

//     inquirer.prompt([{
//         name: "first_name",
//         type: "input",
//         message: "What is the Employee's First Name?"
//     }, {
//         name: "last_name",
//         type: "input",
//         message: "What is the Employee's Last Name?"
//     }, {
//         name: "role_id",
//         type: "list",
//         message: "Which of this roles does the employee have?",
//         choices: roleChoices
//     }, {
//         name: "is_manager",
//         type: "confirm",
//         message: "Is this Employee a Manager?"

//     }]).then(async function ({
//         first_name,
//         last_name,
//         role_id,
//         is_manager
//     }) {

//         var table = "employee";
//         var columns = ["first_name", "last_name", "role_id"];
//         var data = [first_name, last_name, role_id];

//         if (is_manager === false) {
//             await inquirer.prompt({
//                 name: "who_is_manager",
//                 type: "list",
//                 message: "Who is your manager?",
//                 choices: managersChoices
//             }).then(async function ({
//                 who_is_manager
//             }) {
//                 columns = ["first_name", "last_name", "role_id", "manager_id"];
//                 data = [first_name, last_name, role_id, who_is_manager];
//             })
//         };

//         var createEmployee = await new CRUD(table, columns, data).create();

//         if (createEmployee.serverStatus === 2) {
//             console.table(`Employee ${first_name} ${last_name} Was updated with the ID: ${createEmployee.insertId}`);
//         }

//         setTimeout((function () {
//             runInquirer();
//         }), 1000);
//     })

// };