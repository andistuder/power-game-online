require 'sinatra'
require 'haml'
require File.join(File.dirname(__FILE__), 'tweet_store')

configure do
  STORE = TweetStore.new
end

get '/' do
  haml :index
end

get '/power' do
  @power_tweets = STORE.tweets
  haml :power
end

get '/latest' do
  @power_tweets = STORE.tweets(5, (params[:since] || 0).to_i)
  @tweet_class = 'latest'
  haml :tweets, :layout => false
end

get '/credits' do
  haml :credits
end
get '/how-to-play' do
  haml :how_to_play
end
