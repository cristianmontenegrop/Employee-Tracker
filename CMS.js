const logo = require('asciiart-logo');
const inquirer = require('inquirer');
const CRUD = require('./lib/CRUD');

const addDepartment = async () => {
  const resDepartments = await new CRUD('department', '*', null).read();
  console.table(resDepartments);
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
  const roleSql = 'SELECT role.role_id, role.department_id, role.title, role.salary, department.department_name FROM department INNER JOIN role ON department.department_id = role.department_id';
  const resRoles = await new CRUD(null, null, roleSql, true).read();
  console.table(resRoles);
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
  const managersRes = await new CRUD(null, null, sql, true).read();

  const managersChoices = managersRes.map(({
    employee_id: employeeId,
    first_name: firstName,
    last_name: lastName,
    title,
    department_name: departmentName,
  }) => ({ name: `Name: ${firstName} ${lastName}  Title: ${title}  Department: ${departmentName}`, value: employeeId }));

  const roleChoices = roleRes.map(({ role_id: roleId, title }) => ({ name: title, value: roleId }));
  roleChoices.push({
    name: 'Go back',
    value: -1,
  });

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
    firstName, lastName, roleId, isManager,
  }) => {
    const table = 'employee';
    let columns = ['first_name', 'last_name', 'role_id'];
    let data = [firstName, lastName, roleId];

    if (roleId === -1) {
      return runInquirer();
    }

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

    return createEmployee;
  });
};

const viewAllDepartments = async () => {
  const resDepartments = await new CRUD('department', '*', null).read();
  console.table(resDepartments);
  setTimeout((() => runInquirer()), 1000);
};

const viewAllRoles = async () => {
  const roleSql = 'SELECT role.role_id, role.department_id, role.title, role.salary, department.department_name FROM department INNER JOIN role ON department.department_id = role.department_id';
  const resRoles = await new CRUD(null, null, roleSql, true).read();
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
const updateEmployeeManager = async () => {
  let selectedEmployeeId;
  let employeesManager = {
    id: Number, firstName: String, lastName: String, department: String, title: String,
  };

  await inquirer.prompt([{
    name: 'firstName',
    type: 'input',
    message: 'What is the employee\'s first name?',
  }, {
    name: 'lastName',
    type: 'input',
    message: 'What is the employee\'s last name?',
  }]).then(async ({ firstName, lastName }) => {
    const sql = `SELECT employee.employee_id, employee.manager_id, employee.first_name, employee.last_name, role.title, department.department_name FROM ((role INNER JOIN employee ON employee.role_id = role.role_id) INNER JOIN department ON role.department_id = department.department_id) WHERE (first_name, last_name) = ('${firstName}', '${lastName}');`;
    const resEmployee = await new CRUD(null, null, sql, true).read();

    const employeeSearch = resEmployee.map(({
      employee_id: employeeId,
      first_name: firstNameRes,
      last_name: lastNameRes,
      title,
      department_name: departmentNameRes,
    }) => ({
      name: `First name: ${firstNameRes}  Last name: ${lastNameRes}  Title: ${title}  Department: ${departmentNameRes}  Employee ID: ${employeeId}`,
      value: employeeId,
    }));
    employeeSearch.push({
      name: 'Go back',
      value: -1,
    });

    await inquirer.prompt([{
      name: 'selEmployeeId',
      type: 'list',
      message: 'Which of this Employee\'s is the one you\'d wish to edit',
      choices: employeeSearch,

    }]).then(async ({ selEmployeeId }) => {
      if (selEmployeeId === -1) {
        return runInquirer();
      }

      selectedEmployeeId = selEmployeeId;

      // Finding employee's Manager
      const sqlM = 'SELECT employee.employee_id, employee.manager_id, employee.first_name, employee.last_name, role.title, department.department_name FROM ((role INNER JOIN employee ON employee.role_id = role.role_id) INNER JOIN department ON role.department_id = department.department_id);';
      const resEmployeeM = await new CRUD(null, null, sqlM, true).read();

      for (let i = 0; i < resEmployeeM.length; i += 1) {
        if (resEmployeeM[i].employee_id === selEmployeeId) {
          const managerId = resEmployeeM[i].manager_id;
          console.log('employees manager id: ', managerId);
          employeesManager = {
            id: managerId,
          };
          break;
        }
      }
      for (let i = 0; i < resEmployeeM.length; i += 1) {
        if (resEmployeeM[i].employee_id === employeesManager.id) {
          employeesManager = {
            firstName: resEmployeeM[i].first_name,
            lastName: resEmployeeM[i].last_name,
            department: resEmployeeM[i].department_name,
            title: resEmployeeM[i].title,
          };
          break;
        }
      }
      console.log('employees manager info: ', employeesManager);
      const sqlManagers = 'SELECT employee.employee_id, employee.first_name, employee.last_name, role.title, department.department_name FROM ((role INNER JOIN employee ON employee.role_id = role.role_id) INNER JOIN department ON role.department_id = department.department_id) WHERE employee.manager_id IS NULL;';
      const managersRes = await new CRUD(null, null, sqlManagers, true).read();

      const managersOptions = managersRes.map(({
        employee_id: managerId,
        first_name: firstManName,
        last_name: lastManName,
        title,
        department_name: departmentName,
      }) => ({
        name: `Name: ${firstManName} ${lastManName}  Title: ${title}  Department: ${departmentName} `,
        value: managerId,
      }));

      await inquirer.prompt([{
        name: 'managerSelection',
        type: 'list',
        message: `Please select new Manager, Current Manager is: Name: ${employeesManager.firstName} ${employeesManager.lastName}, Department: ${employeesManager.department}, Title: ${employeesManager.title}`,
        choices: managersOptions,
      }]).then(async ({ managerSelection }) => {
        const mgrSqlUpdate = `UPDATE employee SET manager_id = ${managerSelection} WHERE employee_id = ${selectedEmployeeId}`;

        const resManagerUpdate = await new CRUD(null, null, mgrSqlUpdate, true).update();
        if (resManagerUpdate.serverStatus === 2) {
          console.log('Operation Succesfull');
        } else {
          console.log('There was an error!');
        }
        setTimeout((() => runInquirer()), 1000);
      });
      return 'hello';
    });
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
        'Update Employee Manager',
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

        case 'Update Employee Manager':
          updateEmployeeManager();
          break;

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

const start = () => {
  const logotext = logo({
    name: 'Employee Manager',
  }).render();
  console.log(logotext);
  runInquirer();
};
start();
