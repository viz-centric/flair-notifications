var moment = require('moment');
function reportDTO(userid,dashboard_name,view_name,share_link,build_url,mail_body,subject,report_name,title_name,createdAt){
    return {
        userid:userid,
        dashboard_name:dashboard_name,
        view_name:view_name,
        share_link: share_link,
        build_url:build_url,
        mail_body:mail_body, 
        subject:subject, 
        report_name:report_name, 
        title_name:title_name,
        createdAt:moment(createdAt).format("YYYY-MM-DD HH:mm")
      }
  }

module.exports = reportDTO;