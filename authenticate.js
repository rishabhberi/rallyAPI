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

function createHash(username_val, password_val)
{
	token = username_val + ":" + password_val
	hash = btoa(token)
	window.sessionStorage.hash = "Basic " + hash
	return "Basic " + hash
}

function getToken()
{
	if(xhr.readyState == 4)
	{
		if(xhr.status==200)
		{
			data = JSON.parse(xhr.response)
			console.log("Security Token Generated")
			console.log(data)
			window.sessionStorage.securityToken = data.OperationResult.SecurityToken
			load.style.display = "none"
			divForm.style.display = "none"
			main.style.display = "block"
		}
		else
		{
			load.style.display = "none"
			alert("Please enter valid credentials!")
			username.value = ""
			password.value = ""
		}
	}
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
		url = 'https://rally1.rallydev.com/slm/webservice/v2.0/security/authorize'
		xhr = new XMLHttpRequest()
		xhr.onreadystatechange = getToken
		xhr.open("GET",url,true)
		xhr.setRequestHeader("Authorization", createHash(username_val, password_val))
		xhr.send()
		load.style.display = "block"
	}
}

function resetFields()
{
	username.value = ""
	password.value = ""
}

function addTask(details)
{
	table = document.getElementById("table")
	row = document.createElement("tr")
	for(j = 0; j < details.length; j++)
	{
		row_data = document.createElement("td")
		row_data.textContent = details[j]
		row.appendChild(row_data)
	}
	table.appendChild(row)
}

function getTaskDetails()
{
	if(xhr.readyState == 4 && xhr.status == 200)
	{
		data = JSON.parse(xhr.response)
		console.log("Tasks for User Story Fetched")
		console.log(data)
		taskCount = data.QueryResult.TotalResultCount

		tasks = data.QueryResult.Results
		table = document.getElementById("table")
		table.innerHTML = "<tr><th>Task ID</th><th>Name</th><th>Owner</th><th>State</th></tr>"
		for (i = 0; i < taskCount; i++) 
		{
			task = tasks[i]
			taskName = task.Name
			taskID = task.FormattedID
			taskOwner = task.Owner._refObjectName
			taskState = task.State
			addTask([taskID, taskName, taskOwner, taskState])
		}
		load.style.display = "none"
		userStoryData.style.display = "block"
	}
}

function getStoryDetails()
{
	if(xhr.readyState == 4 && xhr.status == 200)
	{
		data = JSON.parse(xhr.response)
		console.log("User Story Details Fetched")
		console.log(data)
		storyDescription = data.HierarchicalRequirement.Description
		storyOwner = data.HierarchicalRequirement.Owner._refObjectName
		document.getElementById("descVal").innerHTML = storyDescription
		document.getElementById("ownerVal").textContent = storyOwner
		taskURL = data.HierarchicalRequirement.Tasks._ref
		createRequest(taskURL, getTaskDetails)
	}
}

function displayDetails()
{
	if(xhr.readyState == 4)
	{
		if(xhr.status == 200)
		{
			data = JSON.parse(xhr.response)
			console.log("User Story ID Fetched")
			console.log(data)
			if(data.QueryResult.TotalResultCount == 0)
			{
				alert("No Details Found For User Story Entered")
				load.style.display = "none"
				return
			}
			storyURL = data.QueryResult.Results[0]._ref
			storyName = data.QueryResult.Results[0]._refObjectName
			// userStoryData.style.display = "block"
			document.getElementById("nameVal").textContent = storyName
			createRequest(storyURL, getStoryDetails)
		}
	}
}

// function getIterationID()
// {
// 	if(xhr.readyState == 4 && xhr.status == 200)
// 	{
// 		data = JSON.parse(xhr.response)
// 		console.log(data)
// 		iterationURL = data.HierarchicalRequirement.Iteration._ref
// 		iterationID = iterationURL.split('/')[-1]
// 		url = "https://rally1.rallydev.com/slm/analytics/reports/4/run?ITERATIONS=" + iterationID

// 	}
// }

function fetchIteration()
{
	if(xhr.readyState == 4 && xhr.status == 200)
	{
		data = JSON.parse(xhr.response)
		console.log("Iterations for Team Fetched")
		console.log(data)
		iterationResults = data.QueryResult.Results
		for (var i = 0; i < iterationResults.length; i++)
		{
			option = document.createElement("option")
			ref = iterationResults[i]._ref
			temp = ref.split('/')
			option.value = temp[temp.length-1]
			option.textContent = iterationResults[i].Name
			iterations.appendChild(option)
		}
		load.style.display = "none"
	}
}

