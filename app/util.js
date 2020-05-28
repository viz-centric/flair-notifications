const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

var util = {

    dateFormat: function () {
        return "YYYY-MM-DD HH:mm";
    },
    channelList: function () {
        return {
            team: "Teams",
            email: "Email"
        }
    },
    encrypt: function (text) {
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return encrypted.toString('hex') + ':' + iv.toString('hex') + '=' + key.toString('hex');

    },
    decrypt: function (text) {
        let iv = Buffer.from((text.split(':')[1]).split('=')[0], 'hex')//will return iv;
        let enKey = Buffer.from(text.split('=')[1], 'hex')//will return key;
        let encryptedText = Buffer.from(text.split(':')[0], 'hex');//returns encrypted Data
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(enKey), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    },

    getFlairInsightsLink: function (urlString, id, reportType) {
        return urlString.substring(0, urlString.indexOf('visual')) + "administration/report-management//report/" + id + "/" + reportType;
    },
    getViewDataURL: function (urlString, id, viewId) {
        let datasource = urlString.substring(urlString.indexOf('datasource'), urlString.lenght)
        return urlString.substring(0, urlString.indexOf('visual')) + "visual-table/?schedulerId=" + id + "&" + datasource + "&chartType=table";
    },

    getViewWidgetLink: function (urlString, id, viewId) {
        let datasource = urlString.substring(urlString.indexOf('datasource'), urlString.lenght)
        return urlString.substring(0, urlString.indexOf('visual')) + "visual-table/?schedulerId=" + id + "&" + datasource + "&chartType=viz";
    },

    checkChannel: function (channelList, channelName) {
        if (channelList.indexOf(channelName) !== -1) {
            return true;
        }
        else {
            return false;
        }
    }
}
module.exports = util;