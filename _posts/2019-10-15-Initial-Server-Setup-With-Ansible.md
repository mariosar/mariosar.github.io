---
layout: post
title: "Ansible Basics - Initial Server Setup"
category: 'Ansible'
description: "Using Ansible to automate initial server setup on a remote server."
image: ansible.jpg
---

# Ansible Playbook Basics

This is a basic tutorial on automating server configuration with Ansible. We will be creating a sudo user with password and changing the root user password. These are typically things you might do on a fresh ubuntu server installation and are an easy way to show the power of Ansible.

I'll be introducing terminology as we dive in instead of making a long introduction. Hopefully, as you follow along, everything will make sense to you, but if you feel lost, take a look at some of the [introductory tutorials](https://docs.ansible.com/ansible/latest/user_guide/index.html) from the Ansible website. They're helpful and cover the foundations.

This tutorial also assumes you have already installed Ansible on your machine.

# Getting Started with Ansible

We'll create a directory to house our Ansible `playbook` setup. Create this directory now and cd into it. I will call mine `ansible-initial-server-setup`.
```
mkdir ansible-initial-server-setup && cd $_
```

## Our First Inventory File

The very first step will be to create an `inventory` file. Since Ansible is a tool for automation, we need to specify *what* we want to target with our commands. ***Which hosts do we want to act upon?*** The inventory file is where you do this.

The inventory file must be written in one of two formats: INI or YAML. I am going to go with INI because it is easier to read for listing and grouping our hosts. Here is an example of an INI inventory file:
```
# ./inventory

[webservers]
1.1.1.1
2.2.2.2
3.3.3.3

[dbservers]
4.4.4.4
5.5.5.5
6.6.6.6

[all_servers:children]
webservers
dbservers
```
This file contains six different hosts. We have created a group called `webservers` with three hosts and `dbservers` with three hosts. 

We have another group that is a **grouping of groups** called `all_servers`. In it we are referencing `webservers` and `dbservers`.

The whole point of grouping is to have an alias to reference a collection of hosts when we're ready to execute commands. Easy as that. 

## Creating Our First Playbook

Now that we have defined *what* we want to act upon, the next step is to draft our `playbook`.

### What is a *Playbook*?

