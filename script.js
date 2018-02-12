us_username = "raveesh.mittal@sabre.com"
us_password = "qwerty9182*"
us_storyID = "US202020"
SecurityToken=""
userStoryURL=""
userStoryName=""
userStoryDescription=""
userStoryOwner=""
key=""
dots = 0
// user_story_name = document.getElementById("user-story-name")
// user_story_description = document.getElementById("user-story-description")
// user_story_owner = document.getElementById("user-story-owner")
// user_story_name.style.visibility="hidden"
// user_story_description.style.visibility="hidden"
// user_story_owner.style.visibility="hidden"
outer = document.getElementById("main-body")
table = document.getElementById("tasks-table")
table_body = document.getElementById("tasks-table-body")
load = document.getElementById("outer-load")
outer.style.visibility = "hidden"
table.style.visibility = "hidden"
load.style.visibility = "hidden"

function createHash()
{
	token = us_username + ":" + us_password
	hash = btoa(token)
	return "Basic " + hash
}



function sendRequest(){
	url = 'https://rally1.rallydev.com/slm/webservice/v2.0/security/authorize'
//url = 'https://rally1.rallydev.com/slm/webservice/v2.0/HierarchicalRequirement/196555122176/Tasks'
//url = 'https://rally1.rallydev.com/slm/webservice/v2.0/hierarchicalrequirement?query=(FormattedID%20%3D%20US1)'
//url = 'https://rally1.rallydev.com/slm/webservice/v2.0/hierarchicalrequirement?fetch=US1'
xhr = new XMLHttpRequest()
xhr.onreadystatechange = callback
xhr.open("GET",url,true)
xhr.setRequestHeader("Authorization", createHash())
//xhr.withCredentials = false;
xhr.send()
}


function callback()
{
	// alert(xhr.readyState)
	if(xhr.readyState==4 && xhr.status==200)
	{
		//console.log(xhr.response)
		data = JSON.parse(xhr.response)
	//	console.log(data);
		SecurityToken = data.OperationResult.SecurityToken
	//	console.log(SecurityToken)
		xhr = new XMLHttpRequest()
		xhr.onreadystatechange = callback2
		//url = 'https://rally1.rallydev.com/slm/webservice/v2.0/HierarchicalRequirement/196555122176/Tasks?key=' + SecurityToken
		url = 'https://rally1.rallydev.com/slm/webservice/v2.0/hierarchicalrequirement?query=(FormattedID%20%3D%20' + us_storyID + ')&?key=' + SecurityToken
		xhr.open("GET",url,true)
		xhr.setRequestHeader("Authorization", createHash())
		xhr.send()
	}
}

function callback2(){
	if(xhr.readyState==4 && xhr.status==200)
	{
		//console.log(xhr.response)
		data = JSON.parse(xhr.response)
		//console.log(data)
		userStoryURL = data.QueryResult.Results[0]._ref;
		userStoryName = data.QueryResult.Results[0]._refObjectName
		console.log("User Story Name: ",userStoryName)
	//	console.log(userStoryURL)
		xhr = new XMLHttpRequest()
		xhr.onreadystatechange = callback3
		url = userStoryURL + '?key=' + SecurityToken
		xhr.open("GET",url,true)
		xhr.setRequestHeader("Authorization", createHash())
		xhr.send()
	}
}

function callback3(){
	if(xhr.readyState==4 && xhr.status==200){
		data = JSON.parse(xhr.response)
		console.log(data)
		userStoryDescription = data.HierarchicalRequirement.Description
		userStoryOwner = data.HierarchicalRequirement.Owner._refObjectName
		//console.log("User Story Description: ",userStoryDescription)
		console.log("User Story Owner: ",userStoryOwner)
		xhr = new XMLHttpRequest()
		xhr.onreadystatechange = callback4
		url = userStoryURL + '/Tasks?key=' + SecurityToken
		xhr.open("GET",url,true)
		xhr.setRequestHeader("Authorization", createHash())
		xhr.send()
	}
}

function callback4(){
	if(xhr.readyState==4 && xhr.status==200){
		
		data = JSON.parse(xhr.response)
	//	console.log(data)
		result = data.QueryResult.Results

		len = data.QueryResult.Results.length
		displayData(result);
		console.log("Total tasks in this user story: ",len)
		for(i=0;i<len;i++){
			console.log(data.QueryResult.Results[i].Name)
			console.log(data.QueryResult.Results[i].FormattedID)
			console.log(data.QueryResult.Results[i].Description)
			console.log(data.QueryResult.Results[i].State)
		}
	}
}

submit = document.getElementById("submit-btn");
submit.addEventListener('click',test)

function test(){
	startLoading()
	clearTable()
	outer.style.visibility = "hidden"
	table.style.visibility = "hidden"
	email = document.getElementById("email")
	password = document.getElementById("password")
	story = document.getElementById("uid")
	console.log(email.value)
	console.log(password.value)
	us_username = email.value
	us_password = password.value
	us_storyID = story.value
	if(us_username !="" && us_password!="" && us_storyID!=""){
		sendRequest();
	}
}

function displayData(Results) {
	// body...
	// user_story_owner.style.visibility="visible"
	// user_story_description.style.visibility="visible"
	// user_story_name.style.visibility="visible"
	 outer.style.visibility = "visible"
	 document.getElementById("user-story-name-text").textContent = userStoryName
	 document.getElementById("user-story-description-text").innerHTML = userStoryDescription
	 document.getElementById("user-story-owner-text").textContent = userStoryOwner
	
	
	 if(Results.length>0){
	 	table.style.visibility = "visible"
	 	document.getElementById("user-story-tasks-text").textContent = Results.length
	 	for(i=0;i<Results.length;i++){
	 		 html = '<tr><td id="task-id">%act-task-id%</td><td id="task-name">%act-task-name%</td><td id="task-description">%act-task-description%</td><td id="task-state">%act-task-state%</td></tr>'
	 		 html = html.replace("%act-task-id%",Results[i].FormattedID)
	 		 html = html.replace("%act-task-name%",Results[i].Name)
	 		 html = html.replace("%act-task-description%",Results[i].Description)
	 		 html = html.replace("%act-task-state%",Results[i].State)
	 		 table_body.insertAdjacentHTML('beforeend',html)
	 	}
	 }

	 stopLoading()
}

function startLoading(){
	load.style.visibility = "visible"
	submit.disabled = true
	key = setInterval(timerFunction,200)
}

function timerFunction(){
	text = "Loading"
	for(i=0;i<dots;i++)
		text = text + "."
	load.textContent = text
	dots++
	if(dots===4)
		dots=0
}

function stopLoading(){
	dots=0
	load.style.visibility = "hidden"
	submit.disabled = false
	clearInterval(key)
}

function clearTable(){
	var new_tbody = document.createElement('tbody')
	table_body.parentNode.replaceChild(new_tbody, table_body)
	table_body = new_tbody
}