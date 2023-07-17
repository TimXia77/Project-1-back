
//Requires: 
const fs = require("fs");
const bcrypt = require("bcrypt");

/*
    Function:       readUsers
    Purpose:        Returns an array of all users {email, username, password, role}
    Middleware:     NO
*/
function readUsers() {
    let data = fs.readFileSync('../data/accounts.txt', 'utf8');
    return JSON.parse(`[${data}]`);
}

/*
    Function:       readTable
    Purpose:        Returns an array of objects. Each object contains the data for one pendrive.
    Middleware:     NO
*/
function readTable(){
    let data = fs.readFileSync('../data/table.txt', 'utf8');
    return JSON.parse(data);
}

/*
    Function:       findUser
    Purpose:        Takes a username and password and checks if the user exists
    Middleware:     NO
    in:             username to find
    in:             password to find
*/
function findUser(targetUsername, targetPassword) {
    const targetUser = readUsers().find(user => user.username === targetUsername);

    if (!(targetUser == null)){
        if (bcrypt.compareSync(targetPassword, targetUser.password)){
            return true;
        }
    } 

    return false;
}

/*
    Function:       findUser
    Purpose:        Takes a username, password, and email and adds a user with role "basic"
    Middleware:     NO
    in:             email to add
    in:             username to add
    in:             password to add
*/
async function addUser(newEmail, newUsername, newPassword) {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10); //hashing salt is saved with the hashed password automatically
        const newUser = JSON.stringify({ email: newEmail, username: newUsername, password: hashedPassword, role: "basic" });

        if (fs.readFileSync('../data/accounts.txt', 'utf8').trim() == "") { //if first account added
            fs.appendFile("../data/accounts.txt", newUser, err => {
                if (err) {
                    console.err;
                    return true;
                }
            });

        } else {
            let modifiedData = ", " + newUser;
            fs.appendFile("../data/accounts.txt", modifiedData, err => {
                if (err) {
                    console.err;
                    return true;
                }
            });

        }
    } catch {
        return false;
    }
    
}

/*
    Function:       writeData
    Purpose:        writes the dataString to the accounts.txt. This function is 'PRIVATE'.
    Middleware:     NO
    in:             string to write
*/
function writeData(dataString) { 
    fs.writeFile("../data/accounts.txt", dataString, err => {
        if (err) {
            console.error(err);
            console.log("error occured when updating login textfile");
            return;
        }
    });
}

/*
    Function:       deleteUser
    Purpose:        deletes user with given username. If not found, nothing is deleted.
    Middleware:     NO
    in:             target user's username
*/
function deleteUser(targetUsername) {
    let accounts = readUsers();
    for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].username === targetUsername) {
            accounts.splice(i, 1);
            const newAccounts = JSON.stringify(accounts).substring(1, JSON.stringify(accounts).length - 1);
            writeData(newAccounts);
            return true;
        }
    }
    return false;
}


// function clearData() { //helper
//     fs.writeFile("../data/accounts.txt", '', err => {
//         if (err) {
//             console.error(err);
//             console.log("error occured when clearing login textfile");
//             return;
//         }
//     });
// }

module.exports = {
    addUser,
    findUser,
    readUsers,
    readTable,
    deleteUser
};