# Company API Documentation

## Get Auth Token

### Request
**POST** `{{ host }}/simplybook/auth/token`

**Headers:**
- Content-Type: application/json

**Body:**
```json
{
  "api_key": "{{ api_key }}"
}
```
**Response**
```json
{
  "token": "5770dc18b7ee641eaeb195adc220be3c890*********e8b0f3e431184",
  "refresh_token": "9406297c5adb7f7dfeb72116018*********31446b289524c2e736b934e8790d",
  "domain": "domain.com",
  "require2fa": false,
  "allowed2fa_providers": [],
  "auth_session_id": "",
  "id": 1
}
```

---------------

## Get Auth Token by Refresh Token

### Request
**POST** `{{ host }}/simplybook/auth/refresh-token`

**Headers:**
- Content-Type: application/json

**Body:**
```json
{
  "refreshToken": "{{ refresh_token }}"
}

```
**Response**
```json
{
  "token": "5770dc18b7ee641eaeb195adc220be3c890*********e8b0f3e431184",
  "refresh_token": "9406297c5adb7f7dfeb72116018*********31446b289524c2e736b934e8790d",
  "domain": "domain.com",
  "require2fa": false,
  "allowed2fa_providers": [],
  "auth_session_id": "",
  "id": 2
}
```


---------------

## Register a Company

### Request
**POST** `{{ host }}/simplybook/company`

**Headers:**
- Content-Type: application/json
- X-Token: {{ token }}

**Body:**
```json
{
  "login" : "testregcomp40",
  "email" : "test@gmail.com",
  "name" : "TestRegComp",
  "description" : "some description",
  "phone" : "123123123",
  "location" : "Kyiv",
  "address1" : "address1",
  "lat": "50.4501",
  "lng": "30.5234",
  "country_id" : "UA",
  "admin_name" : "admin",
  "password" : "123123",
  "retype_password" : "123123",
  "categories" : ["6"],
  "lang" : "en",
  "widget_notification_url": "https://mysite.com/simplybook",
  "callback_url" : "https://webhook.site/****************"
}


```
**Response**
```json
{
  "success" : true,
  "message" : "Task was successfully created. Please wait for the callback"
}
```

---------------

## Apply subscription

### Request
**POST** `{{ host }}/simplybook/company/{{ company }}/subscriptions`

**Headers:**
- Content-Type: application/json
- X-Token: {{ token }}

**Body:**
```json
{
  "plan" : "premium"
}


```
**Response**
Empty response if no errors.

In case of error:
```json
{
  "code": 400,
  "message": "Plan not found",
  "data": [],
  "message_data": []
}
```
