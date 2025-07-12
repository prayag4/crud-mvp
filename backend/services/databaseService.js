const fs =require('fs');
const path = require('path')

const DB_FILE = path.join(__dirname,'../data/database.json');

//here query will come if it is sql db. data base services functions
function readDatabase(){
    const data = fs.readFileSync(DB_FILE,'utf-8');
    return JSON.parse(data);
}


function writeDatabase(data){
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readDatabase, writeDatabase };
