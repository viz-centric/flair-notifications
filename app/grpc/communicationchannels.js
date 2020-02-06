const channelService = require('../report/channelService');

module.exports =
    [
        constructChannelService
    ];


function handleCall(promise, callback) {
    return promise.then(function (data) {
        callback(null, data);
    }).catch(function (err) {
        callback(null, err)
    });
}

function constructChannelService(server) {
    server.addService({
        addTeamConfigs,
        addEmailConfigs,
        updateEmailSMTP,
        updateTeamWebhookURL,
        getChannelProperties,
        deleteChannelConfig,
        getTeamConfig,
        getEmailConfig
    })
}

function addTeamConfigs(call, callback) {
    handleCall(channelService.addTeamConfigs(call.request), callback);
}

function addEmailConfigs(call, callback) {
    handleCall(channelService.addEmailConfigs(call.request), callback);
}


function getChannelProperties(call, callback) {
    handleCall(channelService.getChannelProperties(call.request), callback);
}

function deleteChannelConfig(call, callback) {
    handleCall(channelService.deleteChannelConfig(call.request), callback);
}


function updateEmailSMTP(call, callback) {
    handleCall(channelService.updateEmailSMTP(call.request), callback);
}

function updateTeamWebhookURL(call, callback) {
    handleCall(channelService.updateTeamWebhookURL(call.request), callback);
}

function getEmailConfig(call, callback) {
    handleCall(channelService.getEmailConfig(call.request), callback);
}

function getTeamConfig(call, callback) {
    handleCall(channelService.getTeamConfig(call.request), callback);
}