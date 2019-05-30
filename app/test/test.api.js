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
        {
        "report":
        {
        "userid":"flairadmin",
        "dashboard_name":"First Dashboard",
        "view_name": "Ecom View",
        "share_link": "http://localhost:8002/#", 
        "mail_body":"This is a test email to check api functionality", 
        "subject":"Report : Clustered Vertical Bar Chart : Sun Mar 17 21:14:03 IST 2019", 
        "report_name":"report_x3", 
        "title_name":"Clustered Vertical Bar Chart"
        },
         "report_line_item":
         {
         "dimension":["State"],
         "measure":[ "Price","Quantity"],  
         "visualization":"Pie Chart",
         "visualizationid":"xyz",
         }, 
         "query":`{
          "queryId": "603f5cd13d33141e3e31395a2b002ba7--461d64be-f618-4e6e-8a9f-93e817be76fb",
          "userId": "flairadmin",
          "sourceId": "1715917d-fff8-44a1-af02-ee2cd41a3609",
          "source": "Transactions",
          "fields": ["State", "COUNT(Price) as Price"],
          "groupBy": ["State"],
          "limit": "20"
        }`,
         "assign_report":{
         "channel": "email",
         "slack_API_Token":"null", 
         "channel_id":"null", 
         "stride_API_Token":"null", 
         "stride_cloud_id":"null", 
         "stride_conversation_id":"null",  
         "email_list":[{"user_email":"impiyush111@gmail.com", "user_name":"Johib"}]
         }, 
         "schedule":{
          "cron_exp":"* * * * *",  
          "timezone":"Africa/Abidjan",
          "start_date":"2019-03-27 00:00",
           "end_date":"2039-03-28"
          }
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

