const nodemailer = require('nodemailer');
const ejs = require("ejs");
const AppConfig = require('./load_config');
const jobs = require('./jobs/channelJobs');
const modelsUtil = require('./jobs/models-utils');

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

exports.sendMail = async function sendMailToGmail(emailData) {
    var isSMTPConfig = await init();

    var image_cid = new Date().getTime() + emailData.imagefilename;
    var template_data = emailData;
    template_data.image_cid = "cid:" + image_cid;
    template_data.AppLogo = "cid:" + appLogo;
    template_data.htmlTable = modelsUtil.createTableForNotification(emailData.tableData,emailData.measure,emailData.dimension);
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
                        to: emailData.toMailList, // list of receivers
                        subject: emailData.subject, // Subject line
                        html: html_data,// plain html body
                        attachments: [
                            {
                                filename: emailData.imagefilename,
                                content: emailData.encodedUrl,
                                path: emailData.base64,
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

                            resolve({
                                success: 1,
                                message: emailData.toMailList.toString()
                            });
                        }
                    });
                }
            }
        });
    })
}
