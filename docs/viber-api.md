Send Message
The send_message API allows accounts to send messages to Viber users who subscribe to the account. Sending a message to a user will be possible only after the user has subscribed to the bot. (see subscribed callback for additional information). You can share your bot with the users via a deeplink.

The API supports a variety of message types: text, picture, video, file, location, sticker, contact, carousel content and URL. Specific post data examples and required parameters for each message type are given below.

Validation

Maximum total JSON size of the request is 30kb.

Resource URL
Copy
https://chatapi.viber.com/pa/send_message
General send message parameters
The following parameters are available for all message types:

Name	Description	Validation
receiver	Unique Viber user id	required, subscribed valid user id
type	Message type	required. Available message types: text, picture, video, file, location, contact, sticker, carousel content and url
sender.name	The sender’s name to display	required. Max 28 characters
sender.avatar	The sender’s avatar URL	optional. Avatar size should be no more than 100 kb. Recommended 720x720
tracking_data	Allow the account to track messages and user’s replies. Sent tracking_data value will be passed back with user’s reply	optional. max 4096 characters
min_api_version	Minimal API version required by clients for this message (default 1)	optional. client version support the API version. Certain features may not work as expected if set to a number that’s below their requirements.
Response
Response parameters

Name	Description	Possible values
status	Action result	0 for success. In case of failure - appropriate failure status number. See error codes table for additional information
status_message	ok or failure reason	Success: ok.
Failure: invalidAuthToken, badData, missingData and failure. See error codes table for additional information.
Http code 404: Requesting an invalid URL.
message_token	Unique ID of the message	 
chat_hostname	Internal use	 
billing_status	An indication of how this message is categorized for billing purposes, allowing you to know if it was charged or not	An integer between 0 and 5. See below an explanation for all possible values.
Below you can find the possible values for the billing_status parameter:

Value	Description
0	Default for all cases other than the ones listed below: chat extension, reply to open conversation, etc.
1	1:1 message/keyboard sent in a session
2	1:1 message/keyboard sent in a session
3	Free out of session 1:1 message/keyboard
4	Free out of session 1:1 message/keyboard
5	Charged out of session 1:1 message/keyboard
Response example:

Copy
{
   "status":0,
   "status_message":"ok",
   "message_token":5741311803571721087,
   "chat_hostname":"SN-CHAT-05_",
   "billing_status":1
}
Message types
Below is a list of all supported message types with post data examples.

Text message
Post data
Copy
{
   "receiver":"01234567890A=",
   "min_api_version":1,
   "sender":{
      "name":"John McClane",
      "avatar":"https://avatar.example.com"
   },
   "tracking_data":"tracking data",
   "type":"text",
   "text":"Hello world!"
}
Post parameters

Name	Description	Validation
type	Message type	required. text. Supports text formatting
text	The text of the message	required. Max length 7,000 characters
Picture message
Post data
Copy
{  
   "receiver":"01234567890A=",
   "min_api_version":1,
   "sender":{  
      "name":"John McClane",
      "avatar":"https://avatar.example.com"
   },
   "tracking_data":"tracking data",
   "type":"picture",
   "text":"Photo description",
   "media":"https://www.images.com/img.jpg",
   "thumbnail":"https://www.images.com/thumb.jpg"
}
Post parameters

Name	Description	Validation
type	Message type	required. picture
text	Description of the photo. Can be an empty string if irrelevant	required. Max 768 characters
media	URL of the image (JPEG, PNG, non-animated GIF)	required. The URL must have a resource with a .jpeg, .png or .gif file extension as the last path segment. Example: https://www.example.com/path/image.jpeg. Max image size: 1MB on iOS, 3MB on Android. Note GIFs are only static. To send animated GIFs please check URL message
thumbnail	URL of a reduced size image (JPEG, PNG, GIF)	optional. Recommended: 400x400. Max size: 100kb.
Video message
Post data
Copy
{  
   "receiver":"01234567890A=",
   "min_api_version":1,
   "sender":{  
      "name":"John McClane",
      "avatar":"https://avatar.example.com"
   },
   "tracking_data":"tracking data",
   "type":"video",
   "media":"https://www.images.com/video.mp4",
   "thumbnail":"https://www.images.com/thumb.jpg",
   "size":10000,
   "duration":10
}
Post parameters

