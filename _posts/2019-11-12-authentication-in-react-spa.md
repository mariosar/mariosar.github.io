---
layout: post
title: "Authentication and Authorization"
category: 'Authentication'
description: "An overview of some Authentication and Authorization methods commonly used."
image: authentication.jpg
---

# Authentication

Authentication is an important part of any application. We will go over some authentication schemes commonly used in web applications. The general purpose of this blog post is to introduce and clarify many concepts and ideas, hopefully in the process, providing a more fundamental understanding and command of the subject.

In a future blog post, I will cover security considerations and common attacks that attempt to bypass authentication and gain access or otherwise do harm to an account. There is not one single best choice of authentication architecture and you will find there are many tradeoffs to consider.

## Authentication vs. Authorization

We first should clarify the difference between authentication and authorization - two oft confused terms, usually used interchangeably, but that mean different things.

Authentication is ***an identity verification process***. It is proving *who you are*. Usually we do this by providing our username and password to the server as proof that we own a particular user account. 

Authorization, on the other hand, is ***a right to access***. A popular analogy would be a concert ticket. Anyone in possession of the ticket will be admitted to the show - regardless of who they are. Another example would be a hotel room keycard. The keycard is programmed to authorize access to a particular room in a hotel. If you are in possession of the keycard, then you can enter the room - you are authorized. The keycard makes no distinction at all as to the *bearer* of the keycard. Presumably, when you checked in at the front desk, authenticated by *showing your ID*, and paid for the room, you were granted the keycard which authorizes you to access the room. However, anyone who is the bearer of the keycard can access the room - regardless of who initially checked in.

These two terms do not need to be used in a mutually exclusive fashion and you may implement a system that is doing both simultaneously. Imagine you're driving down a road and a police car stops you. Presenting your driver's license to the officer serves as both *proof of identity* and *proof of authorization*. The driver's license has your picture and name (identity) and says you are allowed to drive on the road (authorization).

It is good to keep in mind the distinction between these two terms as we proceed.

## HTTP is a Stateless Protocol

You probably already know this fact, or at least have heard this before. It pays to delve into the meaning of this for the purpose of this article.

HTTP is purely transactional. A request is made to the server for a resource and the server will respond. After the request response cycle is completed, there is nothing carried over to future requests. Although we can make several requests in succession, each request is self contained and independent of one another.

This is what is meant when we say HTTP is a ***stateless protocol***. From the point of view of the server, each request response cycle is independent and there is nothing to link a series of requests made by the same client. As far as the server is concerned, those requests may as well have come from *different* clients altogether.

If you have just a static website, there really is no reason to carry information over from one request to the next. There is no state of the user interaction with the website that needs to be maintained.

In a web application, however, you do need some state representing the user interaction with the application which must be maintained between requests and available to both client and server. The challenge then becomes, how and where to store the ephemeral data representing the current state of interaction between a user and the application.

That is where sessions come in...

## Application State and Sessions

If you're not yet convinced about the necessity of carrying state from one request to the next, consider for a second what life would be like browsing some of your favorite websites. Every single time you needed to access a protected resource within the website, you would be required to send them your username and password. How terrible a user experience that would be! Furthermore, how vulnerable a *system* that would be as well, since you're having to constantly enter your credentials and send them over the wire. There has to be a better way...

Luckily there is! It all has to do with the client, in most cases a web browser, keeping some data that it will send back to the server on each request to remind the server who they are talking to. The session data serves as a reminder to the server, "Hey it's me again! Remember?!? From that other request a little while ago!" We call this data that links the client and server and is persisted between requests a ***session***.

This mechanism is what allows us, among other things, to enter our username and password once, authenticate with the server, then send back to the server on each subsequent request proof that we already entered our credentials and are authorized.

### *Why not use the IP Address?* ###

When I was beginning my journey and education into writing web applications, one question I always had that no one ever explained very well is, "Why not use the IP address as a unique identifier for the user session?" I had always heard the IP address is unique for each device connected to the internet, so my brain thought, "Why doesn't the server keep the session object for each requesting IP address?" 

If you wondered the same thing, here is the problem with this approach and why we cannot reliably use IP addresses as session identifiers...

Multiple devices connected to the same Wi-Fi network will *share the same public IP address*. The router, using a procedure called NAT, or Network Address Translation, knows how to relay responses to the originating computer that made the request inside the network. But to the outside world, all computers will share the *same public IP address*! 

