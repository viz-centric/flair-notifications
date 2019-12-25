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
        getChannel,
        addChannelConfigs,
        updateChannel,
        getChannelByChannelName,
        getChannelProperties,
        deleteChannelConfig

    })
}

function addChannelConfigs(call, callback) {
    handleCall(channelService.addChannelConfigs(call.request), callback);
}

function getChannelProperties(call, callback) {
    handleCall(channelService.getChannelProperties(call.request), callback);
}

function deleteChannelConfig(call, callback) {
    handleCall(channelService.deleteChannelConfig(call.request), callback);
}

function getChannel(call, callback) {
    handleCall(channelService.getChannel(call.request), callback);
}

function updateChannel(call, callback) {
    handleCall(channelService.updateChannel(call.request), callback);
}

function getChannelByChannelName(call, callback) {
    handleCall(channelService.getChannelByChannelName(call.request), callback);
}