Name	Description	Validation
type	Message type	required. video
media	URL of the video (MP4, H264)	required. Max size 26 MB. Only MP4 and H264 are supported. The URL must have a resource with a .mp4 file extension as the last path segment. Example: https://www.example.com/path/video.mp4
size	Size of the video in bytes	required
duration	Video duration in seconds; will be displayed to the receiver	optional. Max 180 seconds
thumbnail	URL of a reduced size image (JPEG)	optional. Max size 100 kb. Recommended: 400x400. Only JPEG format is supported
File message
Post data
Copy
{  
   "receiver":"01234567890A=",
   "min_api_version":1,
   "sender":{  
      "name":"John McClane",
      "avatar":"https://avatar.example.com"
   },
   "tracking_data":"tracking data",
   "type":"file",
   "media":"https://www.images.com/file.doc",
   "size":10000,
   "file_name":"name_of_file.doc"
}
Post parameters

Name	Description	Validation
type	Message type	required. file
media	URL of the file	required. Max size 50 MB. URL should include the file extension. See forbidden file formats for unsupported file types
size	Size of the file in bytes	required
file_name	Name of the file	required. File name should include extension. Max 256 characters (including file extension). Sending a file without extension or with the wrong extension might cause the client to be unable to open the file
Contact message
Post data
Copy
{
   "receiver":"01234567890A=",
   "min_api_version":1,
   "sender":{
      "name":"John McClane",
      "avatar":"https://avatar.example.com"
   },
   "tracking_data":"tracking data",
   "type":"contact",
   "contact":{
      "name":"Itamar",
      "phone_number":"+972511123123"
   }
}
Post parameters

Name	Description	Validation
type	Message type	required. contact 
contact.name	Name of the contact	required. Max 28 characters
contact.phone_number	Phone number of the contact	required. Max 18 characters
Location message
Post data
Copy
{
   "receiver":"01234567890A=",
   "min_api_version":1,
   "sender":{
      "name":"John McClane",
      "avatar":"https://avatar.example.com"
   },
   "tracking_data":"tracking data",
   "type":"location",
   "location":{
      "lat":"37.7898",
      "lon":"-122.3942"
   }
}
Post parameters

Name	Description	Validation
type	Message type	required. location 
location	Location coordinates	required. latitude (±90°) & longitude (±180°) within valid ranges
URL message
Post data
Copy
{
   "receiver":"01234567890A=",
   "min_api_version":1,
   "sender":{
      "name":"John McClane",
      "avatar":"https://avatar.example.com"
   },
   "tracking_data":"tracking data",
   "type":"url",
   "media":"https://www.website.com/go_here"
}
Post parameters

Name	Description	Validation
type	Message type	required. url 
media	URL, GIF	required. Max 2,000 characters
Sticker message
Post data
Copy
{
   "receiver":"01234567890A=",
   "min_api_version":1,
   "sender":{
      "name":"John McClane",
      "avatar":"https://avatar.example.com"
   },
   "tracking_data":"tracking data",
   "type":"sticker",
   "sticker_id":46105
}
Post parameters

Name	Description	Validation
type	Message type	required. sticker 
sticker_id	Unique Viber sticker ID. For examples visit the sticker IDs page	 
Rich Media message / Carousel content message
The Rich Media message type allows sending messages with pre-defined layout, including height (rows number), width (columns number), text, images and buttons.

Below you will find an exmaple of a Carousel Content Message, that allows a user to scroll through a list of items, each composed of an image, description and call to action button.



Each item on the list shown to the user is a button in the Rich Media message’s “Buttons” array. Sending one button is also permitted.

The parameters for Rich Media message and its buttons are also used for Keyboards. You can find additional information on them in the following article.

