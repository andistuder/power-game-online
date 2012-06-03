require 'sinatra'
require 'haml'
require File.join(File.dirname(__FILE__), 'tweet_store')

configure do
  STORE = TweetStore.new
end

get '/' do
  "Hello, world."
end

get '/power' do
  @power_tweets = STORE.tweets
  haml :index
end

get '/latest' do
  @power_tweets = STORE.tweets(5, (params[:since] || 0).to_i)
  @tweet_class = 'latest'
  haml :tweets, :layout => false
end