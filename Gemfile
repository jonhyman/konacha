source 'https://rubygems.org'
gemspec

gem "railties", "~> 4.1.0"
gem "sprockets-rails"
gem "activemodel" # https://github.com/rspec/rspec-rails/pull/798

# TODO(billmag) - Once requirejs-rails updates to the newer version of r.js and require.js, move this to the gemspec.
# TODO(billmag) - According to this thread: https://groups.google.com/forum/?fromgroups=#!topic/requirejs/TZzdEQCvouI the
# newest version of RequireJS is going to break Mocha tests because it runs the require call asynchronously and mocha
# doesn't wait around for the call to finish like QUnit does.
gem "requirejs-rails", :git => "https://github.com/billmag/requirejs-rails.git"
