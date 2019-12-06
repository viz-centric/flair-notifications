const nodemailer = require('nodemailer');
const ejs = require("ejs");
const AppConfig = require('./load_config');

const appLogo = 'flairbi-logo.png';
let transporter;
let config;

function createTransporter(config) {
    return nodemailer.createTransport({
        host: config.mailService.host,
        port: config.mailService.port,
        pool: true,
        secure: false,
        auth: {
            user: config.mailService.auth.user,
            pass: config.mailService.auth.pass
        },
        tls: {
            rejectUnauthorized: false
        }
    });
}

async function init() {
    config = await AppConfig.getConfig();
    transporter = createTransporter(config);
}

init();

exports.sendMail = function sendMailToGmail(subject, to_mail_list, mail_body, report_title, share_link, build_url, dash_board, view_name, encodedUrl, imagefilename, chartHtml, chartType) {
    var image_cid = new Date().getTime() + imagefilename;
    var template_data = {
        mail_body: mail_body,
        title: report_title,
        share_link: share_link,
        build_url: build_url,
        dash_board: dash_board,
        view_name: view_name,
        image_cid: "cid:" + image_cid,
        imageFile: encodedUrl,
        AppLogo: "cid:" + appLogo,
        chartHtml: chartHtml,
        chartType: chartType
    }
    return new Promise((resolve, reject) => {
        ejs.renderFile(__dirname + "/template/mail-template.ejs", template_data, function (err, html_data) {
            if (err) {
                reject(err)
            } else {
                var mailOptions = {
                    from: config.mailService.sender, // sender address
                    to: to_mail_list, // list of receivers
                    subject: subject, // Subject line
                    html: html_data,// plain html body
                    attachments: [
                        {
                            filename: imagefilename,
                            content: encodedUrl,
                            path: encodedUrl,
                            cid: image_cid
                        },
                        {
                            filename: appLogo,
                            path: __dirname + "/template/" + appLogo,
                            cid: appLogo //same cid value as in the html img src
                        }
                    ]
                };
                transporter.sendMail(mailOptions, function (err, info) {
                    if (err) {
                        console.log(err); //to see error in case of container, will remove latter 
                        reject(err)
                    } else {
                        resolve(info.response);
                    }
                });
            }

        });

    })

}
