source 'http://rubygems.org'

gem "sinatra", "~> 1.3.2"
gem "thin"
gem "foreman", "~> 0.46.0"


gem "tweetstream", "~> 2.0.0"
gem "redis", "~> 3.0.1"
gem "json", "~> 1.7.3"
gem "haml", "~> 3.1.6"
gem "httparty", "~> 0.8.3"

group :production do
  gem 'newrelic_rpm'
end

group :development do
  gem "heroku_plus"
  gem "shotgun", "~> 0.9"
  gem 'guard'
  gem 'guard-rspec'
  gem 'growl'
end

group :test do
  gem "rspec", "~> 2.10.0"
  gem "rack-test", "~> 0.6.1"
  gem "webmock", "~> 1.8.7"
end