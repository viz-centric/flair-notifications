function assignreportDTO(assignReportObj){
    return {
        channel: assignReportObj.channel,
        slack_API_Token:null, 
        channel_id:null, 
        stride_API_Token:null, 
        stride_cloud_id:null, 
        stride_conversation_id:null, 
        condition:assignReportObj.condition, 
        email_list:assignReportObj.email_list
      }
  }

module.exports = assignreportDTO;