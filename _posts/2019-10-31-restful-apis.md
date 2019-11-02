---
layout: post
title: "REST API - The Basics"
category: 'APIs'
description: "We go over what is a REST API and provide some examples."
image: rest_api.png
---

# REST APIs

In this tutorial we will explain the basics of APIs, their usefulness, and what makes a REST API.

## API Basics

API stands for Application Programming Interface. It is a defined *interface* for interaction between software systems.

#### Everything has an interface... 

When you control your television via your remote control - *that is an interface*. An important part of interfacting with your TV is that you have absolutely no idea how it actually works inside. However, you do know that the power button will turn on the television, the volume buttons will increase or decrease the volume, the channel buttons will switch channels, etc. The implementation of how this is all handled internally is *abstracted* away. Only the actions and mechanisms that are important to the person handling the remote are shown. Everything else is hidden from view.

<img src="/assets/images/car-dashboard.jpg">

Your car also has an interface in the form of a steering wheel, gas, clutch, brake, etc. Internally, all the moving pieces are *abstracted* away. You never actually need to know anything about the internal implementation of how the car works.

*Back to APIs...*

So an API or Application Programming Interface is a communication protocol between client and server. There is an implicit **contract** that if the client makes a request to the server in a certain format, it can expect the server to respond in a predictable manner.

## Web APIs

Web APIs are a specific type of interface where the communication between client and server happens *over the Internet* using Web Protocols. 

There are two common standards for building Web APIs: SOAP and REST.

***SOAP*** is a messaging protocol for exchange of information between systems that uses structured XML sent over HTTP.

***REST*** is an *architectural style* that leverages HTTP protocol and defines a set of constraints for how communication should occur.

We will focus this tutorial on REST APIs. Usually when we talk about Web Services, Web APIs, or RESTful APIs, we are referring to an API built following the REST architectural standard.

## REST APIs

**Re**presentational **S**tate **T**ransfer was defined in a PHD paper by a computer science student for how communication can be exchanged between computer systems. It leverages the HTTP protocol and defines a set of constraints. That means, if we know an API was built following the REST standard, we can make assumptions based on our understanding of how REST APIs should be designed.

REST APIs define a set of *endpoints*, much like buttons on your remote TV control, that when interacted with will respond in predictable ways.

An **endpoint** is a **URI** and **HTTP method** pair, that when requested by the client to the server, will be processed, perform some action internally, and respond back to the client with a status message. Additionally, the response can contain a payload, usually in XML or JSON as these are the two most common response media types understood by Web API consumers (just another word for the clients).

Let's take a look at an example endpoint...

### Endpoint
```
GET http://www.xyzcompany.com/api/widgets
```
Let's break this endpoint down piece by piece:

- Our HTTP request begins with the GET method. There are several methods available to choose from in order to make an HTTP request. The most common are GET, POST, PUT, DELETE, but there are several others. The HTTP method used is how we communicate to the server the request's ***intention***.

- For APIs we can use either HTTP or HTTPS - the choice comes down to security. 

- Next we have the domain name, which is the human-friendly address pointing to the server. 

- Next, we have our URI starting with `/api`. This is a convention used that basically all the API endpoints should be nested within the `/api` path to distinguish them from normal Web requests. Alternatively, we could have placed our API endpoints in a *subdomain* `api.xyzcompany.com`.

- Finally, we specify the *resource* we want to interact with, in this case `/widgets`.

This is an endpoint that will retrieve *all the widgets* from the server. The server will likely return a JSON payload containing an array of widget objects.

Let's look at common operations we may perform on a resource managed by a REST API.

## CRUD

CRUD is an acronym meaning Create, Read, Update, and Delete. It represents the most common operations you would perform on a resource.

In REST APIs, HTTP methods (GET, POST, PUT, DELETE) correspond to CRUD verbs.

| HTTP VERB  | CRUD VERB |
| ------------- | ------------- |
| POST  | Create  |
| GET  | Read  |
| PUT / PATCH  | Update  |
| DELETE  | Delete  |

*Returning to our example endpoint above...*

Following this standard, we can define several **URI** and **HTTP method** pairs that perform these CRUD operations on a resource.

```
# Gets all widgets
GET http://www.xyzcompany.com/api/widgets


# Gets the widget with the id of 22
GET http://www.xyzcompany.com/api/widgets/22


# Creates a new widget
POST http://www.xyzcompany.com/api/widgets
{ price: "25$", quality: "premium" }


# Updates widget with id of 20 
PUT http://www.xyzcompany.com/api/widgets/20
{ price: "15$" }


# Deletes the widget with id 10
DELETE http://www.xyzcompany.com/api/widgets/10
```
Pay close attention to the *intention* of the request represented by the HTTP method used. Also notice how we change the URI to include the **id** when we are specifying an *individual* widget. For update (PUT) and create (POST) operations, notice how we are required to send additional information in the request body that contains the relevant data. 

Hopefully, you can decipher what each request is doing - that's precisely why REST is so powerful. It is an easy way to specify the *resource* you want to manage in the URI of the request and the *intention* using the HTTP method. All REST APIs follow this convention!

# Summary

REST defines a convention for communication allowing servers listening for HTTP requests to expose services and resources. Clients (or consumers) send requests following this convention, utilizing standard HTTP protocols, and perform operations on the resources exposed by the Web Service. The most common operations are CRUD operations - create, read, update, and delete. Each of these operations corresponds to an HTTP method that conveys the intention of the request. The URI of the request specifies the resource being managed.

Hopefully by now you have a basic understanding of REST APIs from this blog post. Thank you for visiting!