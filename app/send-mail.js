var nodemailer = require('nodemailer');
var ejs = require("ejs");

var AppConfig = require('./load_config');

var image_dir = AppConfig.imageFolder;
var appLogo = 'flairbi-logo.jpg';

var transporter = nodemailer.createTransport({
    host: AppConfig.mailService.host,
    port: AppConfig.mailService.port,
    pool: true,
    secure: false,
    auth: {
        user: AppConfig.mailService.auth.user,
        pass: AppConfig.mailService.auth.pass
    },
    tls: {
        rejectUnauthorized: false
    }
});

exports.sendMail = function sendMailToGmail(subject, to_mail_list, mail_body, report_title, share_link, build_url, dash_board, encodedUrl,imagefilename) {
    var image_cid=new Date().getTime()+imagefilename;
    var template_data = {
        mail_body: mail_body,
        title: report_title,
        share_link: share_link,
        build_url: build_url,
        dash_board:dash_board,
        image_cid:"cid:"+image_cid,
        imageFile: encodedUrl,
        AppLogo: "cid:" + appLogo
    }
    return new Promise((resolve, reject) => {
        ejs.renderFile(__dirname + "/template/mail-template.ejs", template_data, function (err, html_data) {
            if (err) {
                reject(err)
            } else {
                var mailOptions = {
                    from: AppConfig.mailService.sender, // sender address
                    to: to_mail_list, // list of receivers
                    subject: subject, // Subject line
                    html: html_data,// plain html body
                    attachments: [
                    {
                        filename:imagefilename,
                        content : encodedUrl,
                        path:encodedUrl,
                        cid:image_cid
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
