# Load the Sinatra app
#require File.dirname(__FILE__) + '/../web'

require 'rspec'
require 'rack/test'
require 'webmock/rspec'

set :environment, :test

RSpec.configure do |conf|
  conf.include Rack::Test::Methods
end

def app
  Sinatra::Application
end