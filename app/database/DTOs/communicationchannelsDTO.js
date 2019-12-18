var moment = require('moment');
function communicationchannelsDTO(communicationchannelsObj) {
  return {
    communication_channel_id:DataTypes.STRING,
    channel_parameters: communicationchannelsObj.JSON,
    createdAt:moment(createdAt).format("YYYY-MM-DD HH:mm"),
    updatedAt: moment(updatedAt).format("YYYY-MM-DD HH:mm")
  }
}

module.exports = communicationchannelsDTO;