function fetchTeamMembers()
{
	if(xhr.readyState == 4 && xhr.status == 200)
	{
		data = JSON.parse(xhr.response)
		console.log("Team Members Fetched")
		console.log(data)
		load.style.display = "none"
		teamMembersDiv.style.display = "block"
		teamMemberh2.textContent = team.value
		teamMembersList = document.getElementById("teamMembersList")
		teamMembersList.innerHTML = ""
		details = data.QueryResult.Results
		for(j = 0; j < details.length; j++)
		{
			member = document.createElement("li")
			member.textContent = details[j]._refObjectName + " (" + details[j].Role + ")"
			teamMembersList.appendChild(member)
		}
	}
}

function fetchProject()
{
	if(xhr.readyState == 4 && xhr.status == 200)
	{
		data = JSON.parse(xhr.response)
		console.log("Team ID Fetched")
		console.log(data)
		projectURL = data.QueryResult.Results[0]._ref
		if(dropDown.value == "Iteration Name")
		{
			url = projectURL + "/Iterations?pagesize=200"
			createRequest(url, fetchIteration)
		}
		else
		{
			url = projectURL + "/TeamMembers?pagesize=200"
			createRequest(url, fetchTeamMembers)
		}
	}
}

function displayBurndown()
{
	if(xhr.readyState == 4 && xhr.status == 200)
	{
		parser = new DOMParser()
		console.log("Burndown Chart Fetched")
		console.log(parser.parseFromString(xhr.response, "text/xml"))
		iframe.srcdoc = xhr.response
		load.style.display = "none"
		iframeDiv.style.display = "block"
	}
}

function fetchDetails()
{
	if(inputField.value == "")
	{
		e3.style.display ="block"
		return
	}
	load.style.display = "block"
	userStoryData.style.display = "none"
	urlgetID = 'https://rally1.rallydev.com/slm/webservice/v2.0/hierarchicalrequirement?query=(FormattedID = ' + inputField.value + ')&key=' + window.sessionStorage.securityToken
	createRequest(urlgetID, displayDetails)
}

function setRequestType()
{
	inputField.value = ""
	inputField.placeholder = dropDown.value
	team.value = ""
	userStoryData.style.display = "none"
	iframeDiv.style.display = "none"
	teamMembersDiv.style.display = "none"
	e3.style.display = "none"

	if(dropDown.value == "Iteration Name")
	{
		teamDiv.style.display = "block"
		iterationDiv.style.display = "block"
		inputField.style.display = "none"
		fetch.style.display = "none"
	}
	else if(dropDown.value == "Team Members")
	{
		teamDiv.style.display = "block"
		iterationDiv.style.display = "none"
		inputField.style.display = "none"
		fetch.style.display = "none"
	}
	else if(dropDown.value == "User Story ID")
	{
		teamDiv.style.display = "none"
		iterationDiv.style.display = "none"
		inputField.style.display = "inline"
		fetch.style.display = "inline"
	}
}

function fetchTeamDetails()
{	
	if(team.value == "")
	{
		return
	}

	userStoryData.style.display = "none"
	iframeDiv.style.display = "none"
	teamMembersDiv.style.display = "none"
	load.style.display = "block"

	iterations.innerHTML = "<option value=\"\"></option>"

	teamName = team.value
	urlGetProject = "https://rally1.rallydev.com/slm/webservice/v2.0/project?query=(Name = \"" + teamName + "\")&key=" + window.sessionStorage.securityToken
	createRequest(urlGetProject, fetchProject)
}

function fetchBurndown()
{
	if(iterations.value == "")
	{
		return
	}

	load.style.display = "block"
	iframeDiv.style.display = "none"
	iterationID = iterations.value
	teamName = team.value
	url = "https://rally1.rallydev.com/slm/analytics/reports/4/run?ITERATIONS=" + iterationID + "&TITLE=Iteration+Burndown&SUBTITLE=" + teamName
	createRequest(url, displayBurndown)
}

function init()
{
	document.body.style.display = "block"

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

	dropDown = document.getElementById("dropDown")
	dropDown.onchange = setRequestType

	console.log(window.sessionStorage.securityToken)
	if(window.sessionStorage.securityToken)
	{
		main.style.display = "block"
	}
	else
	{
		divForm.style.display = "block"
	}

	inputField = document.getElementById("inputField")
	inputField.onfocus = removeError

	fetch = document.getElementById("fetch")
	fetch.onclick = fetchDetails

	userStoryData = document.getElementById("userStoryData")
	userStoryData.style.display = "none"

	iframe = document.getElementById("iframe")
	iframeDiv = document.getElementById("iframeDiv")
	iframeDiv.style.display = "none"

	teamDiv = document.getElementById("teamDiv")
	teamDiv.style.display = "none"

	team = document.getElementById("team")
	team.onchange = fetchTeamDetails

	teamMembersDiv = document.getElementById("teamMembersDiv")	
	teamMembersDiv.style.display = "none"

	iterationDiv = document.getElementById("iterationDiv")
	iterationDiv.style.display = "none"

	iterations = document.getElementById("iterations")
	iterations.onchange = fetchBurndown

	teamMemberh2 = document.getElementById("teamMemberh2")
}