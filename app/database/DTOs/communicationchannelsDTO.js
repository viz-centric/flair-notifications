var moment = require('moment');
function communicationchannelsDTO(communicationchannelsObj) {
  return {
    id:communicationchannelsObj.communication_channel_id,
    channel_parameters: communicationchannelsObj.channel_parameters,
    createdAt:moment(createdAt).format("YYYY-MM-DD HH:mm"),
    updatedAt: moment(updatedAt).format("YYYY-MM-DD HH:mm")
  }
}

module.exports = communicationchannelsDTO;