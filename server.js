const express = require("express");
const { connect } =require('./mongodb')
const app = express(); 
app.use(express.json());
connect()

const employeedata = require('./routes/employee');
const companydata = require('./routes/company');

app.use('/api/employee',employeedata);
app.use('/api/company',companydata);

app.listen(process.env.PORT || 3000, () => console.log("server runing on 3000"));

