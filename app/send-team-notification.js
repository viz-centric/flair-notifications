const nodemailer = require('nodemailer');
const ejs = require("ejs");
const AppConfig = require('./load_config');
const axios = require('axios')

const appLogo = 'flairbi-logo.png';
let transporter;
let config;



let WebhookURL = 'https://outlook.office.com/webhook/f79eb495-6984-4ca3-bf67-5357e4f9edd5@2c081cf3-e47d-4c70-a618-68662c113c38/IncomingWebhook/b7fc7559a6b34d87b1a05d26d1a830b8/90ac3273-dc32-484d-ba49-b6ea1b4fcd4f';
let base64 = '';
let _config = {
    headers: {
        "Content-Type": "application/xml",
        "Content-Length": base64.length.toString()
    }
}

config = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    "themeColor": "0076D7",
    "text": "![Alt text for the image](https://lh3.googleusercontent.com/QCaTUJjRbD00fwTwcrFCEtF9nJOvPd5FlC4skeBbgoq0WwiP-Q3DCXNHhOS0fbHGX9OJf_1ULetoj2AMqtlw3gBJ8Cx7HEoLAjc7yFtYBAeWEHIwCYpK9zOvpgwiXM8XAmGJLT8FMmMWRspkXIJVTS2XIcYs5L2cpd8wfLSvsrYwiuLhENc_gjHhBKPgD6g-ecWpWjc6o04dhWpEO08gVGGhUZ4MvgldTb1NKHislqmcv18FUcVxX8CufKiUDnpPohAUEnoAFFDjy6dcqc7eWAtV5gFp89c9re1bHXUdniQW0TDo1uSnEmo532QlqhCorGY-jrGRFeFKjUqa19kHi_EGuRDyrPTlYwpAOEorfdFzpaTI3H6fqRnPldXcqfhG-zB6_27GZKj_40jVdmowZ4GKFnwWWlZzg_ssdp5_BgOh0JonkZTJWvW4vH4AjKb0fzfxZRD_zK76A9IiD3i0ugFxz0xnInSd8DpRFVAc8snb-jPWonVmugSekDbx7xPiEjPUGMg6AgvrnuOebX2rXqzXKAKZ6nVlco_5fqSzh-fuoO1N93hJFffaB-SQa9-jU1l_ovnMNPduzGrmAh8yKAvihpoMS299km6k-3hBibYwq5GOAnMi1kmqVrbHBDN-P7NuJ1BTbxK4qlKXiwdlzJ9JM7c6w2uZgGTPr4G3lZoyZEnWaHm25J_ZwKIGGQ=w1315-h669-ft)",
    "title": "Clustered Vertical Bar Chart",
    "summary": "Larry Bryant created a new task",
    "sections": [{
        "facts": [{
            "name": "Deshboaed: ",
            "value": "Order Summery"
        }, {
            "name": "View",
            "value": "Order View"
        }],
        "activitySubtitle": "Larry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new task",
        "markdown": true
    }],
    "potentialAction": [
        {
            "@type": "OpenUri",
            "name": "Goto View",
            "targets": [
                { "os": "default", "uri": "https://docs.microsoft.com/outlook/actionable-messages" }
            ]
        },
        {
            "@type": "OpenUri",
            "name": "Goto Deashboard",
            "targets": [
                { "os": "default", "uri": "https://docs.microsoft.com/outlook/actionable-messages" }
            ]
        }
    ]
}


exports.sendTeamNotification = function sendNotification(subject, webhookURL, mail_body, report_title, share_link, build_url, dash_board, view_name, encodedUrl, imagefilename, chartHtml, chartType) {
    var image_cid = new Date().getTime() + imagefilename;

    config.title = report_title;
    config.sections[0].facts[0].value = dash_board;
    config.sections[0].facts[1].value = view_name;
    config.sections[0].activitySubtitle = mail_body;
    config.potentialAction[0].targets[0].uri = build_url;
    config.potentialAction[1].targets[0].uri = share_link;
    config.text = '![chart image](' + base64 + ')',
        // webhookURL=webhookURL;

        axios.post(WebhookURL, config, _config)

            .then((res) => {
                console.log(`statusCode: ${res.statusCode}`)
                console.log(res)
            })
            .catch((error) => {
                console.error(error)
            })

}