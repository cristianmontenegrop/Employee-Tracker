const logo = require('asciiart-logo');
const inquirer = require('inquirer');
const CRUD = require('./lib/CRUD');

const addDepartment = () => {
  inquirer.prompt([{
    name: 'department',
    type: 'input',
    message: 'What is the department name you wish to add?',
  }]).then(async ({ department }) => {
    const table = 'department';
    const columns = 'department_name';
    const res = await new CRUD(table, columns, department).create();

    if (res.serverStatus === 2) {
      const dep = 'Department ';
      const wasAdded = ' Was added with the ID: ';
      console.table(dep + department + wasAdded + res.insertId);
    }
    setTimeout((() => runInquirer()), 1000);
  });
};

const addRole = async () => {
  let res = await new CRUD('department', '*', null).read();

  const departmentChoices = res.map(({
    department_id: departmentId,
    department_name: departmentName,
  }) => ({
    name: departmentName,
    value: departmentId,
  }));
  departmentChoices.push({
    name: 'Go back',
    value: -1,
  });

  inquirer.prompt([{
    name: 'role',
    type: 'input',
    message: 'What is the role you wish to add?',
  }, {
    name: 'salary',
    type: 'number',
    message: 'what is the salary this role holds?',
    validate: (input) => {
      if (Number.isNaN(input)) {
        return ('Input must be a valid number');
      }
      return true;
    },
  }, {
    name: 'department_id',
    type: 'list',
    message: 'Which of this department does the role belong to?',
    choices: departmentChoices,

  }]).then(async ({ role, salary, department_id: departmentId }) => {
    const table = 'role';
    const columns = ['title', 'salary', 'department_id'];
    const data = [role, salary, departmentId];
    if (departmentId === -1) {
      return runInquirer();
    }
    res = await new CRUD(table, columns, data).create();
    if (res.serverStatus === 2) {
      console.table(`Role ${role} Was added`);
    }
    setTimeout((() => runInquirer()), 1000);
    return res;
  });
};

const addEmployee = async () => {
  const roleRes = await new CRUD('role', '*', null).read();
  const sql = 'SELECT employee.employee_id, employee.first_name, employee.last_name, role.title, department.department_name FROM ((role INNER JOIN employee ON employee.role_id = role.role_id) INNER JOIN department ON role.department_id = department.department_id) WHERE employee.manager_id IS NULL;';
  const managers = await new CRUD(null, null, sql, true).read();

  const managersChoices = managers.map(({
    employee_id: employeeId,
    first_name: firstName,
    last_name: lastName,
    title,
    department_name: departmentName,
  }) => ({ name: `Name: ${firstName} ${lastName}  Title: ${title}  Department: ${departmentName}`, value: employeeId }));
  const roleChoices = roleRes.map(({ role_id: roleId, title }) => ({ name: title, value: roleId }));

  inquirer.prompt([{
    name: 'firstName',
    type: 'input',
    message: 'What is the Employee\'s First Name?',
  }, {
    name: 'lastName',
    type: 'input',
    message: 'What is the Employee\'s Last Name?',
  }, {
    name: 'roleId',
    type: 'list',
    message: 'Which of this roles does the employee have?',
    choices: roleChoices,
  }, {
    name: 'isManager',
    type: 'confirm',
    message: 'Is this Employee a Manager?',

  }]).then(async ({
    firstName,
    lastName,
    roleId,
    isManager,
  }) => {
    const table = 'employee';
    let columns = ['first_name', 'last_name', 'role_id'];
    let data = [firstName, lastName, roleId];

    if (isManager === false) {
      await inquirer.prompt({
        name: 'whoIsManager',
        type: 'list',
        message: 'Who is your manager?',
        choices: managersChoices,
      }).then(async ({ whoIsManager }) => {
        columns = ['first_name', 'last_name', 'role_id', 'manager_id'];
        data = [firstName, lastName, roleId, whoIsManager];
      });
    }

    const createEmployee = await new CRUD(table, columns, data).create();

    if (createEmployee.serverStatus === 2) {
      console.table(`Employee ${firstName} ${lastName} Was added with the ID: ${createEmployee.insertId}`);
    }
    setTimeout((() => runInquirer()), 1000);
  });
};

const viewAllDepartments = async () => {
  const resDepartments = await new CRUD('department', '*', null).read();
  console.table(resDepartments);
  setTimeout((() => runInquirer()), 1000);
};

