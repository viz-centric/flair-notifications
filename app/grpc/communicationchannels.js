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
        addChannel,
        getChannel,
        updateChannelByChannelName,
        getChannelByChannelName
    })
}

function addChannel(call, callback) {
    handleCall(channelService.addChannel(call.request), callback);
}

function getChannel(call, callback) {
    handleCall(channelService.getChannel(call.request), callback);
}

function updateChannelByChannelName(call, callback) {
    handleCall(channelService.updateChannelByChannelName(call.request), callback);
}

function getChannelByChannelName(call, callback) {
    handleCall(channelService.getChannelByChannelName(call.request), callback);
}
