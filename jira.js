function createRequest(url, callback)
{
	xhr = new XMLHttpRequest()
	xhr.onreadystatechange = callback
	xhr.withCredentials = true
	xhr.open("GET", encodeURI(url), true)
	xhr.setRequestHeader("Authorization", window.sessionStorage.hash)
	xhr.send()
}

function removeError()
{
	e1.style.display = "none"
	e2.style.display = "none"
	e3.style.display = "none"
}

function setEventEnter(element)
{
	document.onkeydown = function(event)
	{
		e = event || window.event
		keycode = event.which || event.keyCode
		if(keycode == 13)
		{
			element.focus()
			element.click()
		}
	}	
}

function getToken()
{
	if(xhr.readyState == 4)
	{
		if(xhr.status == 200)
		{
			data = JSON.parse(xhr.response)
			console.log("Security Token Generated")
			console.log(data)
			window.sessionStorage.sessionToken = data.session.value
			load.style.display = "none"
			divForm.style.display = "none"
			main.style.display = "block"
			document.onkeydown = null
			setEventEnter(fetch)
		}
		else
		{
			console.log(xhr)
			load.style.display = "none"
			alert("Please enter valid credentials!")
			username.value = ""
			password.value = ""
		}
	}
}

function createHash(username_val, password_val)
{
	token = username_val + ":" + password_val
	hash = btoa(token)
	window.sessionStorage.hash = "Basic " + hash
	return "Basic " + hash
}

function authenticate()
{
	error_flag = false
	username_val = username.value
	password_val = password.value

	if (username_val == "")
	{
		document.getElementById("e1").style.display = "block"
		error_flag = true
	}
	if (password_val == "")
	{
		document.getElementById("e2").style.display = "block"
		error_flag = true
	}

	if(!error_flag)
	{
		// url = 'http://'+username_val+':'+password_val+'@asjira.sabre.com/rest/auth/1/session'
		// url = 'http://asjira.sabre.com/rest/auth/1/session'
		url = base_url + "auth/1/session"
		jsonObject = {"username": username_val, "password": password_val}
		string = "username="+username_val+"&password="+password_val
		xhr = new XMLHttpRequest()
		xhr.onreadystatechange = getToken
		xhr.open("POST",url,true)
		xhr.withCredentials = true
		// xhr.setRequestHeader("Accept", "application/json")
		xhr.setRequestHeader("Content-Type", "application/json")
		xhr.setRequestHeader("Authorization", createHash(username_val, password_val))
		// xhr.setRequestHeader('Access-Control-Allow-Origin', 'http://asjira.sabre.com/');
		xhr.send(JSON.stringify(jsonObject))
		load.style.display = "block"
	}
}

function resetFields()
{
	username.value = ""
	password.value = ""
}

function displayJiraDetails()
{
	if(xhr.readyState == 4)
	{
		if(xhr.status == 200)
		{
			data = JSON.parse(xhr.response)
			console.log(data)
			load.style.display = "none"

			document.getElementById("jiraKey").textContent = data.key
			document.getElementById("project").textContent = data.fields.project.name
			document.getElementById("jiraName").textContent = data.fields.summary
			document.getElementById("jiraType").textContent = data.fields.issuetype.name
			document.getElementById("priority").textContent = data.fields.priority.name
			document.getElementById("status").textContent = data.fields.status.name
			if(data.fields.assignee)
				document.getElementById("assignee").innerHTML = data.fields.assignee.displayName + "&nbsp;(" + data.fields.assignee.name + ")"
			else
				document.getElementById("assignee").innerHTML = ""
			if(data.fields.creator)
				document.getElementById("creator").innerHTML = data.fields.creator.displayName + "&nbsp;(" + data.fields.creator.name + ")"
			else
				document.getElementById("creator").innerHTML = ""
			if(data.fields.reporter)
				document.getElementById("reporter").innerHTML = data.fields.reporter.displayName + "&nbsp;(" + data.fields.reporter.name + ")"
			else
				document.getElementById("reporter").innerHTML = ""

			versions = data.fields.versions
			versionNames = new Array()
			for (var i = 0; i < versions.length; i++) {
				versionNames.push(versions[i].name)
			}
			document.getElementById("versions").textContent = versionNames.join(", ")

			document.getElementById("descVal").innerHTML = "<pre>" + data.fields.description + "</pre>"

			commentsTable = document.getElementById("commentsData")
			commentsTable.innerHTML = ""
			comments = data.fields.comment.comments
			if(comments.length == 0)
			{
				document.getElementById("comments").style.display = "none"
			}
			else
			{
				document.getElementById("comments").style.display = "block"
				for (i = 0; i < comments.length; i++) 
				{
					author = comments[i].author.displayName + "<br>(" + comments[i].author.name + ")"
					comment = "<pre>" + comments[i].body + "</pre>"
					row = document.createElement("tr")
					col1 = document.createElement("td")
					col2 = document.createElement("td")
					col1.innerHTML = author
					col2.innerHTML = comment
					row.appendChild(col1)
					row.appendChild(col2)
					commentsTable.appendChild(row)
				}
			}

			attachmentsTable =document.getElementById("attachmentsData")
			attachmentsTable.innerHTML = ""
			attachments = data.fields.attachment
			if(attachments.length == 0)
			{
				document.getElementById("attachments").style.display = "none"
			}
			else
			{
				document.getElementById("attachments").style.display = "block"
				for (i = 0; i < attachments.length; i++) 
				{
					author = attachments[i].author.displayName + "<br>(" + attachments[i].author.name + ")"
					row = document.createElement("tr")
					col1 = document.createElement("td")
					col2 = document.createElement("td")
					link = document.createElement("a")
					link.href = attachments[i].content
					link.target = "_blank"
					link.textContent = attachments[i].filename
					col1.innerHTML = author
					col2.appendChild(link)
					row.appendChild(col1)
					row.appendChild(col2)
					attachmentsTable.appendChild(row)
				}
			}

			jiraData.style.display = "block"
		}
		else
		{
			console.log(xhr)
			load.style.display = "none"
			alert("No Issue Found with JIRA ID: " + inputField.value)
		}
	}
}

