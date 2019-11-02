---
layout: post
title: "Sending API requests - cURL, XMLHttpRequest, and fetch"
category: 'APIs'
description: "We go over several methods for sending requests to REST APIs."
image: api-requests.jpeg
---

# Sending API Requests

Interacting with Web APIs is a big part of developing solid applications. 

In this tutorial, we will focus on REST APIs, since they are the most common and easiest to use. REST APIs are listening for HTTP requests. Below I outline three common methods for sending API requests, providing a CRUD example on a `/todos` resource.

## cURL

cURL is a command line tool for getting and sending data using a broad range of network protocols. Here we're interested in HTTP requests using cURL.

```
# Get all todos
curl -i -X GET 'https://xyzcorp.com/api/todos'

# Get todo with id '1'
curl -i -X GET 'https://xyzcorp.com/api/todos/1'

# Create a todo
curl -i -X POST \
-H "Accept: application/json" \
-H "Content-Type: application/json" \
-d '{"userId": 1, "title": "a test todo", "completed": false}' \
'https://xyzcorp.com/api/todos'

# Update a todo
curl -i -X PUT \
-H "Accept: application/json" \
-H "Content-Type: application/json" \
-d '{"completed": true}' \
'https://xyzcorp.com/api/todos/2'

# Delete a todo
curl -i -X DELETE \
'https://xyzcorp.com/api/todos/2'
```
The `-i` flag is optional and will print the response headers along with the response body. `-X` is a flag specifying the HTTP method being used. We can break up long request into several lines using `\`. `-d` flag allows you to send data in the request body.

If you are sending JSON data, then you must include a `Content-Type` header. We do so in the above requests using the `-H` flag. In the above examples we specify `-H "Content-Type: application/json; chartset=utf-8"` to let the receiving server know that we're sending data in JSON format.

The default `Content-Type` for cURL `POST` and `PUT` requests is `application/x-www-form-urlencoded` or `multipart/form-data`, which means data is structured like URL query parameters: `-d "userId=1&title=a test todo&completed=false"`

## XMLHttpRequest

XMLHttpRequest or XHR is part of the browser APIs available to the developer, that enables the retrieval of data from a URL without refreshing the page.

```
# Initialize XHR object
var xhr = new XMLHttpRequest()
xhr.onload = function () {
	console.log(xhr.response)
	console.log(xhr.status)
}

# Get all todos
xhr.open('GET', 'https://xyzcorp.com/api/todos')
xhr.send()

# Get todo with id '1'
xhr.open('GET', 'https://xyzcorp.com/api/todos/1')
xhr.send()

# Create a todo
xhr.open('POST', 'https://xyzcorp.com/api/todos')
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
xhr.send("userId=1&title=a test todo&completed=false")

# Update a todo
xhr.open('PUT', 'https://xyzcorp.com/api/todos/2')
xhr.setRequestHeader('Content-Type', 'application/json')
xhr.send(JSON.stringify({completed: false}))

# Delete a todo
xhr.open('DELETE', 'https://xyzcorp.com/api/todos/2')
xhr.send()
```
In the above examples, we're re-using the same XHR object to fulfill the different request types, but you could have instantiated a new object for each one. The `onload` property on the XHR object is assigned a callback function that will be executed when the request completes successfully. In our example, the callback function merely prints out to console the response body and status code.

There are additional callbacks that can be registered for `onerror` (when the transaction / request fails) and `onprogress` (executed throughout request, but before completion).

The first step on each CRUD example is to call the `open` method and ***initialize the request***. Above we are specifying the HTTP method (GET, POST, PUT, DELETE), followed by the URL. After initialization, we call the `send` method to send the request to the server. By default, XHR sends all requests *asynchronously*, but you can override this by providing `false` as an additional parameter to the `open` method after the URL.

For `PUT` and `POST` requests, `send` accepts an optional parameter for the body of the request.

The default `Content-Type` for XHR request body is `text/plain;charset=UTF-8`. For PUT and POST requests that are sending data, we need to specify the MIME type. The `POST` request was sent using `Content-Type: application/x-www-form-urlencoded` and the `PUT` request was sent using `Content-Type: application/json`.

By default, the `Accept` header sends `"*/*"` which tells the server it accepts any response MIME type, but you could change this to `Accept: application/json` to indicate the desired MIME type for the response.

For more on XMLHttpRequest object [visit](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) the Mozilla documentation.

## Fetch

Fetch is another browser API available for making asynchronous requests similar to XMLHttpRequest, but offers a simpler interface and more powerful feature set.

```
const responseHandler = (response) => {
	console.log(response.status)
	response.json().then(data => {
		console.log(data)
	})
}

