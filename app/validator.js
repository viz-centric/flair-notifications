const Joi = require('joi');
const cronParser = require('cron-parser');

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
                  return this.createError('crone.valid', {v: value}, state, options);
                }
                return value;
              }
        },
    ]
}));

var validator = {
    validateReportReqBody: function (reqBody) {

        var cronSchema = customJoi.crone().valid();

        var reportBodySchema = Joi.object().keys({
            connection_name: Joi.string().required(),
            mail_body: Joi.string().allow(null, ''),
            subject: Joi.string().allow(null, ''),
            report_name: Joi.string().required(),
            source_id: Joi.string().required(),
            title_name: Joi.string().allow(null, ''),
        });

        var reportLineSchema = Joi.object().keys({
            query_name: Joi.string().required(),
            fields: Joi.array().items(Joi.string()).min(2),
            group_by: Joi.array().items(Joi.string()).allow(null, ''),
            order_by: Joi.array().items(Joi.string()).allow(null, ''),
            where: Joi.string().allow(null, ''),
            limit: Joi.number().required(),
            table: Joi.string().required(),
            visualization: Joi.string().valid(['line', 'pie']).required(),
        });

        var assignReportSchema = Joi.object().keys({
            channel: Joi.string().valid(['email', 'slack', 'stride']).required(),
            slack_API_Token: Joi.string().allow(null, ''),
            channel_id: Joi.string().allow(null, ''),
            stride_API_Token: Joi.string().allow(null, ''),
            stride_cloud_id: Joi.string().allow(null, ''),
            stride_conversation_id: Joi.string().allow(null, ''),
            email_list: Joi.array().items(Joi.object({
                user_name: Joi.string().required(),
                user_email: Joi.string().required(),
            })),
            condition: Joi.string().allow(null, ''),
        });

        var scheduleSchema = Joi.object().keys({
            timezone: Joi.string().allow(null, ''),
            start_date: Joi.date().iso(),
            end_date: Joi.date().iso().greater(new Date()),
        });

        var reportSchema = Joi.object().keys({
            userid: Joi.string().allow(null, ''),
            cron_exp: cronSchema,
            report: reportBodySchema,
            report_line_item: reportLineSchema,
            assign_report: assignReportSchema,
            schedule: scheduleSchema
        });

        result = Joi.validate(reqBody, reportSchema);
        return result;
    },
}

module.exports = validator;

