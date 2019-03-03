process.env.NODE_ENV = 'test';

chai=require('chai');
var expect  = chai.expect();
var should =chai.should();
var app= require('./test.app');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('/api/jobSchedule/', () => {
    it('shedual a jab', (done) => {
        let report = {
          "userid":"testuser",
          "cron_exp":"* * * * *",
          "report": {
            "connection_name": "Postgres-connection",
            "mail_body": "This is a test email to check api functionality",
            "subject": "API Testing",
            "report_name": "report_x3",
            "source_id":"1715917d-fff8-44a1-af02-ee2cd41a3609",
            "title_name":"Clustered Vertical Bar Chart"
          },
          "report_line_item": {
            "query_name": "test query",
            "fields": ["state","price"],
            "group_by": ["col1"],
            "order_by": [],
            "where": "",
            "limit": 5,
            "table": "Transactions",
            "visualization": "pie"
          },
          "assign_report": {
            "channel": "email",
            "slack_API_Token":"xoxp-338558815156-339648235094-401148640099-d844d7552f5b0081546729d997e92f52",
            "channel_id":"C9ZK2705U",
            "stride_API_Token":"uEkHqU5s2tsF6H13zK3p",
            "stride_cloud_id":"13f8bfc9-8748-4008-8b11-71f22aa84126",
            "stride_conversation_id":"ff15d817-3ab3-417d-8ba6-2490b330a35f",
            "email_list":["piyushrajmani@gmail.com"],
            "condition": "test"
          },
          "schedule": {
            "timezone": "Asia/Kolkata",
            "start_date":"2019-02-04 08:25:00",
            "end_date":"2029-12-15 12:50:00"
            }
        }
      chai.request(app)
          .post('/api/jobSchedule')
          .send(report)
          .end((err, res) => {
            console.log(res.body)
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success');
                res.body.should.have.property('message');
            done();
          });
    });

});

