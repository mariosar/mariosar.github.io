---
layout: post
title: "Rails API - How to"
category: 'Rails'
description: "Build a basic api using Rails 5."
image: rails_api.webp
---

# API EXAMPLE

This is a Rails API tutorial example code.

By the completion of this tutorial you should have a working Rails REST API. For this tutorial I am using:
- Ruby 2.6+
- Rails 5.2.3

## Getting Started

I have a [repository](https://github.com/mariosar/api_example) saved on github. You can clone the repository if you like and follow along. But I urge you to execute the steps yourself.

Creating the project:
```
rails new api_test --api
bundle install
rake db:create
```
The `--api` flag is useful because it makes your application essentially api only. Your generators will not produce views, helpers, or assets. Your middleware will be leaner as well, since cookies and session support is removed. Finally, your `ApplicationController` will inherit from `ActionController::API`

Add RSpec for testing and FactoryBot:

Add to `Gemfile` inside :test, :development group:
```
gem 'rspec-rails'
gem 'factory_bot_rails'
```

Since this is an API and we're serving JSON responses include:
```
gem 'active_model_serializers'
```

Run:
```
bundle install
rails g rspec:install # Install RSpec
```

`active_model_serializers` is great for defining *what* model attributes and relationships we'd like to respond with, plus it accepts custom methods!

Tell our serializer to use [json:api](https://jsonapi.org/) standard for json responses. If you're unsure about what that means, click on the link.

```
echo 'ActiveModelSerializers.config.adapter = ActiveModelSerializers::Adapter::JsonApi' > config/initializers/active_model_serializers.rb
```

At this point you may want to scaffold a `User` with `name email` and run `rails s` to do a quick test. Send a few requests using `cURL`.
```
curl -X GET -H "Accept: application/json" "localhost:3000/users"
curl -X POST -H "Accept: application/json" -H "Content-Type: application/json" -d '{"user": {"name": "Bob", "email": "bob@gmail.com"}}' "localhost:3000/users"
curl -X PUT -H "Accept: application/json" -H "Content-Type: application/json" -d '{"email": "bob@yahoo.com"}' "localhost:3000/users/1"
curl -X GET -H "Accept: application/json" "localhost:3000/users"
curl -X GET -H "Accept: application/json" "localhost:3000/users/1"
curl -X DELETE "localhost:3000/users/1"
```

Using `cURL` worked great. You should see your API responding, but what about Ajax requests? 

Browsers enforce a `Same Origin Policy` which basically prevents applications hosted on different domains from accessing each other's data. In order to bypass and allow `Cross-Origin Resource Sharing`, which is just a relaxing of the `Same Origin Policy`, the server needs to send info back to the browser telling it to modify its usual behavior and allow for sending requests to and receiving responses from its domain (aka origin).

### CORS Support

Our API wouldn't be very useful if other websites couldn't make CORS Ajax requests to it. You can read more about CORS [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS), but for now let's add some middleware to allow CORS requests.

Add CORS support:
```
# Gemfile
gem 'rack-cors'
```
```
bundle install
```

Read more about `rack-cors` gem at [https://github.com/cyu/rack-cors](https://github.com/cyu/rack-cors)

The CORS middleware will intercept requests and *allow* certain *request types* from certain *origins* to certain *resources*. We're gonna allow everything for now with the following code inside `application.rb`:

```
config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins '*'
    resource '*', headers: :any, methods: [:get, :post, :options]
  end
end
```

If your CORS Ajax requests were blocked before, try them now. In any website, open up the developer console and try to send a quick request to your API:
```
# Using jQuery:
$.ajax("http://localhost:3000/users").done(function(response, textStatus, xhr){
  console.log(response.data)
  console.log(xhr.status)
}).fail(function(xhr, textStatus){
  console.log(xhr.status)
})

# Plain Javascript:
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    console.log(this.responseText);
  }

  if (this.readyState == 4){
    console.log(this.status)
  }
};
xhttp.open("GET", "http://localhost:3000/users", true);
xhttp.send();
```

Great so now we have a working rails API that accepts CORS Ajax requests. Keep in mind, we're allowing *everything*. This is a full relaxation of the `Same Origin Policy` designed to protect users from malicious scripting! 

Before deploying your application, especially for accessing, modifying, and manipulating critical functions (like in financial services / banking), implement a more restrictive CORS policy.

### Throttling, Safelist, Blocklist, and Track

Another issue we need to be concerned about is limiting the usage of our API (i.e. *throttling*), protecting it from nasty things like [DoS Attack](https://en.wikipedia.org/wiki/Denial-of-service_attack)s, and logging data. For this we're gonna use a handy gem called [rack-attack](https://github.com/kickstarter/rack-attack) brought to you by the nice people at [Kickstarter](https://www.kickstarter.com/).

```
# Gemfile
gem 'rack-attack'
```
```
bundle install
```

Edit `application.rb` to include the Rack::Attack middleware:

```
config.middleware.use Rack::Attack
```

We've got RackAttack in our middleware stack, but now need to initialize it. Life would be really great if we could just plug these gems in and they could read our minds and know what we wanted them to do, but that's not the case here. Let's create an initializer. We can tell RackAttack to *safelist, blocklist, throttle, and track* certain requests.
```
touch config/initializers/rack_attack.rb

# config/initializers/rack_attack.rb

class Rack::Attack

  Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

  # Always allow requests from localhost (blocklist & throttles are skipped)
  safelist('allow-localhost') do |req|
    '127.0.0.1' == req.ip || '::1' == req.ip
  end

  # Limit 5 requests per 5 seconds
  throttle('req/ip', limit: 5, period: 5) do |req|
    req.ip
  end

  # Limit 10 requests per 60 seconds for specific path
  throttle('limit requests to resource', limit: 10, period: 60) do |req|
    req.ip if req.path == '/resource'
  end

  # Send a custom response to throttled clients
  self.throttled_response = ->(env) {
    retry_after = (env['rack.attack.match_data'] || {})[:period]
    [
      429,
      {'Content-Type' => 'application/json', 'Retry-After' => retry_after.to_s},
      [{error: "Throttle limit reached. Retry later."}.to_json]
    ]
  }
end
```

The above is a basic setup. We're telling Rack::Attack to green light localhost, limit everyone to 5 requests per 5 seconds, limit 10 requests per 60 seconds to the path `/resource`, and send back a custom message with 429 response if someone exceeds that.

> The [HTTP 429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) Too Many Requests response status code indicates the user has sent too many requests in a given amount of time ("rate limiting").

Try adding a throttling rule, remove localhost from the safelist, then hammer your api with consecutive requests and see the result. You should receive back a 429 response status code with the error message.

### Deployment

So far so good, but now I'd really like to have this app hosted somewhere so it's not just running on my local machine. One great option for getting something up and live quickly is Heroku. I don't typically use it - but for getting something live and to the world, I have to admit, it's very easy.

Our first step will be to switch to PostgreSQL from SQLite3 in our Gemfile.
```
# Gemfile

# gem 'sqlite3'
gem 'pg'
```
Now run `bundle install` to effect changes made in our Gemfile. We also need to modify our `database.yml` file to tell it to talk to postgres.
```
default: &default
  adapter: postgresql
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  timeout: 5000
  host: localhost
  encoding: unicode
  username: api_example
  password: secretpass

development:
  <<: *default
  database: api_example_development

test:
  <<: *default
  database: api_example_test

production:
  <<: *default
  database: api_example_production
```

The above follows the rails convention of having the database name as <*your_application_name*>_<*environment*>. We also default the database user to have the same name as your application, in this case, `api_example`. The password we've hardcoded and directly in the application, which if we were launching a real world application is a no-no. 

We would like to pull in the password from the environment, but there are many ways of achieving this including using `dotenv` and `rbenv-vars`, and it is beyond the scope here. Google them to learn how to achieve this.

Before continuing further, let's remove the SQLite3 databases since we'll be using PostgreSQL all around now.
```
rm db/test.sqlite3 db/development.sqlite3
```
Although we've done everything in rails to get it to communicate to PostgreSQL, we need to get the actual database server setup locally. It needs to have a user `api_example` with a password `secretpass`. Furthermore, this user needs to be allowed to `createdb`.
```
sudo -u postgres psql #Access the postgres cli
create user api_example with encrypted password 'secretpass';
alter user api_example createdb;
```
Above, we've created a new user called `api_example`. We can now use our standard arsenal of commands like:
```
rake db:drop
rake db:create
rake db:migrate
rake db:rollback
```
Go ahead and create our development database and migrate it.

**NOTE:** If by chance you already have the database tables for your application then you need to run these commands to give your new user control over them.
```
grant all privileges on database YOUR_DB to YOUR_USER;
alter database YOUR_DB owner to YOUR_USER;
```

### Heroku

Let's install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#download-and-install) - the easiest way to get our project up and running.
```
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh
```
If you haven't already created an account on Heroku, do so now. Then...
```
heroku login
heroku create
```
You can check `git config --list` to see that heroku has added itself as a remote repository to your project and executing `git push heroku master` will push up your project to your dyno. Go ahead and push your project up there.
> [Dynos](https://www.heroku.com/dynos) are isolated, virtualized Linux containers that are designed to execute code based on a user-specified command.

Heroku is pretty smart! It will detect a Ruby on Rails app when you `git push heroku master`, will download all dependencies and build your app for you, seamlessly.

After your command has completed. Heroku will provide you with the url where you can access your application. Very cool!

In order for your API to work, we also need to run our migrations on Heroku. Heroku was smart enough to create our production database for us, but it didn't run our migrations. Execute the command `heroku run rake db:migrate`.

Now we can make GET, POST, PUT, DELETE requests to our `users` resource on our server. Try it now, replacing `HEROKU_URL` for the url provided by Heroku:
```
curl -X GET -H "Accept: application/json" "HEROKU_URL/users"
curl -X POST -H "Accept: application/json" -H "Content-Type: application/json" -d '{"user": {"name": "Joe", "email": "joe@gmail.com"}}' "HEROKU_URL/users"
curl -X PUT ation/json" -H "Content-Type: application/json" -d '{"email": "joe_smith@gmail.com"}' "HEROKU_URL/users/1"
curl -X DELETE "HEROKU_URL/users/1"
```
Very cool! We're not finished yet though...

Heroku uses a `Procfile` in your root to tell it how to fire off your server. Since we haven't included one yet, it used the default rails server that we use in development by running `rails s`. Let's create a `Procfile` now and use `puma` http server that comes automatically included with Rails 5.
```
echo 'web: bundle exec puma -t 5:5 -p ${PORT:-3000} -e ${RACK_ENV:-development}' > Procfile
```
## Conclusion

This tutorial was short and sweet. You learned the fundamentals of creating and deploying a Rails REST API. We added CORS support, some protection from malicious users with the RackAttack middleware, `active_model_serializer` to standardize our JSON responses using `json:api` standard, switched from SQLite3 to PosgreSQL, and did a basic deployment to Heroku. 

Thanks for visiting!

### Further reading

Useful Heroku Links:

- [https://devcenter.heroku.com/articles/getting-started-with-rails5](https://devcenter.heroku.com/articles/getting-started-with-rails5)
- [https://devcenter.heroku.com/articles/procfile](https://devcenter.heroku.com/articles/procfile)
- [https://devcenter.heroku.com/articles/deploying-rails-applications-with-the-puma-web-server](https://devcenter.heroku.com/articles/deploying-rails-applications-with-the-puma-web-server)
- [https://devcenter.heroku.com/articles/config-vars](https://devcenter.heroku.com/articles/config-vars)
- [https://devcenter.heroku.com/articles/connecting-to-heroku-postgres-databases-from-outside-of-heroku](https://devcenter.heroku.com/articles/connecting-to-heroku-postgres-databases-from-outside-of-heroku)
