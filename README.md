## CORS Problem:
#### All browsers Pre-Flight requests because "Access-Control-Allow-Origin: *" is not present in the response. Hence we need to modify the browser settings to be able to run such requests.

## Steps:
* Create a copy of Chrome on your desktop.
* Right-Click and select Properties
* Under Shortcut Tab -> Target:
* Append:  
` --disable-web-security --user-data-dir="C:/Chrome dev session" `  
* In this copy of Chrome, the requests will no longer be pre-flighted.  

---

## To Run the file:

#### Run home.html in Chrome(Modified) to launch the dashboard for Rally
#### Run test.html in Chrome(Modified) to launch the dashboard for JIRA
