API Documentation
The Semaphore API allows you to send SMS messages to Philippine numbers through your favorite programming language. If you’re Not so familiar with coding, feel free to use our Web Tool

New Limits on API Requests
Important! Access to some API endpoints is rate limited as noted below for each endpoint.

Details about rate limits follow popular standards and can be found in the response headers:


            X-RateLimit-Limit →30
            X-RateLimit-Remaining →28
            Retry-After →40
            
Sending Messages
Ready to dig deeper and do cool things like customizing your messages or automating SMS Notifications? Don’t worry, it’s still super easy.

To send any outgoing SMS message, send an HTTP POST request to:

 https://api.semaphore.co/api/v4/messages

Note: This endpoint is limited to being called 120 times per minute

Parameter	Description	Required
apikey	Please login to access your API key	Yes
number	Your recipient’s mobile number - if you have more than one, separate them with commas (you can do up to 1000 numbers per API call). If sending the same message to a large number of recipients, please specifiy multiple recipients in a single API call. This will avoid having your requests throttled.	Yes
message	What you want to tell your recipient (if you go over 160 ascii characters, we automatically split the message up for you). Note: Please do not start your message with the word "TEST". These messages are silently ignored and will not be sent.	Yes
sendername	What your recipient sees as the sender of your message (instead of a mobile number or a saved contact), manage your Sender Names here or leave it out and the Sender Name will default to “Semaphore”	No (defaults to "SEMAPHORE")
After each HTTP POST request, you will receive a JSON response containing the following parameters for each message:

Parameter	Description
message_id	The unique identifier for your message
user_id	The unique identifier for the user who sent the message
user	The email address of the user who sent the message
account_id	The unique identifier of the account the message was sent by
account	The name of the account the message was sent by
recipient	The phone number the message was sent to
message	The body of the message that was sent
sender_name	The Sender Name the message was sent from
network	The recipient phone number's network
status	
Queued	The message is queued to be sent to the network
Pending	The message is in transit to the network
Sent	The message was successfully delivered to the network
Failed	The message was rejected by the network and is waiting to be refunded
Refunded	The message has been refunded and your account balance has been adjusted
type	If the message was sent to one number the type will be "single". If the message was sent to more than "one" number the type will be "bulk". If the message was sent to the priority queue the type will be "priority"
source	The source of the message. For messages sent via API, the source will be "api". For messages sent through the web tool, the source will be "webtool". For messages sent through the bulk tool, the source will be "csv"
created_at	The timestamp the message was created
updated_at	The timestamp the message was last updated
Bulk Messages
To send multiple messages to the same number, you can specify up to 1,000 numbers (separated by commas) in recipient field. This is the preferred way to send "bulk" messages as it allows you to avoid API rate limits.

 https://api.semaphore.co/api/v4/messages

cURL Exmaple
curl --data "apikey=YOUR_API_KEY&number=NUMBER1,NUMBER2,NUMBER3&message=I just sent my first bulk message with Semaphore" https://semaphore.co/api/v4/messages
Priority Messages
Normally messages are processed in the order they are received and during periods of heavy traffic messaging, messages can be delayed. If your message is time sensitive, you may wish to use our premium priority queue which bypasses the default message queue and sends the message immediately. This service is 2 credits per 160 character SMS.

Note: This endpoint is not rate limited

 https://api.semaphore.co/api/v4/priority

curl --data "apikey=YOUR_API_KEY&number=MOBILE_NUMBER&message=I just sent my first priority message with Semaphore" https://semaphore.co/api/v4/priority
Priority messages use the same request parameters and provide the same response as the /api/v4/messages endpoint

OTP Messages
Semaphore also provides a simple and easy interface for generating OTP on the fly. Messages sent through this endpoint are routed to a SMS route dedicated to OTP traffic. This means your OTP traffic should still arrive even if telcos are experiencing high volumes of SMS.This service is 2 credits per 160 character SMS.

Note: This endpoint is not rate limited

 https://api.semaphore.co/api/v4/otp

This endpoint accepts the exact same payload as a regular message but you can specify where in the message to insert the OTP code by using the placeholder "{otp}"

If you would like to specify your own OTP code and skip the auto-generated one, just pass a "code" parameter with your call.

For instance using the message: "Your One Time Password is: {otp}. Please use it within 5 minutes." will return the message "Your One Time Password is: XXXXXX. Please use it within 5 minutes."

The response is the same as a regular message but an additional code parameter is passed which indicates the auto-generated OTP or the OTP code you passed in the "otp" parameter:

            
[
    {
        "message_id": 12345,
        "user_id": 54321,
        "user": "timmy@toolbox.com",
        "account_id": 987654,
        "account": "My Account",
        "recipient": "639998887777",
        "message": "Your OTP code is now 332200. Please use it quickly!",
        "code": 332200,
        "sender_name": "MySenderName",
        "network": "Globe",
        "status": "Pending",
        "type": "Single",
        "source": "Api",
        "created_at": "2020-01-01 01:01:01",
        "updated_at": "2020-01-01 01:01:01",
    }
]
            
            
If you do not provide the placeholder, the OTP code will be appended to your original message. For instance if you send the message "Thanks for registering" the message will have the OTP appended to the end as "Thanks for registering. Your One Time Password is XXXXXX"

