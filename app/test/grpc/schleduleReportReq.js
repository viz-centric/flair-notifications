const payload = {
    report: {
        userid: "flairadmin",
        dashboard_name: "Ecommerce",
        view_name: "Ecom View",
        share_link: "http://localhost:8002/",
        build_url: "http://localhost:8002/",
        mail_body: "This is a test email to check api functionality",
        subject: "Report : Pie Chart : Tue May 14 08:55:04 IST 2019",
        report_name: "Pie-Chart-f896fbc01af901edec520880b30018f5--47b5f320-bebe-4da2-884e-6c304e4bc11e",
        title_name: "Pie Chart"
    },
    report_line_item: {
        visualizationid: "6b6439ed7bc10719a8cab6427b0009af--62038af8-4834-457c-8786-724a4982aea0",
        dimension: [
            "order_item_id"
        ],
        measure: [
            "product_price"
        ],
        visualization: "Pie Chart"
    },
    assign_report: {
        channel: "email",
        slack_API_Token: null,
        channel_id: null,
        stride_API_Token: null,
        stride_cloud_id: null,
        stride_conversation_id: null,
        email_list: [
            {
                user_email: "flairadmin@localhost",
                user_name: "Administrator Administrator"
            }
        ]
    },
    schedule: {
        cron_exp: "*/4 * * * *",
        timezone: "",
        start_date: "2019-05-12T18:30:00.000Z",
        end_date: "2020-05-25T18:30:00.000Z"
    },
    query: "{\"queryId\":\"f896fbc01af901edec520880b30018f5--47b5f320-bebe-4da2-884e-6c304e4bc11e\",\"userId\":\"flairadmin\",\"sourceId\":\"1715917d-fff8-44a1-af02-ee2cd41a3609\",\"source\":\"Ecommerce\",\"fields\":[\"order_item_id\",\"COUNT(product_price) as product_price\"],\"groupBy\":[\"order_item_id\"],\"limit\":\"20\",\"conditionExpressions\":[{\"sourceType\":\"FILTER\",\"expressionType\":\"CONTAINS\",\"conditionExpression\":\"{\\\"values\\\":[\\\"1\\\",\\\"2\\\",\\\"3\\\",\\\"4\\\",\\\"5\\\",\\\"6\\\",\\\"7\\\"],\\\"featureName\\\":\\\"order_item_id\\\",\\\"uuid\\\":\\\"a7d48606-6665-49bf-bc51-be217f4250ef\\\"}\",\"andOrExpressionType\":{}}]}"
};


module.exports = payload;
