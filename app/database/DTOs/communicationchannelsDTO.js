var moment = require('moment');
var util= require('../../util');
function communicationchannelsDTO(communicationchannelsObj) {
  return {
    id:communicationchannelsObj.communication_channel_id,
    channel_parameters: communicationchannelsObj.channel_parameters,
    createdAt:moment(createdAt).format(util.dateFormat),
    updatedAt: moment(updatedAt).format(util.dateFormat)
  }
}

module.exports = communicationchannelsDTO;