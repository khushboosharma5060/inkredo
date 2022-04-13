const express = require("express");
const { connect } =require('./mongodb')
const app = express(); 
app.use(express.json());
const port = 3000;
connect()

const employeedata = require('./routes/employee');
const companydata = require('./routes/company');

app.use('/api/employee',employeedata);
app.use('/api/company',companydata);

app.listen(port, () => console.log("server runing on 3000"));

