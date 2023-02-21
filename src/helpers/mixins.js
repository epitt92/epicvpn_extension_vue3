export const getValue = (val) => {
    return !isNaN(val) ? `${val}px` : val;
};

export const parseErrorValidationField = (errors_validation) => {
    const errors = [];
    for (const key in errors_validation) {
        errors.push(...errors_validation[key]);
    }
    return errors.join(' ');
};

export const getError = ({ errors_validation, errors_info }) => {
    return (errors_info && errors_info[0]) || parseErrorValidationField(errors_validation) || 'Something went wrong';
};

export const parsePrice = (price, type, toFixed = 2) => {
    if (isNaN(Number(price))) {
        return 'Not a Number!';
    }
    if (type == 'send') {
        return Number(price) * 100;
    } else if (type == 'get') {
        return (Number(price) / 100).toFixed(2);
    } else {
        return price;
    }
};

export const capitalizeFirstLetter = (string) => {
    const str = String(string).toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const convertTraffic = ({ value, to }) => {
    switch (to) {
        case 'gb':
            return (parseInt(value) * 0.001).toFixed(2);
        default:
            break;
    }
};

export const pluralize = (val, word, plural = word + 's') => {
    const _pluralize = (num, word, plural = word + 's') => ([1, -1].includes(Number(num)) ? word : plural);
    if (typeof val === 'object') return (num, word) => _pluralize(num, word, val[word]);
    return _pluralize(val, word, plural);
};

export const subStartDate = (sub) => {
    return sub.current_period_start || sub.start_date;
};

export const subEndDateLabel = (sub) => {
    const { status } = sub;
    const statusLower = String(status).toLowerCase();

    if (['paused', 'pause', 'canceled'].includes(statusLower) || (statusLower == 'active' && sub.cancel_at)) {
        return 'Expire on';
    } else if (['expired'].includes(statusLower)) {
        return 'Expired on';
    } else if (['failed'].includes(statusLower)) {
        return 'Failed on';
    } else if (['refunded'].includes(statusLower)) {
        return 'Refunded on';
    } else {
        return 'Renews on';
    }
};

export const subEndDate = (sub) => {
    const { status } = sub;
    const statusLower = String(status).toLowerCase();

    if (['failed'].includes(statusLower)) {
        return sub.failed_at;
    } else if (['expired'].includes(statusLower)) {
        return sub.updated_at;
    } else if (['refunded'].includes(statusLower)) {
        return sub.refunded_at;
    } else if (sub.current_period_end || sub.ended_at) {
        return sub.current_period_end || sub.ended_at;
    }
};

export const deleteConfidentialUserData = (user) => {
    const result = { ...user };
    delete result.api_token;
    delete result.vpn_name;
    delete result.vpn_password;
    return result;
};