This means that servers cannot reliably use the IP address to identify a client computer. If they did, then you might login to your internet banking and someone else in the same private network connected to the same router, could visit the same internet banking page, and having the same public IP address, they would both share the same session. Obviously, this would have disastrous consequences - especially if you're using public Wi-Fi at your local coffee shop!

## Stateful vs Stateless

We also hear the terms stateful and stateless thrown around a lot - often in different contexts and referring to different things.

In the context of user sessions, stateful and stateless are referring to *where session data is saved and managed*. 

In **stateless** design, the entire session is sent to the browser. The server does not maintain or manage *any state* at all. To this end, the server must trust the session data coming from the browser that will tell it who the user is, whether they're logged in, etc.

In **stateful** design, the server actively manages and stores the session. The server will still need to send back a unique session identifier to the browser, which the client will send back on future requests. The session identifier will identify the client and act as a unique key to lookup the session object that the server has stored.

The key difference lies in whether or not the server is involved in managing and saving the session.

Whichever approach is used, either stateful or stateless, *some data is always stored* on the browser - whether that be the entire session itself or just a session identifier.

## Browser Storage

Modern browsers have three common storage spaces to save information, each with unique characteristics:

- Cookie Jar
- localStorage
- sessionStorage

### Cookies

Cookies or Cookie Jar is a key / value store available on modern browsers. Both the server using the `Set-Cookie` header or client-side Javascript can create and modify cookies.

The advantage of cookies as a store is that the default browser behavior is to attach all cookies for a particular domain in the `Cookie` request header. This default behavior is one appealing reason to use cookies for storing session identifiers - you do not need to manually attach the session identifier on each request, the cookie handles this automatically! But because cookies have been designed to be included in all request headers, the cookie jar is prudently limited to a mere 4kB. This limitation is *good*! It limits us to storing only the essential session data. Furthermore, we would not want to suffer the increased bandwidth usage from unnecessary data being attached on all requests that might otherwise occur if there were no limitation on size.

The default browser cookie behavior has made cookies a very popular way of storing session identifiers. If your session object is limited in size, cookies can also store the entire session object itself and save your server the burden of having to manage the session itself.

Here is an example `Set-Cookie` header on a server response:
```
Set-Cookie: id=asdf98348133dlj; Expires=Wed, 21 Oct 2015 07:28:00 GMT;
```

In the above example we also set an `Expires` attribute for the cookie. This attribute is *optional*. By providing this attribute we can ensure the cookie stays saved in the Cookie Jar until a specific date and time or for a certain amount of time. Cookies without this attribute are considered *session cookies* and will disappear when the browser is closed.

Browsers support several attributes for cookies that modify their behavior: Secure, HttpOnly, SameSite, Expires, and Domain:

- Expires: Will persist the cookie even if the browser application is closed until the date and time specified (absent this property the cookie is considered a *session cookie* and will expire when the browser is closed)
- HttpOnly: Will never allow client side Javascript to access the cookie.
- Secure: Will only attach the cookie to requests made over HTTPS.
- SameSite: Will never send the cookie on cross-site requests.

These attributes are intended to increase the level of data security and customization of the cookie behavior. Some of them have very important implications for security and protection against certain attacks. We will explore the security part of this tutorial a little later, but for now, know that these features afforded to cookies are baked into browsers and give cookies an advantage in some respects to the other two methods for storing data on the browser.

Read more about [cookies in the Mozilla docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies).

### Local Storage

Local storage is another mechanism for storing key / value pairs on the browser. One key difference between Cookies and Local Storage is that Local Storage data is *not sent* to the server on each request, nor is data automatically saved to Local Storage from each response. Using Javascript and the `localStorage` browser API, the developer must write the code to store and manage the data in Local Storage. Another major difference is available storage size. While cookies are limited to 4kB per origin, Local Storage supports 10MB or more on some browsers. The purpose of Local Storage is to improve performance of applications by keeping some data on the client. Any data stored therein *does not expire*.

Local Storage should never be used for storing sensitive information. Any Javascript running on the page can access local storage. It is also not a replacement to a server side database.

### Session Storage

