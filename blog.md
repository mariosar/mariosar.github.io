---
layout: default
title: "Happy Jekylling!"
---

<h1 class="ui header">Blog Posts</h1>

Here I will attempt to record some of my learnings and hopefully it will serve use to someone somewhere...

<div class="ui link cards">
  {% for post in site.posts %}
    <a class="ui card" href="{{ post.url }}">
      <div class="image">
        <img src="/assets/images/{{ post.image }}">
      </div>
      <div class="content">
        <div class="header">{{ post.title }}</div>
        <div class="meta">
          <span class="category">{{ post.category }}</span>
        </div>
        <div class="description">
          {{ post.description }}
        </div>
      </div>
    </a>
  {% endfor %}
</div>