# Get all todos
fetch('https://xyzcorp.com/api/todos')
	.then(responseHandler)

# Get todo with id '1'
fetch('https://xyzcorp.com/api/todos/1')
	.then(responseHandler)

# Create a todo
fetch('https://xyzcorp.com/api/todos', {
		method: 'POST',
		body: JSON.stringify({"userId": 1, "title": "a test todo", "completed": false}),
		headers: {
			"Content-type": "application/json; charset=UTF-8"
		}
	})
	.then(responseHandler)

# Update a todo
fetch('https://xyzcorp.com/api/todos/2', {
		method: 'PUT',
		body: "completed=false",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		}
	})
	.then(responseHandler)

# Delete a todo
fetch('https://xyzcorp.com/api/todos/2', {
		method: 'DELETE'
	})
	.then(responseHandler)
```
Fetch takes the URL you are requesting as the first parameter and an *optional* config object as the second parameter. It will always return a `Promise` that resolves to the `Response` object after the request is completed.

For brevity, we've defined a responseHandler function that will print to console the response status code and the response body parsed as JSON.

The Promise returned from fetch *will never reject* on HTTP error responses. It will only reject on network failure preventing the request from completing. To check the request was *successful* and not just *completed*, we must examine the response object for the `ok` (bool) or `status` (HTTP status code) properties.

Note how similarly to the other examples using cURL or XMLHttpRequest, we specify the `Content-Type` header with the MIME type of the data we're sending in the request body. For `POST` we're using `application/json` while for `PUT` we're using `application/x-www-form-urlencoded`. The data in the `body` of each request is equivalently formatted to reflect the `Content-Type` header.

The `DELETE` request has its own config object, but it only contains the HTTP method being used. There is no data being sent in the request body and therefore no need to specify the `Content-Type` header. When acting upon a specific todo resource, we specify the identifier directly in the URL of the request.

Lastly, in our responseHandler function you may notice we're executing the `json` method on the response object. This method will read the *response stream* and return a promise that resolves with the result of calling `JSON.parse`. This works because we know the response body is a JSON string! The response specs implement the `Body` mixin which includes several methods for taking a *response stream* and returning a promise that resolves with the desired data format.

## Server Responses

While we've outlined above several methods for sending CRUD requests, it's worthwhile to mention some of the response codes expected from CRUD operations.

### GET - READ
For successful GET requests the server responds with `200`.

- **200 OK**. The request has succeeded; the resource(s) has been fetched.

### POST - CREATE
For successful POST requests the server responds with a `201` or `202`.

- **201 Created**. One or more resource(s) have been created; The payload contains a description of the resource(s) created.
- **202 Accepted**. Request to create has been accepted but not yet acted upon; Noncommittal; Payload ought to provide current status and link to status monitor.

### PUT - UPDATE
For successful PUT requests the server responds with `204` or `200`.

- **200 OK**. The update was successful; The payload contains a description of the resource(s) updated.
- **204 No Content**. The update was successful; There is no content in the response payload body.

### DELETE - DELETE
For successful DELETE server responds with `204` or `200`.

- **200 OK**. The delete was successful; The payload contains a description of the resource(s) deleted.
- **204 No Content**. The delete was successful; There is no content in the response payload body.

# Summary

Interacting with APIs is an important part of your journey as a developer. Most Web APIs are built following the REST standard. This tutorial hopefully showed you several ways to send HTTP requests to perform CRUD operations on an API resource. 

Understanding how HTTP methods convey the *intention* of a request and the URI identifies a *resource*, together can be applied to interact with *endpoints* on a server.

Thank you for reading!
