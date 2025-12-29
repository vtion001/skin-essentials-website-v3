###Create Message Reminder

POST
https://www.iprogsms.com/api/v1/message-reminders?api_token=1231asd1&message=Internet+Bill.&phone_number=09171251234&scheduled_at=2025-03-08+05%3A00AM

Request Parameters
api_token
(string, required) - Your API TOKEN
phone_number
(string, required) - Recipient's phone number
scheduled_at
(string, required) - Scheduled date and time (format: YYYY-MM-DD HH:MMAM/PM)
message
(string, required) - Message content
Example Request
Copy
POST https://www.iprogsms.com/api/v1/message-reminders?api_token=1231asd1&message=Internet+Bill.&phone_number=09171251234&scheduled_at=2025-03-08+05%3A00AM
Content-Type: application/json

{
    "api_token": "1231asd1",
    "phone_number": "09171251234",
    "scheduled_at": "2025-03-08 05:00AM",
    "message": "Internet Bill."
}
Response
Copy
{
    "status": "success",
    "message": "Message reminder successfully scheduled on March 08, 2025, at 05:00 AM and will be sent to 09171251234.",
    "data": {
        "id": 1,
        "phone_number": "09171251234",
        "message": "Internet Bill.",
        "scheduled_at": "2025-03-08T05:00:00.000+08:00",
        "status": "scheduled",
        "created_at": "2025-03-07T16:11:38.937+08:00",
        "updated_at": "2025-03-07T16:11:38.937+08:00"
    }
}
Get Message Reminder
GET
https://www.iprogsms.com/api/v1/message-reminders/1?api_token=1231asd1

Example Request
Copy
GET https://www.iprogsms.com/api/v1/message-reminders/1?api_token=1231asd1
Response
Copy
{
    "status": "success",
    "message": "Message reminder found.",
    "data": {
        "id": 1,
        "phone_number": "09171251234",
        "message": "Internet Bill.",
        "scheduled_at": "2025-03-08T05:00:00.000+08:00",
        "status": "scheduled",
        "created_at": "2025-03-07T16:11:38.937+08:00",
        "updated_at": "2025-03-07T16:11:38.937+08:00"
    }
}
Update Message Reminder
PATCH
https://www.iprogsms.com/api/v1/message-reminders/1?api_token=1231asd1

Example Request
Copy
PATCH https://www.iprogsms.com/api/v1/message-reminders/1?api_token=1231asd1
Content-Type: application/json

{
    "api_token": "1231asd1",
    "scheduled_at": "2025-03-08 06:00AM"
}
Response
Copy
{
    "status": "success",
    "message": "Message reminder updated successfully",
    "data": {
        "scheduled_at": "2025-03-08T06:00:00.000+08:00",
        "id": 1,
        "phone_number": "09171251234",
        "message": "Internet Bill.",
        "status": "scheduled",
        "created_at": "2025-03-07T16:11:38.937+08:00",
        "updated_at": "2025-03-07T16:36:18.090+08:00"
    }
}
Delete Reminder
DELETE
https://www.iprogsms.com/api/v1/message-reminders/1?api_token=1231asd1

Example Request
Copy
DELETE https://www.iprogsms.com/api/v1/message-reminders/1?api_token=1231asd1
Response
Copy
{
    "status": "success",
    "message": "Message reminder successfully deleted.",
    "data": {
        "id": 1,
        "phone_number": "09171251234",
        "message": "Internet Bill.",
        "scheduled_at": "2025-03-08T06:00:00.000+08:00",
        "status": "scheduled",
        "created_at": "2025-03-07T16:11:38.937+08:00",
        "updated_at": "2025-03-07T16:36:18.090+08:00"
    }
}

###Send SMS
POST
https://www.iprogsms.com/api/v1/sms_messages?api_token=1231asd1&message=Test+Message&phone_number=639109432834

Request Parameters
api_token
(string, required) - Your API TOKEN
phone_number
(string, required) - Recipient's phone number
message
(string, required) - Message content
sms_provider
(integer, optional) - SMS Provider (0, 1, or 2) | default: 0
Example Request
Copy
POST https://www.iprogsms.com/api/v1/sms_messages?api_token=1231asd1&message=Test+Message&phone_number=639109432834
Content-Type: application/json

{
    "api_token": "1231asd1",
    "phone_number": "09345678942",
    "message": "Hello, this is a test message."
}
Response
Copy
{
    "status": 200,
    "message": "Your SMS message has been successfully added to the queue and will be processed shortly.",
    "message_id": "iSms-XHYBk"
}
Code Examples
Get started quickly with code samples in multiple programming languages

cURL
Ruby
C++
PHP
WordPress Plugin
Watch Demo
Copy
curl -X POST "https://www.iprogsms.com/api/v1/sms_messages?api_token=1231asd1&message=Test+Message&phone_number=639109432834"


###Check Credits

GET
https://www.iprogsms.com/api/v1/account/sms_credits?api_token=1231asd1

Request Parameters
api_token
(string, required) - Your API TOKEN
Example Request
Copy
GET https://www.iprogsms.com/api/v1/account/sms_credits?api_token=1231asd1
Content-Type: application/json

{
    "api_token": "1231asd1"
}
Response
Copy
{
    "status": "success",
    "message": "Account found.",
    "data": {
        "load_balance": 10
    }
}
Code Examples
Get started quickly with code samples in multiple programming languages

cURL
Ruby
C++
PHP
WordPress Plugin
Watch Demo
Copy
curl -X POST "https://www.iprogsms.com/api/v1/sms_messages?api_token=1231asd1&message=Test+Message&phone_number=639109432834"

###Check Status

GET
https://www.iprogsms.com/api/v1/sms_messages/status?api_token=1231asd1&message_id=iSms-XHYBk0

Request Parameters
api_token
(string, required) - Your API TOKEN
message_id
(string, required) - SMS message ID
Example Request
Copy
GET https://www.iprogsms.com/api/v1/sms_messages/status?api_token=1231asd1&message_id=iSms-XHYBk0
Content-Type: application/json

{
    "api_token": "1231asd1",
    "message_id": "iSms-XHYBk0"
}
Response
Copy
{
    "status": 200,
    "message_status": "pending"
}
Code Examples
Get started quickly with code samples in multiple programming languages

cURL
Ruby
C++
PHP
WordPress Plugin
Watch Demo
Copy
curl -X POST "https://www.iprogsms.com/api/v1/sms_messages?api_token=1231asd1&message=Test+Message&phone_number=639109432834"