const viewAllRoles = async () => {
  const resRoles = await new CRUD('role', '*', null).read();
  console.table(resRoles);
  setTimeout((() => runInquirer()), 1000);
};

const viewAllEmployees = async () => {
  const sql = 'SELECT employee.employee_id, employee.first_name, employee.last_name, role.title, department.department_name, role.salary FROM ((role INNER JOIN employee ON employee.role_id = role.role_id) INNER JOIN department ON role.department_id = department.department_id);'
  const resAllEmployees = await new CRUD(null, null, sql, true).read();
  console.table(resAllEmployees);
  setTimeout((() => runInquirer()), 1000);
};

const removeDepartment = async () => {
  const resDepartment = await new CRUD('department', '*', null).read();
  const departmentChoices = resDepartment.map(({
    department_id: departmentId,
    department_name: departmentName,
  }) => ({ name: departmentName, value: departmentId }));

  departmentChoices.push({
    name: 'Go back',
    value: -1,
  });

  inquirer.prompt([{

    name: 'departmentId',
    type: 'list',
    message: 'Which of this departments would you like to remove?',
    choices: departmentChoices,

  }]).then(async ({ departmentId }) => {
    const table = 'department';
    const columns = 'department_id';
    const data = departmentId;
    if (departmentId === -1) {
      console.table('There was an error, please try a different result');
      return removeDepartment();
    }
    const resDelete = await new CRUD(table, columns, data).delete();
    if (resDelete.serverStatus === 2) {
      let message = null;
      departmentChoices.forEach((element) => {
        if (element.value === data) {
          message = element.name;
        }
      });
      console.table(`Department ${message} Was removed succesfully`);
    }
    setTimeout((() => runInquirer()), 1000);
    return resDelete;
  });
};

const removeEmployee = async () => {
  let search = [];
  inquirer.prompt([{
    name: 'firstName',
    type: 'input',
    message: 'What is the employee\'s first name?',
  }, {
    name: 'lastName',
    type: 'input',
    message: 'What is the employee\'s last name?',
  }]).then(async ({
    firstName,
    lastName,
  }) => {
    const sql = `SELECT employee.employee_id, employee.first_name, employee.last_name, role.title, department.department_name FROM ((role INNER JOIN employee ON employee.role_id = role.role_id) INNER JOIN department ON role.department_id = department.department_id) WHERE (first_name, last_name) = ('${firstName}', '${lastName}');`;
    const resEmployee = await new CRUD(null, null, sql, true).read();
    // console.log(res);
    search = resEmployee.map(({
      employee_id: employeeId,
      first_name: firstNameSearch,
      last_name: lastNameSearch,
      title,
      department_name: departmentName,
    }) => ({
      name: `First name: ${firstNameSearch}  Last name: ${lastNameSearch}  Title: ${title}  Department: ${departmentName}  Employee ID: ${employeeId}`,
      value: employeeId,
    }));
    search.push({
      name: 'Go back',
      value: -1,
    });

    inquirer.prompt([{
      name: 'employeeId',
      type: 'list',
      message: 'Which of this Employees would you like to remove?',
      choices: search,

    }]).then(async ({ employeeId }) => {
      const table = 'employee';
      const columns = 'employee_id';
      const data = employeeId;
      let message;

      if (employeeId === -1) {
        console.table('There was an error, please try again or use a different result');
        return removeEmployee();
      }
      const resDelete = await new CRUD(table, columns, data).delete();
      if (resDelete.serverStatus === 2) {
        message = null;
        search.forEach((element) => {
          if (element.value === data) {
            message = element.name;
          }
        });
        console.table(`Employee ${message} Was removed succesfully`);
      }
      setTimeout((() => runInquirer()), 1000);
      return resDelete;
    });
  });
};

const removeRole = async () => {
  const resRoles = await new CRUD('role', '*', null).read();
  const roleChoices = resRoles.map(({ role_id: roleId, title }) => ({
    name: title,
    value: roleId,
  }));
  roleChoices.push({
    name: 'Go back',
    value: -1,
  });
  inquirer.prompt([{
    name: 'roleId',
    type: 'list',
    message: 'Which of this roles would you like to remove?',
    choices: roleChoices,

  }]).then(async ({ roleId }) => {
    const table = 'role';
    const columns = 'role_id';
    const data = roleId;
    if (roleId === -1) {
      return removeRole();
    }

    const resDelete = await new CRUD(table, columns, data).delete();
    if (resDelete.serverStatus === 2) {
      let message = null;
      roleChoices.forEach((element) => {
        if (element.value === data) {
          message = element.name;
        }
      });
      console.table(`Role ${message} Was removed succesfully`);
    }
    setTimeout((() => runInquirer()), 1000);
    return resDelete;
  });
};

