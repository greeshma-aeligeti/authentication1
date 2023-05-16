const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt= require('bcrypt')
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    book
  ORDER BY
    book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

app.post('/users/', async (request,response)=>{
   try{
    const  {username,name,password,gender,location}=request.body;

    const hashedPassword=await bcrypt.hash(password,15);
    
   const selectUserQuery=`select * from user where username='${username}';`
   const dbUser=await db.get(selectUserQuery);
   console.log(dbUser)
   if(dbUser === undefined){
    
     const insertQuery=`
        insert into user(username,name,password,gender,location) values(
            '${username}','${name}','${hashedPassword}','${gender}','${location}'
        );
        `;
       
      await db.run(insertQuery);
        response.send("User created Successfully");

        
   }
   else{
       response.status(400);
        response.send("User exists");
   }}
   
   catch(e){
       console.log(e.message)
   }
  
})

app.post('/login/', async (request,response)=>{
const {username,password}=request.body;
   const selectUserQuery=`select * from user where username='${username}';`
   const dbUser=await db.get(selectUserQuery);
if(dbUser=== undefined){
    //user doesn't exixts
response.status(400);
    
response.send("Invalid user")}
else{
    const isPassMatch=await bcrypt.compare(password,dbUser.password);
    if(isPassMatch===true){
response.send("Login success")        
    }
    else{
        response.send("Password incorrect!!");
    }
}
    
})