function fetchJiraDetails()
{
	inputField_val = inputField.value
	if(inputField_val == "")
	{
		e3.style.display = "block"
		return
	}
	load.style.display = "block"
	jiraData.style.display = "none"
	jira_url = base_url + "api/2/issue/" + inputField_val
	createRequest(jira_url, displayJiraDetails)
}

function populateStatus()
{
	if(xhr.readyState == 4)
	{
		if(xhr.status == 200)
		{
			statuses = JSON.parse(xhr.response)

			console.log(statuses)
			for (var i = 0; i < statuses.length; i++) {
				option = document.createElement("option")
				option.value = statuses[i].id
				option.innerHTML = statuses[i].name
				statusSelect.appendChild(option)
			}
			load.style.display = "none"
			statusDiv.style.display = "inline"
		}
		else
		{			
			alert("Unable to Process Request\nStatus: "+xhr.status)
		}
	}
}

function populatePriority()
{
	if(xhr.readyState == 4)
	{
		if(xhr.status == 200)
		{
			priorities = JSON.parse(xhr.response)

			statusUrl = base_url + "api/2/status"
			createRequest(statusUrl, populateStatus)

			console.log(priorities)
			for (var i = 0; i < priorities.length; i++) {
				option = document.createElement("option")
				option.value = priorities[i].id
				option.innerHTML = priorities[i].name
				prioritySelect.appendChild(option)
			}
			priorityDiv.style.display = "inline"
		}
		else
		{			
			alert("Unable to Process Request\nStatus: "+xhr.status)
		}
	}
}

function populateProjects()
{
	if(xhr.readyState == 4)
	{
		if(xhr.status == 200)
		{
			projects = JSON.parse(xhr.response)

			priorityUrl = base_url + "api/2/priority"
			createRequest(priorityUrl, populatePriority)

			console.log(projects)
			for (var i = 0; i < projects.length; i++) {
				option = document.createElement("option")
				option.value = projects[i].key
				option.innerHTML = projects[i].key
				projectSelect.appendChild(option)
			}
			projectDiv.style.display = "inline"
		}
		else
		{
			alert("Unable to Process Request\nStatus: "+xhr.status)
		}
	}
}

function setRequestType()
{
	inputField.value = ""
	jiraData.style.display = "none"
	issueTableDiv.style.display = "none"
	e3.style.display = "none"
	document.onkeydown = null

	if(dropDown.value == "Project Specific Issues")
	{
		inputField.style.display = "none"
		fetch.style.display = "none"
		projectUrl = base_url + "api/2/project"
		load.style.display = "block"
		projectIssues.style.display = "block"
		createRequest(projectUrl, populateProjects)
	}
	else if(dropDown.value == "JIRA ID")
	{
		inputField.style.display = "inline"
		inputField.placeholder = dropDown.value
		issueTableDiv.style.display = "none"
		fetch.style.display = "inline"
		projectIssues.style.display = "none"
		setEventEnter(fetch)
	}
}