const runInquirer = () => {
  inquirer
    .prompt({
      name: 'action',
      type: 'rawlist',
      message: 'What would you like to do?',
      choices: [
        'Add Department',
        'Add Role',
        'Add Employee',
        'Remove Department',
        'Remove Role',
        'Remove Employee',
        // 'Update Employee Role',
        // 'Update Employee Manager',
        'View All Departments',
        'View All Roles',
        'View All Employees',
        // 'View All Employees by Manager',
        // 'View Total Utilized Budget per Department',
        'I\'m done',
      ],
    })
    .then(async (answer) => {
      switch (answer.action) {
        case 'Add Department':
          addDepartment();
          break;

        case 'Add Role':
          addRole();
          break;

        case 'Add Employee':
          addEmployee();
          break;

        case 'Remove Department':
          removeDepartment();
          break;

        case 'Remove Role':
          removeRole();
          break;

        case 'Remove Employee':
          removeEmployee();
          break;

        // case 'Update Employee Role':
        //   updateEmployeeRole();
        //   break;

          // case 'Update Employee Manager':
          //     updateEmployeeManager();
          //     break;

        case 'View All Departments':
          viewAllDepartments();
          break;

        case 'View All Roles':
          viewAllRoles();
          break;
        case 'View All Employees':
          viewAllEmployees();
          break;

          // case 'View All Employees by Manager':
          //     viewAllEmployeesByManager();
          //     break;

          // case 'View Total Utilized Budget per Department':
          //     viewTotalBudgetPerDepartment();
          //     break;
        case 'I\'m done':
          await new CRUD().end();
          return;

        default: await new CRUD().end();
      }
    });
};

function start() {
  const logotext = logo({
    name: 'Employee Manager',
  }).render();
  console.log(logotext);
  runInquirer();
}
start();

// updateEmployeeManager = async () => {

//     var search = [];
//     await inquirer.prompt([{
//         name: 'first_name',
//         type: 'input',
//         message: 'What is the employee's first name?'
//     }, {
//         name: 'last_name',
//         type: 'input',
//         message: 'What is the employee's last name?'
//     }]).then(async ({
//         first_name,
//         last_name
//     }) => {
//         var sql = `SELECT employee.employee_id, employee.first_name, employee.last_name, role.title, department.department_name FROM ((role INNER JOIN employee ON employee.role_id = role.role_id) INNER JOIN department ON role.department_id = department.department_id) WHERE (first_name, last_name) = ('${first_name}', '${last_name}');`
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
//             name: 'Go back',
//             value: -1
//         });

//         inquirer.prompt([{
//             name: 'employee_id',
//             type: 'list',
//             message: 'Which of this Employee's manager is the one you'd wish to edit',
//             choices: search

//         }]).then(async function ({
//             employee_id
//         }) {

//             // var table = 'employee';
//             // var columns = 'employee_id';
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
//         console.table('Employee ' + message + ' Was removed succesfully');
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

//     var roleRes = await new CRUD('role', '*', null).read();
//     var roleChoices = roleRes.map(({
//         role_id,
//         title
//     }) => ({
//         name: title,
//         value: role_id
//     }));

//     inquirer.prompt([{
//         name: 'first_name',
//         type: 'input',
//         message: 'What is the Employee's First Name?'
//     }, {
//         name: 'last_name',
//         type: 'input',
//         message: 'What is the Employee's Last Name?'
//     }, {
//         name: 'role_id',
//         type: 'list',
//         message: 'Which of this roles does the employee have?',
//         choices: roleChoices
//     }, {
//         name: 'is_manager',
//         type: 'confirm',
//         message: 'Is this Employee a Manager?'

//     }]).then(async function ({
//         first_name,
//         last_name,
//         role_id,
//         is_manager
//     }) {

//         var table = 'employee';
//         var columns = ['first_name', 'last_name', 'role_id'];
//         var data = [first_name, last_name, role_id];

//         if (is_manager === false) {
//             await inquirer.prompt({
//                 name: 'who_is_manager',
//                 type: 'list',
//                 message: 'Who is your manager?',
//                 choices: managersChoices
//             }).then(async function ({
//                 who_is_manager
//             }) {
//                 columns = ['first_name', 'last_name', 'role_id', 'manager_id'];
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