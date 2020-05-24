var CRUD = require("./lib/CRUD");
// const Department = require("./lib/Department");
// const Employee = require("./lib/Employee");
// const Role = require("./lib/Role");
// require("dotenv").config();
// var mysql = require("mysql");
var inquirer = require("inquirer");
var table = require("console.table");

// var pool = mysql.createPool({
//     host: "localhost",
//     port: 3306,
//     user: "root",
//     password: process.env.MYSQL_PASSWORD,
//     database: "employee_trackerDB"
// });

// var connection = mysql.createConnection({

//     host: "localhost",
//     port: 3306,
//     user: "root",
//     password: process.env.MYSQL_PASSWORD,
//     database: "employee_trackerDB"
// });

// connection.connect(function (err) {
//     if (err) throw err;
//     runInquirer();

// });


// getConnection: (callback) => {
//     return pool.getConnection(callback);
// }



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
        .then(function (answer) {
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

                    // case "Remove Employee":
                    //     removeEmployee();
                    //     break;

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
                    connection.end();
                    break;

            }
        });
}


addDepartment = () => {

    inquirer.prompt([{
        name: "department",
        type: "input",
        message: "What is the department name you wish to add?"
    }]).then(function (answer) {
        var table = "department";
        var columns = "department_name";

        new CRUD(table, columns, answer.department, function (res) {
            console.table(res);
            runInquirer();
        }).create();
    });
};

addRole = () => {

    new CRUD("department", "*", null, function (resp) {

        const departmentChoices = resp.map(({
            department_id,
            department_name
        }) => ({
            name: department_name,
            value: department_id
        }));
        console.log(departmentChoices)
        inquirer.prompt([{
            name: "role",
            type: "input",
            message: "What is the role you wish to add?"
        }, {
            name: "salary",
            type: 'number',
            message: "what is the salary this role holds?",
            // validate: async (input) => {
            //     if (input !== NaN) {
            //         return ("Input must be a valid number");
            //     }
            //     return true;
            // }
        }, {
            name: "department_id",
            type: "list",
            message: "Which of this department does the role belong to?",
            choices: departmentChoices

        }]).then(function ({
            role,
            salary,
            department_id
        }) {
            var table = "role";
            var columns = ["title", "salary", "department_id"];
            var data = [role, salary, department_id]

            new CRUD(table, columns, data, function (res) {
                console.table(res);
                runInquirer();
            }).create();
        })

    }).read();
};
addEmployee = () => {

    inquirer.prompt([{
        name: "employee",
        type: "input",
        message: "What is the Employee Name you wish to add?"
    }]).then(function (answer) {
        var table = "role";
        var columns = "title";

        new CRUD(table, columns, answer.role, function (res) {
            console.table(res);
            runInquirer();
        }).create();
    });
};

viewAllDepartments = () => {
    new CRUD("department", "*", null, function (res) {
        console.log(res);
        console.table(res);
        runInquirer();

    }).read();
};


removeDepartment = () => {
    new Department().readDepartment().then(function (err, res) {
        console.log(res);

        // inquirer.prompt([{
        //     name: "department",
        //     type: "list",
        //     message: "What is the department name you wish to delete?",
        //     choices: res.map(function (list) {
        //         return list
        //     })
        // }]).then(function (answer) {

        //     new Department(answer.department, ).deleteDepartment().then(runInquirer());
        // });
    })
};

function artistSearch() {
    inquirer
        .prompt({
            name: "artist",
            type: "input",
            message: "What artist would you like to search for?"
        })
        .then(function (answer) {
            var query = "SELECT position, song, year FROM top5000 WHERE ?";
            connection.query(query, {
                artist: answer.artist
            }, function (err, res) {
                for (var i = 0; i < res.length; i++) {
                    console.log("Position: " + res[i].position + " || Song: " + res[i].song + " || Year: " + res[i].year);
                }
                runSearch();
            });
        });
}

function multiSearch() {
    var query = "SELECT artist FROM top5000 GROUP BY artist HAVING count(*) > 1";
    connection.query(query, function (err, res) {
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].artist);
        }
        runSearch();
    });
}

function rangeSearch() {
    inquirer
        .prompt([{
                name: "start",
                type: "input",
                message: "Enter starting position: ",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "end",
                type: "input",
                message: "Enter ending position: ",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
        .then(function (answer) {
            var query = "SELECT position,song,artist,year FROM top5000 WHERE position BETWEEN ? AND ?";
            connection.query(query, [answer.start, answer.end], function (err, res) {
                for (var i = 0; i < res.length; i++) {
                    console.log(
                        "Position: " +
                        res[i].position +
                        " || Song: " +
                        res[i].song +
                        " || Artist: " +
                        res[i].artist +
                        " || Year: " +
                        res[i].year
                    );
                }
                runSearch();
            });
        });
}

function songSearch() {
    inquirer
        .prompt({
            name: "song",
            type: "input",
            message: "What song would you like to look for?"
        })
        .then(function (answer) {
            console.log(answer.song);
            connection.query("SELECT * FROM top5000 WHERE ?", {
                song: answer.song
            }, function (err, res) {
                console.log(
                    "Position: " +
                    res[0].position +
                    " || Song: " +
                    res[0].song +
                    " || Artist: " +
                    res[0].artist +
                    " || Year: " +
                    res[0].year
                );
                runSearch();
            });
        });
}

function songAndAlbumSearch() {
    inquirer
        .prompt({
            name: "artist",
            type: "input",
            message: "What artist would you like to search for?"
        })
        .then(function (answer) {
            var query = "SELECT top_albums.year, top_albums.album, top_albums.position, top5000.song, top5000.artist ";
            query += "FROM top_albums INNER JOIN top5000 ON (top_albums.artist = top5000.artist AND top_albums.year ";
            query += "= top5000.year) WHERE (top_albums.artist = ? AND top5000.artist = ?) ORDER BY top_albums.year, top_albums.position";

            connection.query(query, [answer.artist, answer.artist], function (err, res) {
                console.log(res.length + " matches found!");
                for (var i = 0; i < res.length; i++) {
                    console.log(
                        i + 1 + ".) " +
                        "Year: " +
                        res[i].year +
                        " Album Position: " +
                        res[i].position +
                        " || Artist: " +
                        res[i].artist +
                        " || Song: " +
                        res[i].song +
                        " || Album: " +
                        res[i].album
                    );
                }

                runSearch();
            });
        });
}
module.exports.runInquirer = runInquirer;
// module.exports = runInquirer;