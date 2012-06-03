require 'sinatra'

configure do
  require 'redis'
  if ENV["REDISTOGO_URL"]
    uri = URI.parse(ENV["REDISTOGO_URL"])
    REDIS = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
  else
    REDIS = Redis.new
  end
end

get '/' do
  "Hello, world"
end