const Joi = require('joi');
const cronParser = require('cron-parser');

const supportedCharts = ['Pie Chart', 'Line Chart', 'Clustered Vertical Bar Chart', 'Clustered Horizontal Bar Chart',
    'Stacked Vertical Bar Chart', 'Stacked Horizontal Bar Chart', 'Heat Map', 'Combo Chart', 'Tree Map',
    'Info-graphic', 'Box Plot', 'Bullet Chart', 'Sankey', 'Table', 'Pivot Table', 'Doughnut Chart', 'KPI',
    'Scatter plot', 'Gauge plot', 'Text Object', 'Chord Diagram', 'Pie Grid', 'Number Grid', 'Map']

const customJoi = Joi.extend((joi) => ({
    base: joi.string(),
    name: 'crone',
    language: {
        valid: 'needs to be a valid crone expression', // Used below as 'crone.valid'
    },
    rules: [
        {
            name: 'valid',
            validate(params, value, state, options) {
                try {
                    cronParser.parseExpression(value);
                } catch (err) {
                    return this.createError('crone.valid', { v: value }, state, options);
                }
                return value;
            }
        },
    ]
}));

const vizIdPrefix = 'threshold_alert_:';

function preprocessor(result) {
    result.value.report_line_item.visualizationid = result.value.report.thresholdAlert ? vizIdPrefix + result.value.report_line_item.visualizationid : result.value.report_line_item.visualizationid;
    return result;
}


var validator = {
    validateReportReqBody: function (reqBody) {

        var cronSchema = customJoi.crone().valid();

        var reportBodySchema = Joi.object().keys({
            userid: Joi.string().allow(null, ''),
            dashboard_name: Joi.string().required(),
            view_name: Joi.string().required(),
            share_link: Joi.string().required(),
            build_url: Joi.string().required(),
            mail_body: Joi.string().allow(null, ''),
            subject: Joi.string().allow(null, ''),
            report_name: Joi.string().required(),
            title_name: Joi.string().allow(null, ''),
            thresholdAlert: Joi.boolean().required()
        });
        var reportLineSchema = Joi.object().keys({
            dimension: Joi.array().items(Joi.string()),
            measure: Joi.array().items(Joi.string()).min(1),
            visualization: Joi.string().valid(supportedCharts).required(),
            visualizationid: Joi.string(),
        });

        var email = Joi.object().keys({
            user_name: Joi.string(),
            user_email: Joi.string(),
            channel_config_id: Joi.string(),
        })

        var teams = Joi.object().keys({
            webhook: Joi.string(),
            channel_config_id: Joi.string(),
        })

        var communicationList = Joi.object().keys({
            email: Joi.array().items(email),
            teams: teams
        })

        var assignReportSchema = Joi.object().keys({
            channel: Joi.array().items(Joi.string()),
            slack_API_Token: Joi.string().allow(null, ''),
            channel_id: Joi.string().allow(null, ''),
            stride_API_Token: Joi.string().allow(null, ''),
            stride_cloud_id: Joi.string().allow(null, ''),
            stride_conversation_id: Joi.string().allow(null, ''),
            communication_list: communicationList
        })

        var scheduleSchema = Joi.object().keys({
            cron_exp: cronSchema,
            timezone: Joi.string().allow(null, ''),
            start_date: Joi.date().iso(),
            end_date: Joi.date().iso().greater(new Date()),
        });

        var reportSchema = Joi.object().keys({
            report: reportBodySchema,
            query: Joi.string(),
            report_line_item: reportLineSchema,
            assign_report: assignReportSchema,
            schedule: scheduleSchema
        });

        result = Joi.validate(reqBody, reportSchema);
        return preprocessor(result);
    },
    validateBuildVisualizationReqBody: function (reqBody) {
        var reportSchema = Joi.object().keys({
            userId: Joi.string().allow(null, ''),
            reportName: Joi.string().required(),
            titleName: Joi.string().allow(null, ''),
            dimension: Joi.array().items(Joi.string()),
            measure: Joi.array().items(Joi.string()).min(1),
            visualization: Joi.string().valid(supportedCharts).required(),
            visualizationId: Joi.string(),
            query: Joi.string(),
            thresholdAlert: Joi.boolean().required()
        });
        result = Joi.validate(reqBody, reportSchema);
        return result;
    },
};

module.exports = validator;

