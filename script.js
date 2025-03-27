getData = function () {
    let data = {
        "host": document.getElementById('host').value,
        "api_key": document.getElementById('apiKey').value,
    };

    //get additional data from local storage
    const additionalData = JSON.parse(localStorage.getItem('additionalData'));
    if (additionalData) {
        data = { ...data, ...additionalData };
    }
    return data;
}

addDataKeyVal = function (key, value) {
    let data = getData();
    //unset host and api_key
    delete data.host;
    delete data.api_key;
    data[key] = value;
    localStorage.setItem('additionalData', JSON.stringify(data));
}

addDataByObj = function (obj) {
    for (let key in obj) {
        addDataKeyVal(key, obj[key]);
    }
}


prepareRequest = function (request) {
    const data = getData();
    //replace {{key}} with value
    for (let key in data) {
        request = request.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
    }
    return request;
};



async function callApi(endpoint) {
    const { host, api_key: apiKey, token } = getData();
console.log(endpoint);
    let url = '';
    let options = {};
    let requestBody = '';
    let company = '';
    let subscriptionId = null;

    switch (endpoint) {
        case 'getAuthToken':
            url = `${host}/simplybook/auth/token`;
            requestBody = document.getElementById('getAuthTokenRequest').value;
            requestBody = prepareRequest(requestBody);
            options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: requestBody
            };
            break;

        case 'refreshAuthToken':
            url = `${host}/simplybook/auth/refresh-token`;
            requestBody = document.getElementById('refreshAuthTokenRequest').value;
            requestBody = prepareRequest(requestBody);
            options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: requestBody
            };
            break;

        case 'registerCompany':
            url = `${host}/simplybook/company`;
            requestBody = document.getElementById('registerCompanyRequest').value;
            requestBody = prepareRequest(requestBody);
            options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Token': token
                },
                body: requestBody
            };
            break;
        case 'applySubscription':
            company = document.getElementById('applySubscriptionCompany').value;
            url = `${host}/simplybook/company/${company}/subscriptions`;
            requestBody = document.getElementById('applySubscriptionRequest').value;
            requestBody = prepareRequest(requestBody);
            options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Token': token
                },
                body: requestBody
            };
            break;
        case 'changeSubscription':
            company = document.getElementById('changeSubscriptionCompany').value;
            subscriptionId = document.getElementById('changeSubscriptionId').value;
            url = `${host}/simplybook/company/${company}/subscriptions/${subscriptionId}`;
            requestBody = document.getElementById('changeSubscriptionRequest').value;
            requestBody = prepareRequest(requestBody);
            options = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Token': token
                },
                body: requestBody
            };
            break;
        case 'cancelSubscription':
            company = document.getElementById('cancelSubscriptionCompany').value;
            subscriptionId = document.getElementById('cancelSubscriptionId').value;
            url = `${host}/simplybook/company/${company}/subscriptions/${subscriptionId}/cancel`;
            options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Token': token
                },
                body: ''
            };
            break;
        case 'loginLink':
            company = document.getElementById('loginLinkCompany').value;
            url = `${host}/simplybook/company/${company}/create-login-link`;
            requestBody = document.getElementById('loginLinkRequest').value;
            requestBody = prepareRequest(requestBody);
            options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Token': token
                },
                body: requestBody
            };
            break;
        case 'widgetSettings':
            company = document.getElementById('widgetSettingsCompany').value;
            url = `${host}/simplybook/company/${company}/widget-settings`;
            requestBody = document.getElementById('widgetSettingsRequest').value;
            requestBody = prepareRequest(requestBody);
            options = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Token': token
                },
                body: requestBody
            };
            break;

        case 'customDomain':
            company = document.getElementById('customDomainCompany').value;
            url = `${host}/simplybook/company/${company}/custom-domain`;
            requestBody = document.getElementById('customDomainRequest').value;
            requestBody = prepareRequest(requestBody);
            options = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Token': token
                },
                body: requestBody
            };
            break;

        case 'customSmtp':
            company = document.getElementById('customSmtpCompany').value;
            url = `${host}/simplybook/company/${company}/custom-smtp`;
            requestBody = document.getElementById('customSmtpRequest').value;
            requestBody = prepareRequest(requestBody);
            options = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Token': token
                },
                body: requestBody
            };
            break;

        case 'getCompanyStatus':
            company = document.getElementById('getCompanyStatusCompany').value;
            url = `${host}/simplybook/company/${company}/status`;
            options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Token': token
                }
            };
            break;

        default:
            return;
    }

    try {
        const $el = document.getElementById(`${endpoint}Response`).getElementsByTagName('code')[0];
        if(apiKey && host) {
            const response = await fetch(url, options);
            if (response.status === 201) {
                $el.innerHTML = '';
                return;
            }
            var data = await response.json();

            if (data && (data.refresh_token || data.token)) {
                addDataByObj(data);
            }
        } else {
            data = { error: 'Please provide host and api_key in the form above' };
        }

        //save response to local storage
        localStorage.setItem(`${endpoint}Response`, JSON.stringify(data, null, 2));

        //inside code block
        $el.innerHTML = JSON.stringify(data, null, 2);
        //remove data-highlighted attribute
        $el.removeAttribute('data-highlighted');
        hljs.highlightElement($el);
    } catch (error) {
        const $el = document.getElementById(`${endpoint}Response`).getElementsByTagName('code')[0];
        $el.innerHTML = `Error: ${error.message}`;
        $el.removeAttribute('data-highlighted');
        hljs.highlightElement($el);
    }
}


//on page load
document.addEventListener('DOMContentLoaded', function () {

//check if response is saved in local storage
    const endpoints = ['getAuthToken', 'refreshAuthToken', 'registerCompany', 'applySubscription', 'getCompanyStatus'];
    endpoints.forEach(endpoint => {
        const response = localStorage.getItem(`${endpoint}Response`);
        if (response) {
            document.getElementById(`${endpoint}Response`).getElementsByTagName('code')[0].innerHTML = response;
        }
    });

    hljs.highlightAll();

    //if host and api_key is changed, save it to local storage
    document.getElementById('host').addEventListener('change', function () {
        localStorage.setItem('host', this.value);
    });

    document.getElementById('apiKey').addEventListener('change', function () {
        localStorage.setItem('apiKey', this.value);
    });

    //get host and api_key from local storage
    const host = localStorage.getItem('host');
    const apiKey = localStorage.getItem('apiKey');
    if (host) {
        document.getElementById('host').value = host;
    }
    if (apiKey) {
        document.getElementById('apiKey').value = apiKey;
    }


});
