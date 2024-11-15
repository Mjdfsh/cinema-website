const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "127.0.0.1",
  user: "root",
  password: "root",
  database: "cinema",
});

function addUser(data) {
  const query = `INSERT INTO users (fname, lname, gender, birth_date, email, nationality, password, phone, english, arabic, french) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    data.fname,
    data.lname,
    data.gender,
    data.birth_date,
    data.email,
    data.nationality,
    data.password,
    data.phone,
    data.english ? 1 : 0,
    data.arabic ? 1 : 0,
    data.french ? 1 : 0,
  ];

  pool.query(query, params, (err, results, fields) => {
    if (err) {
      console.log("Error: ", err);
    }
  });
}

function login(email, password, res) {
  const query = "SELECT * FROM users WHERE email = ? AND password = ?";

  pool.query(query, [email, password], (err, results, fields) => {
    if (err) {
      console.log(err);
    }
    if (results.length > 0) {
      res.cookie("uid", results[0].uid);
      res.redirect("/");
    }
  });
}

function updateUser(data, req, res) {
  const query = `
    UPDATE users
    SET 
        fname = ?,
        lname = ?,
        birth_date = ?,
        email = ?,
        nationality = ?,
        phone = ?
    WHERE uid = ?
  `;

  const params = [
    data.fname,
    data.lname,
    data.birth_date,
    data.email,
    data.nationality,
    data.phone,
    req.cookies.uid,
  ];

  pool.query(query, params, (error, results, fields) => {
    if (error) {
      console.error("Error updating user:", error);
      throw error;
    } else {
      res.redirect("/profile");
    }
  });
}

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting: " + err.stack);
  } else {
    console.log("Connected as id ");
  }
});

function getUser(uid, callback) {
  const query = "SELECT * FROM users WHERE uid = ?";

  pool.query(query, [uid], (err, results, fields) => {
    if (err) {
      console.log("Error: ", err);
    }

    callback(results);
    return results;
  });
}

module.exports = { pool, addUser, updateUser, getUser, login };
