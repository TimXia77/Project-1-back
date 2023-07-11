
const fs = require("fs");
const bcrypt = require("bcrypt");

function readUsers() {
    let data = fs.readFileSync('../data/accounts.txt', 'utf8');
    return JSON.parse(`[${data}]`);
}

function readTable(){
    let data = fs.readFileSync('../data/table.txt', 'utf8');
    return JSON.parse(data);
}

function findUser(targetUsername, targetPassword) {
    const targetUser = readUsers().find(user => user.username === targetUsername);

    if (!(targetUser == null)){
        if (bcrypt.compareSync(targetPassword, targetUser.password)){
            return true;
        }
    } 

    return false;
}

async function addUser(newEmail, newUsername, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10); //hashing salt is saved with the hashed password automatically
    const newUser = JSON.stringify({ email: newEmail, username: newUsername, password: hashedPassword, role: "basic" });

    if (fs.readFileSync('../data/accounts.txt', 'utf8').trim() == "") { //if first account added
        fs.appendFile("../data/accounts.txt", newUser, err => {
            if (err) {
                console.err;
                return;
            }
        });

    } else {
        let modifiedData = ", " + newUser;
        fs.appendFile("../data/accounts.txt", modifiedData, err => {
            if (err) {
                console.err;
                return;
            }
        });

    }
}

function writeData(dataString) { //helper
    fs.writeFile("../data/accounts.txt", dataString, err => {
        if (err) {
            console.error(err);
            console.log("error occured when updating login textfile");
            return;
        }
    });
}

function deleteUser(targetUsername) {
    let accounts = readUsers();
    for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].username === targetUsername) {
            accounts.splice(i, 1);
            const newAccounts = JSON.stringify(accounts).substring(1, JSON.stringify(accounts).length - 1);
            writeData(newAccounts);
            return;
        }
    }
    //tried to deleted a user that doesn't exist
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