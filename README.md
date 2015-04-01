# billmag/konacha fork

Greetings! This fork of konacha provides support for using konacha along with requirejs and requirejs-rails. I will try to keep it up to date as jfirebaugh releases new versions at the original repository. In the past, I've also occasionally gotten ahead of the original repository as new versions of dependent libraries have come out, but no guarantees.

This fork is not published as a gem and relies on some gems that haven't been very diligent about updating their own versions. Thus, some of this fork's dependencies are referred to by their github address, and you'll need to refer to this fork by its github location.

The library also adds sinon and sinon-chai to make your unit testing life easier when you're using it. What follows is an unedited copy of the original README for this project.

# Konacha

[![Build Status](https://secure.travis-ci.org/jfirebaugh/konacha.png?branch=master)](http://travis-ci.org/jfirebaugh/konacha)
[![Dependency Status](https://gemnasium.com/jfirebaugh/konacha.png)](https://gemnasium.com/jfirebaugh/konacha)

Konacha ([koh-NAH-cha], a type of green tea) is a Rails engine that allows you to test your JavaScript with the
[Mocha](http://mochajs.org/) test framework and [chai](http://chaijs.com/)
assertion library.

[![Konacha in action][2]][1]

  [1]: http://www.youtube.com/watch?v=heK78M6Ql9Q
  [2]: https://github.com/jfirebaugh/konacha/raw/master/images/youtube.png

It is similar to [Jasmine](https://github.com/pivotal/jasmine-gem) and
[Evergreen](https://github.com/jnicklas/evergreen), but does not attempt to be framework
agnostic. By sticking with Rails, Konacha can take full advantage of features such as
the asset pipeline and engines.

## Installation

Add konacha to the `:test` and `:development` groups in the Gemfile and `bundle install`:

```ruby
group :test, :development do
  gem 'konacha'
end
```

## Usage

Create a `spec/javascripts` directory and name the files in it with a `_spec`
(or `_test`) suffix. You can write the specs in either JavaScript or
CoffeeScript, using a `.js` or `.js.coffee` extension respectively, like you
would any other script asset.

Require the assets under test and any other dependencies using Sprockets directives.
For example, suppose you wanted to test your cool JavaScript `Array#sum` method, which
you placed in `app/assets/javascripts/array_sum.js`. Write the specs in JavaScript in
the file `spec/javascripts/array_sum_spec.js`:

```javascript
//= require array_sum

describe("Array#sum", function() {
  it("returns 0 when the Array is empty", function() {
    [].sum().should.equal(0);
  });

  it("returns the sum of numeric elements", function() {
    [1,2,3].sum().should.equal(6);
  });
});
```

Or, if you prefer CoffeeScript, in `spec/javascripts/array_sum_spec.js.coffee`:

```coffeescript
#= require array_sum

describe "Array#sum", ->
  it "returns 0 when the Array is empty", ->
    [].sum().should.equal(0)

  it "returns the sum of numeric elements", ->
    [1,2,3].sum().should.equal(6)
```

Your tests are run inside an iframe. You have the entire `<body>` element to
yourself, and it is automatically reset between tests.

## Running (Rake Tasks)

### In the Browser

To start a server for your tests, type:

```
$ bundle exec rake konacha:serve
```

Then open [http://localhost:3500](http://localhost:3500) in your browser, and
you will see all your tests running. You can also go to a sub-page to run an
individual spec file (e.g. `http://localhost:3500/array_sum_spec`), or a path
to a subdirectory to run a subset of specs (e.g.
`http://localhost:3500/models`).

This is the recommended mode for development, since you can simply hit refresh
to reload all your test and asset files. To debug tests, use the `debugger`
statement anywhere in a test to halt execution.

To run code in the JavaScript console, be sure to select the desired iframe
first, so your code runs in the correct context.

![Selecting the test-context frame in Chrome](https://raw.github.com/jfirebaugh/konacha/master/images/frame-select.png)

You can also add the following to your `config/routes.rb` to see the specs run at `/konacha`:

```ruby
Rails.application.routes.draw do
  mount Konacha::Engine, at: "/konacha" if defined?(Konacha)
end
```

### Command-Line Runner

To run your tests from the command line, type:

```
$ bundle exec rake konacha:run
```

To run individual specs, pass a comma separated list of spec file names via
the `SPEC` environment variable.

```
$ bundle exec rake konacha:run SPEC=foo_spec
$ bundle exec rake konacha:run SPEC=foo_spec,bar_spec,etc_spec
```

Konacha includes a default formatter modeled upon RSpec's ProgressFormatter.
Additionally, Konacha's runner implements the same protocol as RSpec, so many
RSpec formatters also work with Konacha.

To specify one or more formatters, provide a comma separated list of class names
in the `FORMAT` environment variable. For example, you can run both Ruby and JavaScript
specs with CI integration using [ci_reporter](https://github.com/nicksieger/ci_reporter):

```
$ bundle exec rake ci:setup:rspec spec konacha:run FORMAT=CI::Reporter::RSpec
```

You will need to `require` any formatters you use. It's a good idea to do this
within a `defined?` check in your [Konacha initializer](#configuration).

To automatically trigger reruns when files change, try [guard-konacha](https://github.com/alexgb/guard-konacha).

## Spec Helper

Since Konacha integrates with the asset pipeline, using setup helpers in your specs is
easy. Just create a `spec_helper.js` or `spec_helper.js.coffee` file in `spec/javascripts`
and require it in your tests:

```javascript
//= require spec_helper
//= require array_sum

describe("Array#sum", function() {
  ...
});
```

The `spec_helper` is a good place to set Mocha and Chai options as well, for instance:

```javascript
// set the Mocha test interface
// see http://mochajs.org/#interfaces
mocha.ui('bdd');

// ignore the following globals during leak detection
mocha.globals(['YUI']);

// or, ignore all leaks
mocha.ignoreLeaks();

// set slow test timeout in ms
mocha.timeout(5);

// Show stack trace on failing assertion.
chai.config.includeStack = true;
```

## Directives and Asset Bundling

We suggest that you explicitly require just the assets necessary for each spec.
Konacha runs each spec file in isolation, and requiring things explicitly will help
ensure your scripts don't accumulate hidden dependencies and tight coupling.

However, you are free to ignore this advice and require the entire application.js asset
bundle in your specs or spec helper, or a bundled subset of assets. Requiring bundled
assets works like it does in Rails development mode -- Konacha will detect the complete
set of dependencies and generate a separate script tag for each one. You won't have to
search through a many thousand line application.js bundle to debug a spec failure.

## Configuration

Konacha can be configured in an initializer, e.g. `config/initializers/konacha.rb`:

```ruby
Konacha.configure do |config|
  config.spec_dir     = "spec/javascripts"
  config.spec_matcher = /_spec\.|_test\./
  config.stylesheets  = %w(application)
  config.driver       = :selenium
end if defined?(Konacha)
```

The `defined?` check is necessary to avoid a dependency on Konacha in the production
environment.

The `spec_dir` option tells Konacha where to find JavaScript specs.  `spec_matcher`
is an object responding to `===` (most likely a `Regexp`); it receives a filename
and should return true if the file is a spec. The `stylesheets` option sets the
stylesheets to be linked from the `<head>` of the test runner iframe. `driver`
names a Capybara driver used for the `run` task. The values above are the defaults.

For [PhantomJS](https://github.com/jonleighton/poltergeist#installing-phantomjs)
support you can use the [poltergeist](https://github.com/jonleighton/poltergeist)
driver. Require capybara/poltergeist in the configure block:

```ruby
Konacha.configure do |config|
  require 'capybara/poltergeist'
  config.driver = :poltergeist
end if defined?(Konacha)
```

## Test Interface and Assertions

Konacha includes a vendored copy of mocha.js and the [chai](http://chaijs.com/)
assertion libraries. By default, it configures Mocha to use the "BDD" test
interface, which provides `describe()`, `it()`, `before()`, `after()`,
`beforeEach()`, and `afterEach()`.

Konacha will make all three of chai's assertion styles available to you: `expect`,
`should`, and `assert`. See the chai documentation for the details.

If you use jQuery, you may want to check out [chai-jquery](https://github.com/jfirebaugh/chai-jquery)
for some jQuery-specific assertions. There are a lot of interesting chai
matchers out there, see [the chai plugins page](http://chaijs.com/plugins)

To make all these available for your konacha environment, see the
[Konacha-chai-matchers gem](https://github.com/matthijsgroen/konacha-chai-matchers)

## Templates / Fixtures

Konacha has no template (a.k.a. HTML fixture) support of its own. Instead, we suggest you use
Sprocket's built in support for JavaScript template (`.jst`) files. Add a `spec/javascripts/templates`
directory, place template files there (using any JS template language supported by Sprockets),
require them in your spec or spec_helper, and render them into the `<body>`.

Note that if you want to use EJS as in the following example, you need to add that gem to your Gemfile:

```ruby
gem "ejs"
```

For example, in `spec/javascripts/templates/hello.jst.ejs`:

```html
<h1>Hello Konacha!</h1>
```

In `spec_helper.js`:

```javascript
//= require_tree ./templates
```

And your spec:

```javascript
//= require spec_helper

describe("templating", function() {
  it("is built in to Sprockets", function() {
    $('body').html(JST['templates/hello']());
    $('body h1').text().should.equal('Hello Konacha!');
  });
});
```

## Upgrading from Konacha 2.x

The only backward-incompatible change in Konacha 3.0 is that Ruby 1.8.7 is
no longer supported. Please upgrade to 1.9.3 or 2.0.

## Contributing

```bash
git clone git://github.com/jfirebaugh/konacha.git
```

Run `bundle exec rake` to run the test suite.

### Contributing to Mocha and Chai

The Konacha repository includes the
[Mocha](https://github.com/mochajs/mocha) and
[Chai](https://github.com/chaijs/chai) repositories as submodules, so
you can hack on them directly:

```bash
cd mocha # or: cd chai
git checkout master
... hack-hack-hack ...
bundle exec rake assets # make and cp assets based on your changes
```

Assuming your app's Gemfile points at your Konacha checkout (`gem 'konacha',
:path => '~/path/to/konacha'`), your changes to Mocha and Chai are live in
localhost:3500 when you refresh your browser.

You can send pull requests to Mocha and Chai straight out of your submodules.

## See Also

Prior art:

* [Jasmine](https://github.com/pivotal/jasmine-gem)
* [Evergreen](https://github.com/jnicklas/evergreen)

Similar projects:

* [Teaspoon](https://github.com/modeset/teaspoon)
