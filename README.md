<<<<<<< HEAD
# CORS Problem:
### All browsers Pre-Flight requests because "Access-Control-Allow-Origin: *" is not present in the response. Hence we need to modify the browser settings to be able to run such requests.

# Steps:
=======
## CORS Problem:
#### All browsers Pre-Flight requests because "Access-Control-Allow-Origin: *" is not present in the response. Hence we need to modify the browser settings to be able to run such requests.

## Steps:
>>>>>>> 40720b7b0de41de8f7170736676952e641a775ce
* Create a copy of Chrome on your desktop.
* Right-Click and select Properties
* Under Shortcut Tab -> Target:
* Append:  
` --disable-web-security --user-data-dir="C:/Chrome dev session" `  
* In this copy of Chrome, the requests will no longer be pre-flighted.  

---

<<<<<<< HEAD
# To Run the file:

#### Run rally.html in Chrome(Modified) to launch the dashboard for Rally
#### Run jira.html in Chrome(Modified) to launch the dashboard for JIRA
=======
## To Run the file:

#### Run home.html in Chrome(Modified) to launch the dashboard for Rally
#### Run test.html in Chrome(Modified) to launch the dashboard for JIRA
>>>>>>> 40720b7b0de41de8f7170736676952e641a775ce