Session Storage is similar to Local Storage, but any data saved only lasts for as long as the browser *tab* is open. As soon as the browser tab closes, the data is vanquished! In this sense, Session Storage is similar to a Session Cookie, but of course, any data saved therein will not be automatically sent to the server as cookies normally are. Furthermore, each browser tab has a unique Session Storage object - therefore, opening up several tabs to the same domain will generate unique Session Storage objects, with perhaps unexpected consequences and inconsistencies for users who may have the application open in several tabs at once!

## Pros and Cons of Server Side Sessions

Hopefully by now, you have a better understanding of *user sessions* in a web application. You understand that some data must always be stored on the browser and sent to the server to maintain an active session. You understand that *session data* contains information that can be shared between HTTP requests, thereby providing *state* to your applications in an otherwise *stateless* HTTP protocol. We also went over some browser storage spaces where you might store session information. Now you're ready to understand what might be some advantages and disadvantages to managing sessions on the server.

One initial consideration might be the size of the session object. If the browser is managing the session, then it must send the session object to the server on every single request - perhaps not ideal for large session objects because it consumes more bandwidth. Even small session objects, if they are stored in the cookie jar, may run into constraints given the storage size for cookies is limited to 4kB. One argument in favor of server sessions might be: If session data is saved on the server, then there is no limitation to the amount of data saved.

On the other hand, if the server is managing the session object, there is added complexity and a burden on server infrastructure. Every time a request comes in, the server must use the unique identifier to lookup the session object! This increases the load on the server from it having to manage and retrieve the session object on every request. The argument might be: keeping sessions in browser eliminates the complexity of session management on the server and reduces lookups of session objects.

Another consideration is scalability. If you have load balanced servers, each may be erroneously issuing conflicting sessions! Scaling your application horizontally, means you need to make sure all your application instances are sharing the same session store. An argument against managing sessions on the server therefore might be: keeping user sessions out of the server will reduce complexity when it comes time to scale applications.

One important caveat of *not having server sessions*. There is absolutely no way for you to kill a malicious session. Since sessions are delegated to the client, the server reduces complexity, but also relinquishes control! Be aware of this! Furthermore, the server must trust that the session object being received from the client! You might be asking, "How does the server know to trust the data it is receiving?" We will go into details on this issue a little later, but there are ways of both signing and encrypting the session object to protect from a malicious user attempting to craft a session object to hijack an account.

The next bit of discussion will delve into several methods for proving your identity and persisting your authorization *state* from one request to the next.

There are many different methods of authentication available out there, some old and battle-tested, and some on the bleeding edge! Before we even begin to touch on this topic though we should really cover something fundamental about communications over the internet and that is encryption.

## HTTPS - HTTP over TLS

HTTP over TLS, better known as HTTPS, is an HTTP communication made on top of Transport Layer Security or **TLS**. TLS wraps the HTTP request to provide *privacy* and *integrity* of messages exchanged between the client and the server through bidirectional encryption of communications.

To better understand the concept of privacy and security afforded by TLS, imagine you're in a room full of people and each of you is a client communicating with a person in the center of the room who is a financial representative in charge of your financial records. Using HTTP alone, is akin to shouting out your requests in plain English for everyone else in the room to hear, including your financial representative, the intended recipient. The server, ermm I mean financial representative, also responds in plain English shouting across the room at you private information about your financial records. All other clients can hear the conversation if they care to listen: they know your username, password, what pages you are browsing, what information is being exchanged. HTTP is *never* safe.

Continuing with our example, HTTPS would be like you and the financial advisor making up your own secret language to hide your communications. You would type your message in your secret language in a letter and seal it with a wax seal before handing it off to be delivered to the financial representative. The server would respond in kind. Each of you knows how to decrypt the message you receive from one another, but should anyone intercept your letter, they would not be able to understand the message. Furthermore, should anyone attempt to tamper with the letter while it is in transit, the wax seal would be broken and both parties would know to no longer trust it.

We should note a couple things about HTTPS that many people confuse.

> HTTPS encrypts all message contents, including the headers, and the request/response data. *Wikipedia*

The entire message between you and the server is encrypted *including the HTTP headers*. Yes, it is important to emphasize this, because many people writing blogs believe that only the body of the request is encrypted - which is simply not true. The entire request is encrypted and signed including the request method, request headers, URI, parameters, and all that is part of the request.

You may ask: *If everything is encrypted then how does the message get delivered?*

