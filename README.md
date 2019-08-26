[![Build Status](https://dev.azure.com/VizCentric/Flair%20BI/_apis/build/status/viz-centric.flair-notifications?branchName=master)](https://dev.azure.com/VizCentric/Flair%20BI/_build/latest?definitionId=6&branchName=master)

# Flair-Reporting-Engine

Application expose an api to schedule a job in cron fashion.
At scheduled time, it will call grpc server and get data, render chart of that data. Type of chart depend on the request body. After that it will create a image of that chart and store in file system and then send mail to user defined in request body including that image inside html.

**api end point:**
```sh
curl http://localhost:8080/api/jobSchedule/
```

**request body:**
```json
{
            "userid":"testuser",
            "cron_exp":"* * * * *",
            "report": {
              "connection_name": "Postgres-connection",
              "mail_body": "This is a test email to check api functionality",
              "subject": "API Testing",
              "report_name": "report_x8",
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
              "slack_API_Token":"xxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxxxxxxx",
              "channel_id":"C9ZK2705U",
              "stride_API_Token":"xxxxxx-xxxxxx",
              "stride_cloud_id":"xxxxxxxxx",
              "stride_conversation_id":"xxxxxxxxxxxxx",
              "email_list":["example@gmail.com"],
              "condition": "test"
            },
            "schedule": {
              "timezone": "Asia/Kolkata",
              "start_date":"2019-02-04 08:25:00",
              "end_date":"2019-02-15 12:50:00"
              }
          }
```

#Getting started
Requirements:
* NodeJS
* NPM
* Docker



Clone the repository with command
```bash
git clone https://github.com/viz-centric/flair-notifications.git
```
Navigate to directory
```bash
cd  flair-notifications
```
Install dependencies
```bash
npm i
```
Start the database
```bash
cd deploy
docker-compose up -d
cd ..
npx sequelize-cli db:migrate
```
Start the Server
```bash
npm start
```

## Enabling SSL
To enable SSL between flair notifications and flair bi, please follow the guide below.

### Enable SSL between flair notifications and flair bi 
To generate SSL certs, run this command:

```bash
cd certs
./generate.sh

```

Make sure you open that bash file and check `SERVER_CN` and `CLIENT_CN` variables there. If you plan to run in docker environment, then keep
these values as is. If you plan to deploy to a real production environment, then change these values to contain real hostnames of the services.

After that, copy the whole contents from `certs/*` to flair-bi projects to the same location
```bash
cp certs ../flair-bi/src/main/resources/ssl/notificationscertsgen
```