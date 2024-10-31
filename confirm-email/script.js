

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

        case 'confirmCompany':
            url = `${host}/simplybook/company/confirm`;
            requestBody = document.getElementById('confirmCompanyRequest').value;
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

            if(data && data.recaptcha_site_key) {
                addDataKeyVal('recaptcha_site_key', data.recaptcha_site_key);
                addDataKeyVal('company_id', data.company_id);
                addDataKeyVal('company_login', data.company_login);

                generateRecaptcha(data.recaptcha_site_key);
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
    const endpoints = ['getAuthToken', 'refreshAuthToken', 'registerCompany', 'applySubscription'];
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


    //add to registerCompanyRequest login counter
    const regRequest = document.getElementById('registerCompanyRequest');
    regRequest.value = regRequest.value.replace('testregcompany', 'testregcompany' + Math.floor(Math.random() * 10000));

    const additionalData = JSON.parse(localStorage.getItem('additionalData'));

    //if recaptcha_site_key is present, generate recaptcha
    if(additionalData && additionalData.recaptcha_site_key) {
        generateRecaptcha(additionalData.recaptcha_site_key);
    }
});

generateRecaptcha = function(siteKey) {

    if(!window.recaptcha) {
        console.log('recaptcha not loaded');
        if(!window.recaptchaCallabacks){
            window.recaptchaCallabacks = [];
        }
        window.recaptchaCallabacks.push(function(){
            generateRecaptcha(siteKey);
        });
        return;
    } else {
        console.log('recaptcha loaded');
    }

    const recaptchaContainer = document.getElementById('recaptcha_container');
    recaptchaContainer.innerHTML = '';

    const randomId = 'recaptcha-' + Math.floor(Math.random() * 10000) + '-' + Math.floor(Math.random() * 10000);
    const recaptchaDiv = document.createElement('div');
    recaptchaDiv.setAttribute('id', randomId);
    recaptchaContainer.appendChild(recaptchaDiv);

    //addDataKeyVal('recaptcha_token', '');

    grecaptcha.render(randomId, {
        'sitekey' : siteKey,
        'callback' : function(token) {
            addDataKeyVal('recaptcha_token', token);

            console.log(token);
        }
    });
}

function onloadRecaptchaCallback(){
    console.log('recaptcha loaded');
    if(window.recaptchaCallabacks){
        //each and pop from array, then call
        while(window.recaptchaCallabacks.length > 0) {
            const callback = window.recaptchaCallabacks.pop();
            callback();
        }
    }
}
