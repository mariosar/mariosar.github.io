FROM ruby:2.6
LABEL maintainer="mario.s.saraiva@gmail.com"

ARG USER

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg -o /root/yarn-pubkey.gpg && apt-key add /root/yarn-pubkey.gpg
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list
RUN apt-get update -qq && apt-get install -y nodejs postgresql-client yarn

ENV INSTALL_PATH /opt/app/$USER
RUN mkdir -p $INSTALL_PATH

RUN gem install bundler
COPY ./Gemfile Gemfile
COPY ./Gemfile.lock Gemfile.lock
WORKDIR /opt/app/$USER
RUN bundle install

CMD bundle exec jekyll serve --host 0.0.0.0