A [playbook](https://docs.ansible.com/ansible/latest/user_guide/playbooks.html) takes its name from a football playbook, where a professional football team might keep diagrams of their plays. Each individual play is a drawing or schematic depicting where players should be. 

A collection of **plays make a playbook**, and a collection of **tasks make a play**. 

A **task** is a single instruction of what needs to be performed on the host(s) - we use Ansible [modules](https://docs.ansible.com/ansible/latest/user_guide/modules.html) to perform tasks.

Playbooks are written in [YAML](https://docs.ansible.com/ansible/latest/reference_appendices/YAMLSyntax.html). Here is a quick example:
```
# initial-server-setup.yml

---
- hosts: webservers
  remote_user: admin
  become: yes
  
  tasks:
    - name: Create sudo user
      user:
        name: bob
        shell: /bin/bash
        groups: sudo
        append: yes
        password: {% raw %}"{{ sudo_password | password_hash('sha512', sha512_secret_salt) }}"{% endraw %}

    - name: Change root password
      user:
        name: root
        password: {% raw %}"{{ root_password | password_hash('sha512', sha512_secret_salt) }}"{% endraw %}
```
Our playbook starts with `---` which is signaling the start of a document in YAML.

Next we specify the hosts we want to act upon. Here we supplied `webservers` which corresponds to the group labeled `webservers` in our inventory file we created earlier.

Just below that, we've specified the `remote_user`, which is the user that we'd like Ansible to SSH to the host as, in this case `admin`.

Oftentimes, when we connect to a server as a particular user, we need a way of ***escalting privileges***, in order to perform certain tasks. We can immediately tell Ansible to escalate privileges on our target by providing `become: yes`.

There are many ways to escalate privileges - for the the whole play, for specific tasks in a play - and Ansible provides this flexibility. Click [here](https://docs.ansible.com/ansible/latest/user_guide/become.html) for more on privilege escalation.

For all intents and purposes, adding `become: yes` is telling Ansible that for the remainder of the play, we would like to execute the commands with `sudo` privileges.

### Performing Tasks

Our playbook would be nothing if it didn't act upon the host(s).

Tasks are commands we want executed on our host(s). A task is essentially just a module that gets executed on remote machines with the arguments we provide. Ansible provides many modules, and you can even develop your own modules. For a quick reference of what is available checkout the [module directory](https://docs.ansible.com/ansible/latest/modules/modules_by_category.html).

*Back to our playbook...*

Our playbook contains two `tasks` we've listed.
```
# initial-server-setup.yml

...
  tasks:
    - name: Create sudo user
      user:
        name: bob
        shell: /bin/bash
        groups: sudo
        append: yes
        password: {% raw %}"{{ sudo_password | password_hash('sha512', sha512_secret_salt) }}"{% endraw %}

    - name: Change root password
      user:
        name: root
        password: {% raw %}"{{ root_password | password_hash('sha512', sha512_secret_salt) }}"{% endraw %}
```
Each task in `tasks` starts with a `-`. We've named each task, as you can see, with roughly a description on what the task will be accomplishing.

Both of these tasks are using the Ansible `user` module, which is for managing user accounts. The module takes some parameters which we've indented inside with their respective values. Not all module parameters are required - for the `user` module we are only required to provide a `name` for the user - but providing additional parameters modify the behavior of the module and its interaction with the server.

If you read the parameters in the module now, you should be able to guess what the module is doing.

Here is what we are accomplishing with these two tasks:
- **First Task**: Find or create the user 'bob'. Set his shell to /bin/bash and add him to the sudo group. Set his password to the one provided.
- **Second Task**: Change the root password to the one provided.

See! Ansible and playbooks should be easy to read and understand. We used the Ansible [user](https://docs.ansible.com/ansible/latest/modules/user_module.html) module here. The best way to learn is to visit the documentation and take a look at some of the available parameters and examples provided.

### Idempotency

Before moving on, we should talk about an important concept in Ansible... ***Idempotency***.

Modules should be idempotent, which is just a fancy word to say, ***"running our module once should produce the same result as running it additional times."*** This makes it safe to re-run your module multiple times (which will happen) because there is no danger that the second time you run the same task it will produce different or unexpected results, leading to inconsistency in our system. We're always trying to achieve the ***same consistent result***, whether we're running our play once, twice, or several times.

If each task achieves a result, then a good check before executing a module is to ask, ***"has the result of this module been achieved?"*** If yes, then continue because there is nothing to be done, if not, then execute the module and give me the desired result. Ansible modules are pretty smart and will do this automatically.

### Variables / group_vars / host_vars

You may wonder, **"what is that inside the quotes in the password argument?"** Ansible provides the ability to use variables and inject them throughout your playbook.

In the example, we're injecting variables **sudo_password**, **root_password**, and **sha512_secret_salt**. Obviously, we don't want our passwords hardcoded into the playbook for many reasons, including if we were to share the play with other users or commit it to a repository to be re-used in a different context.

*Back to our example...*
```
mkdir -p group_vars/all && touch $_/vars

# group_vars/all/vars
---
sudo_user: bob
sudo_password: secretpass
root_password: rootpass
sha512_secret_salt: salt

# initial-server-setup.yml
...

  tasks:
    - name: Create sudo user
      user:
        name: {% raw %}"{{ sudo_user }}"{% endraw %}
        shell: /bin/bash
        groups: sudo
        append: yes
        password: {% raw %}"{{ sudo_password | password_hash('sha512', sha512_secret_salt) }}"{% endraw %}
...
```
We've created a YAML file to store our variables inside of `group_vars/all`. The directory `group_vars` is the standard place Ansible will look to find variables related to the *inventory group* you are targetting. There is a standard naming convention to look for variables related to a particular group inside of a folder with the *same name*. By naming the directory `all` ensures the variables contained therein will be loaded for *all* groups. We've also removed the name of our sudo_user from our play and replaced it with a variable, as well.

### Ansible-Vault

Although we've created some variables to be loaded into our Ansible playbook, sensitive information is still exposed. Anyone can simply open `group_vars/all/vars` and see our passwords. 

We'll use `ansible-vault` to encrypt our sensitive data. It's a handy utility provided by Ansible that can encrypt / decrypt files or strings.

```
touch group_vars/all/vault
```
```
# group_vars/all/vault
vault_sudo_password: secretpass
vault_root_password: rootpass
vault_sha512_secret_salt: salt

# group_vars/all/vars
sudo_user: bob
sudo_password: {% raw %}"{{ vault_sudo_password }}"{% endraw %}
root_password: {% raw %}"{{ vault_root_password }}"{% endraw %}
sha512_secret_salt: {% raw %}"{{ vault_sha512_secret_salt }}"{% endraw %}
```
**NOTE:** I have preceded the variable names in the `vault` file with `vault_`. Then I am injecting the protected values into the `vars` file where they need to go.

Finally, to encrypt the `vault` file:
```
ansible-vault encrypt group_vars/all/vault
```
Ansible-Vault will request a password - keep it *safe* and **don't lose it**. It is the only way to un-encrypt the file and we will need it to run our playbook.

If you wish to **view**, **edit**, or **create** a new vault, here are some helpful commands you can reference:
```
ansible-vault view file_name # VIEW
ansible-vault edit file_name # EDIT
ansible-vault create file_name # CREATE NEW
```
Hopefully by now you got the gist of injecting variables inside our playbooks, creating a vars file inside group_vars directory, and creating an encrypted vault. Good!

## Running our Playbook

Finally the long awaited step!
```
ansible-playbook -i inventory initial-server-setup --ask-become-pass --ask-vault-pass
```
We tell Ansible to run our playbook using the `ansible-playbook` command, specifying the inventory we want used with the `-i` flag, and the name of the playbook we want executed.

There are a couple additional options included here that need explaining...

- `--ask-become-pass` : this option will prompt you for the sudo password of the user who will be escalating privileges.
- `--ask-vault-pass`  : this option will prompt you for the password to your vault where the encrypted passwords are stored.

If you replace the IP addresses in the inventory for a remote host you own, change the remote_user to a user on that machine with sudo privileges, edit your vars file inside the `group_vars/all/vars` to contain your desired new sudo user, and edit the vault to contain your desired passwords, you can execute the playbook with the above command and effect the changes on your remote machines!

# Summary

Ansible is an extremely powerful configuration, deployment, and provisioning tool that can automate your server configuration. I hope this tutorial has helped get you started! There are many topics I was unable to cover but hopefully you now have a better understading of Ansible. 

Thanks for visiting!
