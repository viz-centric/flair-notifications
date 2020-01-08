const nodemailer = require('nodemailer');
const ejs = require("ejs");
const AppConfig = require('./load_config');
const jobs = require('./jobs/channelJobs');
const appLogo = 'flairbi-logo.png';
let transporter;
let config;
let SMTPConfig;

function createTransporter(SMTPConfig) {
    return nodemailer.createTransport({
        host: SMTPConfig.records.config.host,
        port: SMTPConfig.records.config.port,
        pool: true,
        secure: false,
        auth: {
            user: SMTPConfig.records.config.user,
            pass: SMTPConfig.records.config.password
        },
        tls: {
            rejectUnauthorized: false
        }
    });
}

async function init() {
    config = await AppConfig.getConfig();
    SMTPConfig = await jobs.getSMTPConfig();
    if (SMTPConfig.success == 1) {
        transporter = createTransporter(SMTPConfig);
    }
    else {
        return SMTPConfig;
    }
}

exports.sendMail = async function sendMailToGmail(subject, to_mail_list, mail_body, report_title, share_link, build_url, viewData, dash_board, view_name, encodedUrl, imagefilename, chartHtml, chartType) {
    var isSMTPConfig = await init();

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
                if (isSMTPConfig && isSMTPConfig.success == 0) {
                    reject(isSMTPConfig);
                }
                else {
                    var mailOptions = {
                        from: SMTPConfig.records.config.sender, // sender address
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
            }
        });
    })
}
