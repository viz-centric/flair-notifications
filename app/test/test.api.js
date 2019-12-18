process.env.NODE_ENV = 'test';

chai = require('chai');
var expect = chai.expect();
var should = chai.should();
var app = require('./test.app');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('/api/jobSchedule/', () => {
    it('shedual a jab', (done) => {
        let report =
        {
            "report":
            {
                "userid": "flairadmin",
                "dashboard_name": "Ecommerce",
                "view_name": "test view",
                "share_link": "http://localhost:8002/#",
                "build_url": "http://localhost:8002/#",
                "mail_body": "This is a test email to check api functionality",
                "subject": "Report : Clustered Vertical Bar Chart : Sun Mar 17 21:14:03 IST 2019",
                "report_name": "report_x3",
                "title_name": "Clustered Vertical Bar Chart",
                "thresholdAlert": false
            },
            "report_line_item":
            {
                "dimension": ["order_status"],
                "measure": ["order_item_quantity", "order_item_subtotal"],
                "visualization": "Clustered Vertical Bar Chart",
                "visualizationid": "1135ba145382e82058b3e9e0e2000346--7610e66b-e88a-4897-951f-7da22b1d79e0"
            },
            "query": `{
          "queryId": "1135ba145382e82058b3e9e0e2000346--7610e66b-e88a-4897-951f-7da22b1d79e0",
          "userId": "flairadmin",
          "sourceId": "1715917d-fff8-44a1-af02-ee2cd41a3609",
          "source": "Ecommerce",
          "fields": ["order_status",
           "COUNT(order_item_quantity) as order_item_quantity",
           "COUNT(order_item_subtotal) as order_item_subtotal"],
          "groupBy": ["order_status"],
          "limit": "20"
        }`,
            "assign_report": {
                "channel": ["email","team"],
                "slack_API_Token": "null",
                "channel_id": "null",
                "stride_API_Token": "null",
                "stride_cloud_id": "null",
                "stride_conversation_id": "null",
                "communication_list": {
                    "email": [
                        { "user_email": "khushbum.wa@gmail.com", "user_name": "khushbu" }
                    ],
                    "teams": {
                        "webhook": "www.google.com"
                    }
                }

            },
            "schedule": {
                "cron_exp": "* * * * *",
                "timezone": "Africa/Abidjan",
                "start_date": "2019-03-27 00:00",
                "end_date": "2039-03-28"
            }
        }

        chai.request(app)
            .post('/api/jobSchedule')
            .send(report)
            .end((err, res) => {
                console.log(res.body);
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('message');
                done();
            });
    });

});



// describe('/api/executeImmediate/', () => {
//     it('execute Immediate  jab', (done) => {



//         chai.request(app)
//             .get('/api/executeImmediate')
//             .query({ visualizationid: 'caf8fe78085dacb80d969164550004bf--391ce147-082f-44f4-a07e-80d141bd8d64' })
//             .end((err, res) => {
//                 console.log(res.body);
//                 res.should.have.status(201);
//                 res.body.should.be.a('object');
//                 res.body.should.have.property('message');
//                 done();
//             });
//     });

// });