Notes:

Carousel Content Message is supported on devices running Viber version 6.7 and above.
Each button is limited to a maximum of 7 rows.
Forwarding is not supported for Rich Media messages.
ActionTypes location-picker and share-phone are not supported for Rich Media messages.
Post data
Copy
{
   "receiver":"nsId6t9MWy3mq09RAeXiug==",
   "type":"rich_media",
   "min_api_version":7,
   "rich_media":{
      "Type":"rich_media",
      "ButtonsGroupColumns":6,
      "ButtonsGroupRows":7,
      "BgColor":"#FFFFFF",
      "Buttons":[
         {
            "Columns":6,
            "Rows":3,
            "ActionType":"open-url",
            "ActionBody":"https://www.google.com",
            "Image":"https://html-test:8080/myweb/guy/assets/imageRMsmall2.png"
         },
         {
            "Columns":6,
            "Rows":2,
            "Text":"<font color=#323232><b>Headphones with Microphone, On-ear Wired earphones</b></font><font color=#777777><br>Sound Intone </font><font color=#6fc133>$17.99</font>",
            "ActionType":"open-url",
            "ActionBody":"https://www.google.com",
            "TextSize":"medium",
            "TextVAlign":"middle",
            "TextHAlign":"left"
         },
         {
            "Columns":6,
            "Rows":1,
            "ActionType":"reply",
            "ActionBody":"https://www.google.com",
            "Text":"<font color=#ffffff>Buy</font>",
            "TextSize":"large",
            "TextVAlign":"middle",
            "TextHAlign":"middle",
            "Image":"https://s14.postimg.org/4mmt4rw1t/Button.png"
         },
         {
            "Columns":6,
            "Rows":1,
            "ActionType":"reply",
            "ActionBody":"https://www.google.com",
            "Text":"<font color=#8367db>MORE DETAILS</font>",
            "TextSize":"small",
            "TextVAlign":"middle",
            "TextHAlign":"middle"
         },
         {
            "Columns":6,
            "Rows":3,
            "ActionType":"open-url",
            "ActionBody":"https://www.google.com",
            "Image":"https://s16.postimg.org/wi8jx20wl/image_RMsmall2.png"
         },
         {
            "Columns":6,
            "Rows":2,
            "Text":"<font color=#323232><b>Hanes Men's Humor Graphic T-Shirt</b></font><font color=#777777><br>Hanes</font><font color=#6fc133>$10.99</font>",
            "ActionType":"open-url",
            "ActionBody":"https://www.google.com",
            "TextSize":"medium",
            "TextVAlign":"middle",
            "TextHAlign":"left"
         },
         {
            "Columns":6,
            "Rows":1,
            "ActionType":"reply",
            "ActionBody":"https://www.google.com",
            "Text":"<font color=#ffffff>Buy</font>",
            "TextSize":"large",
            "TextVAlign":"middle",
            "TextHAlign":"middle",
            "Image":"https://s14.postimg.org/4mmt4rw1t/Button.png"
         },
         {
            "Columns":6,
            "Rows":1,
            "ActionType":"reply",
            "ActionBody":"https://www.google.com",
            "Text":"<font color=#8367db>MORE DETAILS</font>",
            "TextSize":"small",
            "TextVAlign":"middle",
            "TextHAlign":"middle"
         }
      ]
   }
}
Post parameters

Name	Description	Possible values
alt_text	Backward compatibility text	 
rich_media.ButtonsGroupColumns	Number of columns per carousel content block. Default 6 columns	1 - 6
rich_media.ButtonsGroupRows	Number of rows per carousel content block. Default 7 rows	1 - 7
rich_media.Buttons	Array of buttons	Max of 6 * ButtonsGroupColumns * ButtonsGroupRows
Button element

Name	Description	Possible values
Columns	Button column span. Default ButtonsGroupColumns	1..ButtonsGroupColumns
Rows	Button row span. Default ButtonsGroupRows	1..ButtonsGroupRows

