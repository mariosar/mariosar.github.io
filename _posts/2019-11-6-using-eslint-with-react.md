---
layout: post
title: "ESLint - How to integrate into React App"
category: 'ESLint'
description: "In this tutorial we integrate ESLint into a React App."
image: es-lint.png
---

# Integrate ESLint into your React App

In this tutorial we will use ESLint to enforce coding style conventions in a React App. We will go over some very basic rules for *enforcing style* and *error checking*. We will also integrate `husky` and `lint-staged`: two packages that pair well and help us avoid shipping *bad* code accidentally.

## What is a linter?

A linter is a software development tool that analyzes code for bugs and *style errors* with the goal of ensuring ***code consistency***. We define a collection of rules or conventions we want our code to follow, and the linter will parse through files looking for inconsistencies and raising flags wherever the defined conventions are broken. Linters can also identify common bugs, like *undefined* or *unused* variables.

Hopefully, you can see the value of enforcing code consistency for the individual programmer, but a linter especially shines when it comes to teams because it enforces consistent style among groups of developers working on the same codebase.

### ESLint

ESLint is a linter that analyzes JS code. If you are familiar with linters from previous work, you know that many of them are *opinionated*. They come configured with certain *rules* out of the box. ESLint does none of that! *In ESLint you define your own rules*. Thankfully, there are many ready-made rulesets available that you can plugin and extend.

To help get a better understanding, think of using an existing ESLint ruleset just like importing a CSS framework into your project. The CSS framework defines rules for how your UI should look in the same way that a ruleset contains the coding style conventions you want to follow. You can override and tweak parts of the CSS framework to fit your needs with a custom stylesheet, likewise, you can overwrite or extend a ruleset you've adopted by writing custom rules.

*Let's get going...*

## Getting Started

Install `eslint` and `eslint-plugin-react@latest`. They're both dev dependencies. The latter is required because we are going to lint a React project.

```
yarn add -D eslint eslint-plugin-react@latest
```

Then run

```
./node_modules/.bin/eslint --init
```
ESLint will provide a command line interface for you to select options and answer a few questions. This will initialize a new ESLint configuration file automatically.

Here are the options I gave it:

- I am using ES6 modules and React. 
- My application is intended for the Browser. 
- I want my config to be a Javascript file. 
- I like to use tabs for my identation, double quotes for strings, and I don't like semicolons.

This resulted in the following configuration file (yours may differ):
```
# .eslintrc.js

module.exports = {
	"env": {
		"browser": true,
		"es6": true
	},
	"extends": "eslint:recommended",
	"globals": {
		"Atomics": "readonly",
		"SharedArrayBuffer": "readonly"
	},
	"parserOptions": {
		"ecmaFeatures": {
			"jsx": true
		},
		"ecmaVersion": 2018,
		"sourceType": "module"
	},
	"plugins": [
		"react"
	],
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"never"
		]
	}
}
```

This is a basic configuration for React projects. 

A couple items worth noting: 

`extends` tells the configuration which ruleset we are adopting. ESLint provides `eslint:recommended` to get you started. You can choose to use it, adopt a *different* ruleset, or remove this field entirely.

Further down we have an object under the `rules` property in our config object.

```
...
"rules": {
	"indent": [
		"error",
		"tab"
	],
	"linebreak-style": [
		"error",
		"unix"
	],
	"quotes": [
		"error",
		"double"
	],
	"semi": [
		"error",
		"never"
	]
}
...
```

