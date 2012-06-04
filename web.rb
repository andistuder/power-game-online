require 'sinatra'
require 'haml'
require File.join(File.dirname(__FILE__), 'tweet_store')

configure do
  STORE = TweetStore.new
end

get '/' do
  #@croupier_tweet = STORE.get_croupier_tweet
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
  STORE.get_croupier_tweet.jasonize
  #TODO make this a bit smarter
end

get '/player-tweets' do
  #@tweets = []
  STORE.get_tweet_data(5, (params[:since] || 0).to_i).to_json
end
