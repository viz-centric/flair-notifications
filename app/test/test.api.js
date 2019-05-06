process.env.NODE_ENV = 'test';

chai=require('chai');
var expect  = chai.expect();
var should =chai.should();
var app= require('./test.app');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('/api/jobSchedule/', () => {
    it('shedual a jab', (done) => {
        let report = 
        {"userid":"flairadmin",
         "cron_exp":"* * * * *", 
         "visualizationid":"xyz",
        "report":
        {
        "connection_name":"Transactions", 
        "mail_body":"This is a test email to check api functionality", 
        "subject":"Report : Clustered Vertical Bar Chart : Sun Mar 17 21:14:03 IST 2019", 
        "report_name":"report_x3", "source_id":"1715917d-fff8-44a1-af02-ee2cd41a3609", 
        "title_name":"Clustered Vertical Bar Chart"
        },
         "report_line_item":
         {
         "query_name":"flairadmin:90497569e61f113349fb082eb9000341--45d994f6-acad-4103-a87b-b7bf9fbc6c2a:1715917d-fff8-44a1-af02-ee2cd41a360", 
         "dimension":["State"],
         "measure":[ "Price","Quantity"], 
         "group_by":["State"], 
         "order_by":[], 
         "where":"null", 
         "limit":"5", 
         "table":"Transactions", 
         "visualization":"Pie Chart"
         }, 
         "assign_report":{
         "channel": "email",
         "slack_API_Token":"null", 
         "channel_id":"null", 
         "stride_API_Token":"null", 
         "stride_cloud_id":"null", 
         "stride_conversation_id":"null", 
         "condition":"test", 
         "email_list":[{"user_email":"impiyush111@gmail.com", "user_name":"Johib"}]
         }, 
         "schedule":{"timezone":"Africa/Abidjan",
          "start_date":"2019-03-27 00:00",
           "end_date":"2039-03-28"}
         }
        
      chai.request(app)
          .post('/api/jobSchedule')
          .send(report)
          .end((err, res) => {
            console.log(res.body)
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('message');
            done();
          });
    });

});

