function createRequest(url, callback)
{
	xhr = new XMLHttpRequest()
	xhr.onreadystatechange = callback
	xhr.withCredentials = true
	xhr.open("GET", url, true)
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
			console.log(xhr.response)
			securityToken = JSON.parse(xhr.response).OperationResult.SecurityToken
			window.sessionStorage.setItem("securityToken", securityToken)
			// window.sessionStorage.setItem("username", username.value)
			// window.sessionStorage.setItem("password", password.value)
			load.style.display = "none"
			div_form.style.display = "none"
			main.style.display = "block"
		}
		else
		{
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
		console.log(data)
		taskCount = data.QueryResult.TotalResultCount
		// document.getElementById("taskCount").textContent = taskCount

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
		main_data.style.display = "block"
	}
}

function getStoryDetails()
{
	if(xhr.readyState == 4 && xhr.status == 200)
	{
		data = JSON.parse(xhr.response)
		console.log(data)
		storyDescription = data.HierarchicalRequirement.Description
		storyOwner = data.HierarchicalRequirement.Owner._refObjectName
		document.getElementById("desc_val").innerHTML = storyDescription
		document.getElementById("owner_val").textContent = storyOwner
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
			console.log(xhr.response)
			data = JSON.parse(xhr.response)
			if(data.QueryResult.TotalResultCount == 0)
			{
				alert("No Details Found For User Story Entered")
				return
			}
			storyURL = data.QueryResult.Results[0]._ref
			storyName = data.QueryResult.Results[0]._refObjectName
			// main_data.style.display = "block"
			document.getElementById("name_val").textContent = storyName
			createRequest(storyURL, getStoryDetails)
		}
	}
}

function displayBurndown()
{
	if(xhr.readyState == 4 && xhr.status == 200)
	{
		console.log(xhr.response)
		iframe.srcdoc = xhr.response
		load.style.display = "none"
		iframeDiv.style.display = "block"
	}
}

function fetchDetails()
{
	if(usid.value == "")
	{
		e3.style.display ="block"
		return
	}
	main_data.style.display = "none"
	iframeDiv.style.display = "none"
	load.style.display = "block"
	if(dropDown.value == "User Dtory ID")
	{
		urlgetID = 'https://rally1.rallydev.com/slm/webservice/v2.0/hierarchicalrequirement?query=(FormattedID%20%3D%20' + usid.value + ')&key=' + window.sessionStorage.securityToken
		createRequest(urlgetID, displayDetails)
	}
	else if(dropDown.value == "Iteration ID")
	{
		urlgetID = "https://rally1.rallydev.com/slm/analytics/reports/4/run?ITERATIONS=" + usid.value
		createRequest(urlgetID, displayBurndown)
	}
}

function setRequestType()
{
	console.log(dropDown.value)
	usid.placeholder = dropDown.value
}

function init()
{
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

	document.getElementById("load_img").src = "tenor.gif"

	div_form = document.getElementById("div_form")
	div_form.style.display = "none"

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
		div_form.style.display = "block"
	}

	usid = document.getElementById("usid")
	usid.onfocus = removeError

	fetch = document.getElementById("fetch")
	fetch.onclick = fetchDetails

	main_data = document.getElementById("main_data")
	main_data.style.display = "none"

	iframe = document.getElementById("iframe")
	iframeDiv = document.getElementById("iframeDiv")
	iframeDiv.style.display = "none"
}

// https://rally1.rallydev.com/slm/analytics/reports/4/run?ITERATIONS=127017850756%2C127017852112%2C127017853684%2C127018766752
// For Transformers, Strikers, Bullets, Odin