Of course, for the message to arrive at its destination some information must be plainly visible, that is, the TCP / IP layer is *not* encrypted. That means the host IP and port of both the sender and receiver are plainly visible. As a result, some meta data can be captured from this information. A person listening can know how many requests took place, over what period of time, and the amount of bits of data that was exchanged - however, they would not know what the contents of that exchange were.

To read more about HTTPS [visit the wikipedia page](https://en.wikipedia.org/wiki/HTTPS#Network_layers).

We emphasize HTTPS here because it is the bedrock of any modern authentication scheme. Without it, someone could steal your username and password to login to your internet banking or steal your authorization data to bypass access controls.

# Authencation Methods

We will cover several *Authentication Schemes* - methods for negotiating credentials between a client and host system. We'll cover Basic Auth, Digest Auth, and the more common Form Based Authentication. If you want, skip over Basic Auth and Digest Auth. While both these methods are supported in modern browsers, they are not commonly used, but I wanted to include them for the sake of completeness and for the curious person wanting to understand the evolution of authentication over the internet.

## Basic Auth

`Basic Auth` is still widely supported by modern browsers. When a client attempts to access a protected page the server responds with a `401 Unauthorized` error and a `WWW-Authenticate` header, indicating the authentication scheme it is expecting and the `realm` it is protecting.

The `realm` is a name that defines a protected space. A domain can contain multiple *realms* each with its own *authentication scheme*. Returning to our concert ticket analogy, a realm might be the general seating, while another might be VIP, each is a separate space that may require a different process for entering.

Here is an example `WWW-Authenticate` header: 

```
WWW-Authenticate: Basic realm="a_realm_name"
```

Upon receiving this response, browsers will show a built-in Basic Auth form. Once your credentials are inputted and submitted, the browser will send them in the `Authorization` header as a base64 encoded string of the username and password separated by a `:`.

Here is an example `Authorization` header:

```
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```

If the credentials are accepted by the server, then the browser will be given access to the protected `realm`. To facilitate additional requests to the same realm, the browser will cache the credentials for a certain amount of time.

### Important Caveats

*What's up with that built in Basic Auth form?* The `Basic Auth` form is built-in to the browser. It will have that clunky 2000's feel - sort of like an alert popup. You cannot change the appearance of the form or apply any sort of *branding*. The inflexibility in design is partly the reason why many websites don't use this authentication scheme.

*My credentials are base64 encoded therefore they must be safe*. False! Base64 encoding is not encryption and can easily be decoded. In other words, you are sending the credentials in *plain text*. A important implication of this is that Basic Auth is entirely dependent on ***HTTPS***!

*The browser caches my username and password combination - is that a session?* It is not! Basic Auth doesn't have sessions at all. Sure, the browser is caching the data, but that is not a session - you cannot save additional data, for example. It is just a browser feature that caches the credentials for convenience so you don't have to enter them again and again.

*When is it appropriate to use this authentication scheme?* Outside the browser environment, Basic Auth can be a useful tool for securing APIs. Without the default browser behavior that we talked about, ***`Basic Auth` is no different than using an bearer token to make requests***. Simply send the `Authorization` header with the base64 encoded credentials - ***but make sure you're doing it over HTTPS***!

## Digest Auth

This authentication scheme is another for negotiating credentials between a browser and server that entails hashing the username and password before sending them over the network. The hashing is done with MD5 and a nonce provided by the server to prevent replay attacks.

The browser has built-in support for Digest Auth. Whenever the user attempts to access a protected page from the server, the server will respond with a `401 Unathorized` and include the *authentication scheme* it expects, in this case `Digest` auth. Included in the response is also a `nonce` which will be used by the client to hash user credentials.

Here is an example server `WWW-Authenticate` response header specifying `Digest Auth` scheme:

```
WWW-Authenticate: Digest realm="the_realm",
	qop="auth,auth-int",
	nonce="the_server_nonce",
	opaque="some_base_64_encoded_data"
```

The `realm`, as previously mentioned, is a labeled, protected space on the server. A server can support multiple protected spaces each with its own authentication scheme.

The `opaque` field is a base64 encoded string provided by the server which it requires be sent again on follow up requests. It contains some base64 encoded data and this value is unrelated to the actual authentication and encryption of the username and password credentials.

Upon receiving this header, the browser will present a built-in form for the user to input their username and password. Internally, the browser will perform some calculations and hashing to encrypt the username and password before re-sending the request to the server again.

Here are the calculations performed:

- HA1 is MD5 of "username:realm:password"
- HA2 is MD5 of "HTTPMethod:URI"
- The **response hash** is MD5 of "HA1:the_server_nonce:request_counter:client_nonce:qop:HA2"

The client re-sends the request, this time including the `Authorization` header containing the final **response hash**:

```
Authorization: Digest username="username",
	realm="the_realm",
	nonce="the_server_nonce",
	uri="/the/protected/path/to/resource",
	qop=auth,
	nc=request_counter,
	cnonce="client_nonce",
	response="response_hash",
	opaque="some_base_64_encoded_data"
```

The `request_counter` and `client_nonce` are client generated fields to further solidify the encryption of the request and prevent replay attacks. On each subsequent request, the request_counter must be incremented and the server will know that any requests containing a previous request_counter is a replay of a previous request.

Take a second to look at all the information being sent. Observe what is being revealed in the request and what is not being revealed. Actually all the data available in the request header is being used to generate the response hash. Only one critical piece of information is missing: the password.

Upon receving the request with the new `Authorization` header. The server will be able to perform the *exact same calculation* to deduce the response hash. If the calculated hash matches the one sent by the client, then it can only be because the user provided the correct password.

The advantage of this approach is that HA1 is calculated, cached, and re-used in all the subsequent requests. The browser does not store the plain text password. Furthermore, never is the password sent to the server in plain text either!

### Important Caveats

*Wow that was a bit complex.* This authentication scheme was viable at a time when TLS certificates were expensive and difficult to implement. That is sort of why it originated. It is a viable scheme if you needed to authenticate over HTTP.

*What about that built-in browser form.* Yes, the clunky form is back again. Another large downside of this authentication scheme is that there is no way to customize and provide some branding to the auth form.

*When is it appropriate to use this authentication scheme.* Do to the complexity of this approach, attempting this outside of the browser means you have to build the hash yourself, which can be very tricky and error prone. If you have a solid TLS certificate, an easier approach is to go for `Basic Auth`. Although you're sending the username and password over plain text, you're relying on the HTTPS protocol encrypting your entire request, so you should be ok.

## Form Based Authentication

Finally, we've arrived at the most popular authentication scheme used today: Form Based Authentication. This is the method you have most often come across. In this method, the web browser will present a web form to collect credentials from a user and POSTs that information to the server for authentication. The attractiveness of this approach is the flexibility in design. Stakeholders want control over the look, feel, and branding of a website. Using Form Based Authentication, the developer can design the form and appearance of the page to further solidify the branding and provide a tailor-made user experience for the website.

One important consideration with regards to Form Based Authentication is securing communications. The username and password are sent to the server as POST data. On the server, the password should never stored "in the clear" in case the database becomes compromised. Instead, the password is hashed, most securely with a one way hashing algorithm such as MD5. Even if an introduder were to gain access to the database, they would never be able to decipher user passwords from the stored MD5 hash. However, the credentails are vulnerable *while in transit*, and for this reason, it is essential that this authentication scheme always be paired with HTTPS protocol to prevent someone from viewing the information as it is being transported.

### Authorization in Form Based Authentication

Once the server has confirmed the identity of the user, there are several options for persisting the authorization between requests. This behavior is handled automatically using `Basic Auth` and `Digest Auth`, but with Form Based Authentication, you have several approaches at your disposal and more flexibility. This brings us back to the discussion of sessions we made earlier, stateless vs stateful architectures, and browser storage mechanisms. If you remember our discussion from earlier, the server must send back some identifier back to the browser that it will store and send on each subsequent request. By far, the most popular method for doing so is using the `Cookie Jar`.

Cookies offer several advantages - the primary advantage being that all the behavior is handled automatically. The developer does not need to write a client side script to attach cookies on each request, cookies are automatically attached on *all requests*. All the server needs to do is provide the `Set-Cookie` header with the response after a successful authentication, and all subsequent requests will carry the cookie letting the server know who the user is, whether they're logged in, etc. The cookie could be made to contain the entire session object or simply a session identifier - the design is left up to the developer.

# Conclusion

We have gone over several authentication schemes and explained how they work. In a future post, I will cover some security considerations, alternate session storage mechanisms to Cookies, and usage of the now popular JWT Web Token for token based authentication. Thank you for reading!