function insertIssue(issueDetails)
{
	row = document.createElement("tr")
	for(j = 0; j < issueDetails.length; j++)
	{
		row_data = document.createElement("td")
		row_data.innerHTML = issueDetails[j]
		row.appendChild(row_data)
	}
	issueTableData.appendChild(row)
}

function displayAllIssues()
{
	if(xhr.readyState == 4)
	{
		if(xhr.status == 200)
		{
			data = JSON.parse(xhr.response)
			console.log(data)

			issues = data.issues
			for (var i = 0; i < issues.length; i++) {
				issueDetails = new Array()
				issueDetails.push(i+1)
				issueDetails.push(issues[i].key)
				issueDetails.push("<pre>"+issues[i].fields.summary+"</pre>")
				issueDetails.push(issues[i].fields.project.name)
				issueDetails.push(issues[i].fields.priority.name)
				issueDetails.push(issues[i].fields.status.name)
				insertIssue(issueDetails)
			}

			load.style.display = "none"
			issueTableDiv.style.display = "block"
		}
		else
		{
			alert("Unable to Process Request\nStatus: "+xhr.status)
		}
	}
}

function fetchAllIssues()
{
	issueTableDiv.style.display = "none"
	load.style.display = "block"
	issueTableData.innerHTML = ""

	searchUrl = base_url + "api/2/search?maxResults=" + maxResults
	if(projectSelect.value != "" || prioritySelect.value != "" || statusSelect.value != "")
	{
		searchUrl += "&jql="
		if(projectSelect.value != "")
		{
			searchUrl += "project=\"" + projectSelect.value + "\""
			if(prioritySelect.value != "" || statusSelect.value != "")
			{
				searchUrl += " AND "
			}
		}
		if(prioritySelect.value != "")
		{
			searchUrl += "priority=" + prioritySelect.value
			if(statusSelect.value != "")
			{
				searchUrl += " AND "
			}
		}
		if(statusSelect.value != "")
		{
			searchUrl += "status=" + statusSelect.value
		}
	}
	console.log(searchUrl)
	createRequest(searchUrl, displayAllIssues)
}

function init()
{
	document.body.style.display = "block"
	base_url = "http://ptjira.sabre.com/rest/"

	e1 = document.getElementById("e1")
	e2 = document.getElementById("e2")
	e3 = document.getElementById("e3")
	e1.style.display = "none"
	e2.style.display = "none"
	e3.style.display = "none"

	username = document.getElementById("username")
	password = document.getElementById("password")
	username.onfocus = removeError
	password.onfocus = removeError

	submit = document.getElementById("submit")
	submit.onclick = authenticate

	reset = document.getElementById("reset")
	reset.onclick = resetFields

	load = document.getElementById("load")
	load.style.display = "none"

	document.getElementById("loadImg").src = "tenor.gif"

	divForm = document.getElementById("divForm")
	divForm.style.display = "none"

	main = document.getElementById("main")
	main.style.display = "none"

	fetch = document.getElementById("fetch")
	fetch.onclick = fetchJiraDetails

	console.log(window.sessionStorage.sessionToken)
	if(window.sessionStorage.sessionToken)
	{
		main.style.display = "block"
		setEventEnter(fetch)
	}
	else
	{
		divForm.style.display = "block"
		setEventEnter(submit)
	}

	inputField = document.getElementById("inputField")
	inputField.onfocus = removeError

	jiraData = document.getElementById("jiraData")
	jiraData.style.display = "none"

	dropDown = document.getElementById("dropDown")
	dropDown.onchange = setRequestType

	projectIssues = document.getElementById("projectIssues")
	projectIssues.style.display = "none"

	projectDiv = document.getElementById("projectDiv")
	projectDiv.style.display = "none"

	projectSelect = document.getElementById("projectSelect")
	projectSelect.onchange = fetchAllIssues

	priorityDiv = document.getElementById("priorityDiv")
	priorityDiv.style.display = "none"

	prioritySelect = document.getElementById("prioritySelect")
	prioritySelect.onchange = fetchAllIssues

	statusDiv = document.getElementById("statusDiv")
	statusDiv.style.display = "none"

	statusSelect = document.getElementById("statusSelect")
	statusSelect.onchange = fetchAllIssues

	issueTableDiv = document.getElementById("issueTableDiv")
	issueTableDiv.style.display = "none"

	issueTableData = document.getElementById("issueTableData")

	maxResults = 50
}