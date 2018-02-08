username = 'rishabhberi2606@gmail.com'
password = 'abcd@1234'

function createHash(username, password)
{
	token = username + ":" + password
	hash = btoa(token)
	return "Basic " + hash
}

url = 'https://rally1.rallydev.com/slm/webservice/v2.0/security/authorize'
xhr = new XMLHttpRequest()
xhr.onreadystatechange = callback
xhr.open("GET",url,true)
xhr.setRequestHeader("Authorization", createHash(username, password))
xhr.send()

function callback()
{
	// alert(xhr.readyState)
	if(xhr.readyState==4 && xhr.status==200)
	{
		console.log(xhr.response)
		data = JSON.parse(xhr.response)
		console.log(data.OperationResult.SecurityToken)
	}
}