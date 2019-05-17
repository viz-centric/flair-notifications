function reportDTO(userid,connection_name,source_id,mail_body,subject,report_name,title_name){
    return {
        userid:userid,
        connection_name:connection_name,
        source_id:source_id, 
        mail_body:mail_body, 
        subject:subject, 
        report_name:report_name, 
        title_name:title_name
      }
  }

module.exports = reportDTO;