curl --data "apikey=YOUR_API_KEY&number=MOBILE_NUMBER&message=Thanks for registering. Your OTP Code is {otp}." https://semaphore.co/api/v4/otp
Please note that this service is designed for OTP traffic only. Please do not use this route to send regular messages.

Retrieving Messages
To retrieve outgoing SMS messages, send an HTTP GET request to:

 https://api.semaphore.co/api/v4/messages

Note: This endpoint is limited to being called 30 times per minute

Parameter	Description	Required
apikey	Please login to access your API key	YES
limit	Defines the number of messages to retrieve per request. The default is 100. Max is 1000.	No
page	Specifies which page of the results to return. The default is 1.	No
startDate	Limits messages to the specified period defined by startDate and endDate. Format is "YYYY-MM-DD"	No
endDate	Limits messages to the specified period defined by startDate and endDate. Format is "YYYY-MM-DD"	No
network	Return only messages sent to the specified network. Format is lowercase (e.g. "globe", "smart")	No
status	Return only messages with the specified status. Format is lowercase (e.g. "pending", "success")	No
The format of the message(s) that match your filter is the same received when sending messages.

To retrieve a single outgoing SMS message by its unique id, send an HTTP GET request to:

 https://api.semaphore.co/api/v4/messages/{id}

The format of the single message that matches the id provided is the same received when sending messages.

Retrieving Your Account
To retrieve basic information about your account, send an HTTP GET request to:

 https://api.semaphore.co/api/v4/account

Note: This endpoint is limited to being called 2 times per minute

Parameter	Description	Required
apikey	Please login to access your API key	Yes
This call returns a JSON response containing the following parameters for the account:

Parameter	Description
account_id	The unique identifier for your account
account_name	The company name listed on your account
status	The status of your account
credit_balance	The credit balance of your account. Each credit equals one SMS.
To retrieve transaction information about your account, send an HTTP GET request to:

 https://api.semaphore.co/api/v4/account/transactions

Note: This endpoint is limited to being called 2 times per minute

Parameter	Description	Required
apikey	Please login to access your API key	Yes
limit	Defines the number of transactions to retrieve per request. The default is 100. Max is 1000.	No
page	Specifies which page of the results to return. The default is 1.	No
This call returns a JSON response containing the following parameters for the account:

Parameter	Description
account_id	The unique identifier for your account
account_name	The company name listed on your account
status	The status of your account
credit_balance	The credit balance of your account. Each credit equals one SMS.
To retrieve Sender Names associated with your account, send an HTTP GET request to:

 https://api.semaphore.co/api/v4/account/sendernames

Note: This endpoint is limited to being called 2 times per minute

Parameter	Description	Required
apikey	Please login to access your API key	Yes
limit	Defines the number of results to retrieve per request. The default is 100. Max is 1000.	No
page	Specifies which page of the results to return. The default is 1.	No
This call returns a JSON response containing the following parameters for the account:

Parameter	Description
name	The sender name value
status	The status of the sender name
created_at	The date the sender name was created
Note: This endpoint is limited to being called 2 times per minute

To retrieve users associated with your account, send an HTTP GET request to:

 https://api.semaphore.co/api/v4/account/users

Note: This endpoint is limited to being called 2 times per minute

Parameter	Description	Required
apikey	Please login to access your API key	Yes
limit	Defines the number of results to retrieve per request. The default is 100. Max is 1000.	No
page	Specifies which page of the results to return. The default is 1.	No
This call returns a JSON response containing the following parameters for the account:

Parameter	Description
user_id	The unique identifier for the user
email	The email address for the user
role	The user's role on your account
status	The status of the user
Composer Package
If your PHP project uses Composer, check out the Semaphore Client for a quick and easy way to start using Semaphore right now.

Code Examples
PHP
Ruby
Python
.NET
cURL
If your PHP project uses Composer, check out the Semaphore Client for a quick and easy way to start using Semaphore right now.

PHP has support for the cURL library.


$ch = curl_init();
$parameters = array(
    'apikey' => '', //Your API KEY
    'number' => '09998887777',
    'message' => 'I just sent my first message with Semaphore',
    'sendername' => 'SEMAPHORE'
);
curl_setopt( $ch, CURLOPT_URL,'https://semaphore.co/api/v4/messages' );
curl_setopt( $ch, CURLOPT_POST, 1 );

//Send the parameters set above with the request
curl_setopt( $ch, CURLOPT_POSTFIELDS, http_build_query( $parameters ) );

// Receive response from server
curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
$output = curl_exec( $ch );
curl_close ($ch);

//Show the server response
echo $output;
                    