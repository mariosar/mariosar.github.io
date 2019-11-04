---
layout: post
title: "React SPA with react-router-dom"
category: 'React'
description: "How to build a Single Page App with React."
image: spa-react.jpg
---

# React SPA with React Router

In this tutorial you will learn how to build a Single Page Application (SPA) using React and React Router. We will discuss some of the benefits and challenges of building a SPA. The example code will take you through the basics of routing and philosophy behind React Router. By the end, you should have a fundamental understanding to get you started building your own SPAs.

### What is a SPA?

SPAs are apps that serve only a ***single html page*** to the browser. All subsequent requests - link clicks, form submissions, etc - will dynamically update the *existing* page. The part of the HTML page that never changes and acts as a container for your app is called the *app frame* - think of it as an empty picture frame. Each change in navigation in a SPA will display a new *view* inside your *app frame*.

<img width="300px" src="/assets/images/empty-frame.png">

Notice we use the term *view* instead of *page* here. Page would imply we're requesting a new HTML page - which is not the case!

### Key Benefits

So why should you even build a SPA?

SPAs update the *existing page* programmatically on each request. This is an important distinction from the way webpages and apps have been traditionally built. We avoid making unnecessary requests and try to handle everything in the client if we can. If we need anything from the server, we send a request for only those bits of information that we need. The ultimate goal is to improve *load times* and overall *user experience* by eliminating the overhead from having to request a *new page*.

### Routing Complications

Since SPAs don't conform to the way webpages and apps have been traditionally built and browsed on the web, we naturally run into a few stumbling blocks when it comes to the browser and user behavior. 

In traditional applications the browser address bar updates on link clicks, the back and forward buttons behave as expected, the browser history updates with each page visit, etc.

SPAs only load a *single page*. Therefore, we need a way of handling navigation inside our app while at the same time enforcing these changes to reflect inside the browser.

Here are some considerations and challenges:

1. The URL displayed in the address bar *must change* on link clicks and *match* the `view` that is being shown on the page.

2. The back and forward buttons should navigate the *browser history* normally, changing the `view` and URL.

3. Refreshing the page or *copy pasting the URL* in the address bar should present the appropriate `view` matching that URL.

Although these are browser features that just work with multi page applications, we need to implement them ourselves in SPAs.

Luckily there is a library that handles this for us!

## React Router

React Router implements routing in a unique way. Instead of all routes being declared inside a single file that gets loaded during the initialization phase of our application, React Router uses what it calls *dynamic routing*. Routes are plain React components that are composed inside your application just like any other React component. It is worthwhile taking a moment to read the [philosophy](https://reacttraining.com/react-router/web/guides/philosophy) behind this approach because it is a different approach to routing.

### How to use?

The best way to learn to use React Router is through example. So we're going to dive right in. I hope by now you have a full understanding of what building a SPA entails and the challenges involved, because we're going to use React Router to solve the issues we talked about.

Create a new React App using create-react-app and `yarn`.
```
yarn create react-app react-router-example-app
cd react-router-example-app
yarn start
```

Install `react-router-dom` as a dependency.

```
yarn add react-router-dom
```

Replace your App.js with the following...
```
import React from 'react';

function App() {
  return (
    <div>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
      <div>
        // Views render here
      </div>
    </div>
  );
}

export default App;
```
So far we've setup a `ul` list with some navigation using standard links. We've put a comment inside the div where we'll be rendering our views. So far this is just a plain React component and there is no routing yet.

Create three files inside `components` to house each of our views.
```
mkdir -p ./src/components && touch $_/home.js $_/about.js $_/contact.js
```
Now create a component inside each of these files with the `view` you want displayed when the user visits that link.
```
# Home.js

import React from 'react';

function Home() {
  return (
    <div>
      <h1>Welcome to the homepage</h1>

      <p>Here is some homepage information</p>
    </div>
  );
}

export default Home;

# About.js

import React from 'react';

function About() {
  return (
    <div>
      <h1>About Us</h1>

      <p>We're building great things!</p>
    </div>
  );
}

export default About;

# Contact.js

import React from 'react';

function Contact() {
  return (
    <div>
      <h1>Get in touch</h1>

      <p>Contact us now!</p>
    </div>
  );
}

export default Contact;
```
We've created three component `views` that will be rendered when the user clicks on the respective links in our navigation.

Now for the fun part, let's import the necessary components from `react-router-dom` to bring everything together.

```
import React from 'react';
import { NavLink, Route, BrowserRouter, Switch } from 'react-router-dom';

import Home from './components/Home.js';
import About from './components/About';
import Contact from './components/Contact';

function App() {
  return (
    <BrowserRouter>
      <div>
        <ul>
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/about">About</NavLink></li>
          <li><NavLink to="/contact">Contact</NavLink></li>
        </ul>
        <div>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
          </Switch>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
```
First thing to notice is we've wrapped the whole application inside of a `BrowserRouter` component. `BrowserRouter` must always wrap your application for your routing to work. Next, we've replaced the html anchor tags with the `NavLink` component. This will create our special links in our navigation. They'll look and function like regular anchor tags, but you won't ever leave the page.

Go ahead and see your application in the browser now. Click on the links. You'll see that the address bar is updated as you click on each link. Browser history is updated and the back and forward buttons work! Try clicking back and forward to move in browser history time.

Looking good! But there is a problem... You'll notice we're only showing our `Home` component - why is that?

### Switch

The `Switch` component wraps our `Route` components.

Each `Route` component has a `path` and `component` prop that says, "If the current URL path matches the `path` prop, then show this `component`." We have one `Route` component for each link in our navigation.

The `Switch` component does nothing more than check each `Route` component, one by one, until it finds a match. Only the first matching component is rendered!

By default, React Router only checks the beginning of the path - so the `/` path matches everything. Since it is also the first in the list inside the `Switch`, then only it will render and all other components will not be shown. To fix modify your code as follows...
```
...
<Switch>
	<Route exact path="/" component={Home} />
	<Route path="/about" component={About} />
	<Route path="/contact" component={Contact} />
</Switch>
...
```
We've added the `exact` prop to our first Route containing the path prop `/`. This tells React Router we do not want to match only the initial part of the path, but match the path *exactly* for this `Route` component! 

Now reload your application in the browser and you should see your routes working. Notice the address bar changing. Take a look at your browser history and see it updating. Notice the browser back and forward buttons behave as normal. We've got a working SPA!

# Summary

SPA is a new paradigm in web application development. It differs from traditional web applications because only *one page* is served to the browser. All subsequent requests are handled programmatically, avoiding *new* page requests entirely. The static part of the application page that contains your dynamic *views* is called the *app frame*. We need to be cognizant of the browser experience, synchronizing SPA navigation with the address bar, browser history, and back and forward buttons in the browser. React Router is an amazing library that handles SPA routing out of the box.

I hope you have learned a little bit about the importance and value of SPA apps and how to use React Router to build them. Thank you for visiting!