Based on the answers I provided to ESLint during the `--init` sequence, it created these rules for me inside the configuration file. Take the [quotes](https://eslint.org/docs/rules/quotes) rule, for example: I told ESLint I prefer `"` to `'` for strings so it added a rule to raise an `error` flag during parsing if any JS code contains strings *without* double quotes.

***Rules listed here take precedence over any rules already defined in the ruleset.***

To add additional rules we provide the *rule name* as a key and the *error level* (either "error", "warn", or "off") as the value inside the `rules` object. *Optionally*, some rules allow additional parameters that modify and flavor how they're applied.

Take a second to browse through the [rules documentation](https://eslint.org/docs/rules/) and get a sense of available rules and additional parameters. If you're curious what rules are included in the `eslint:recommended` ruleset, you can find them here too.

### Running ESLint

To run ESLint command on a folder we do the following:
```
./node_modules/.bin/eslint --ext .jsx,.js ./src --fix
```

Here we've specified the target of our ESLint command - any files inside of `./src` that have the `js` or `jsx` extension. We've also included the `--fix` flag, telling ESLint we'd like it to fix any errors found *if it can*. Cool!

We can include this command inside our `scripts` in `package.json` under an alias to facilitate running this command in the future.

Go ahead and run the command now. Assuming your project is inside the `./src` directory, you should see your linter parsing any javascript files and outputting errors and warnings. Take a second to read the results and then go and fix your code so it complies with your *new style rules*! When you've fixed everything, run the linter again to double check all has been resolved!

### Additional Considerations

So far we've taken a simple ESLint setup using the `eslint:recommended` ruleset and created an alias to run ESLint on *all* are javascript files inside our `./src` folder.

There is a little problem with this approach! ESLint is completely useless if we forget to use the command *before* pushing code to our project repository!

Furthermore, we do not want to check *all* our code for styling and errors, but *only* the code we're getting ready to commit.

There is a solution for this using hooks!

### Lint Staged and Husky

Install `lint-staged` and `husky` as dev dependencies.

```
yarn add -D husky lint-staged
```

`lint-staged` will only run linter on files that are being staged for git commit. This is super useful because we often don't want to run our linters on *all the files* in our project!

Add `lint-staged` configuration.

```
# package.json

...
"lint-staged": {
	"./src/**/*.{js,jsx}": [
		"eslint --fix",
		"git add"
	]
},
...
```

Note we've given `lint-staged` config inside `package.json` a `glob` and array. We're telling `lint-staged`, "Among our `git staged` files *only*, find any files matching this `glob` and run the following commands on those files." We've given *two commands*: `eslint --fix` and `git add`. `lint-staged` will run our linter on files in staging that have the extension `js` or `jsx` inside of `./src`, `--fix` any files, and immediately `git add` those files back to staging.

For files `eslint` is unable to `--fix`, any errors will be printed to the screen for the developer to manually fix and `git add` them.

Try running `lint-staged`

```
./node_modules/.bin/lint-staged
```

This still doesn't fix the issue of someone forgetting to run the linter before commiting and pushing code!

For that we pair `lint-staged` with `husky`.

#### Husky

Husky allows you to implement hooks into our git workflow! Now that we have our ESLint setup and use lint-staged to only run against our staged files, we can add a `pre-commit` hook to always run `lint-staged` prior to actually commiting code.

```
# package.json

...
"husky": {
  "hooks": {
    "pre-commit": "lint-staged"
  }
},
"lint-staged": {
  "./src/**/*.{js,jsx}": [
    "eslint --fix",
    "git add"
  ]
},
...
```
Notice how easy it is to define `husky` hooks in our `package.json`. We're telling husky to run the `lint-staged` command prior to any commit.

Our `lint-staged` command is defined just below that. We define a `glob` pattern to match the files in staging we want to target, then we're telling `lint-staged` to run a series of commands. The first will run ESLint with the `--fix` flag against those files. If all goes well, the second command will add those files back to staging after applying the fix and the commit will succeed. In cases where `eslint` is unable to fix all issues, the commit will be haulted and the developer will need to resolve them manually and attempt to commit again.

Very nice!

# Summary

In this tutorial we learned about linters. ESLint is a javascript linter that allows you to use custom rulesets. Linters are especially useful for work in groups because it ensures a consistent *style* throughout the codebase. `lint-staged` and `husky` are two packages that pair well and complement `eslint`, preventing bad code from being pushed and committed using hooks to intercept the git workflow.

Some rulesets and configuration you may want to explore:

- eslint-config-strongloop
- eslint-config-airbnb

Thank you for reading!
