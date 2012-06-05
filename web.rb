require 'sinatra'
require 'haml'
require 'eventmachine'

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

get '/croupier-tweet' do
  content_type :json
  STORE.get_croupier_tweet.to_json
end

get '/player-tweets' do
  content_type :json
  STORE.get_tweet_data('power', 15, (params[:since] || 0).to_i).to_json
end

get '/public-tweets' do
  content_type :json
  STORE.get_tweet_data('public', 25, (params[:since] || 0).to_i).to_json
end

get '/show-errors' do
  content_type :json
  STORE.get_errors.to_json
end

get '/delete-errors' do
  content_type :json
  STORE.delete_errors.to_json
end