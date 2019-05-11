function reportDTO(userid,connection_name,mail_body,subject,report_name,title_name){
    return {
        userid:userid,
        connection_name:connection_name, 
        mail_body:mail_body, 
        subject:subject, 
        report_name:report_name, 
        title_name:title_name
      }
  }

module.exports = reportDTO;