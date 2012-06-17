require 'sinatra'
require 'haml'
require 'eventmachine'

require File.join(File.dirname(__FILE__), 'tweet_store')
require File.join(File.dirname(__FILE__), 'twitter_restful')

configure :production do
  require 'newrelic_rpm'
end

configure do
  STORE = TweetStore.new
end

get '/' do
  @tweets = STORE.get_tweet_data('function', 4).reverse
  haml :index
end

get '/power' do
  @power_tweets = STORE.tweets
  haml :power
end

get '/latest' do
  @power_tweets = STORE.tweets('public', 5, (params[:since] || 0).to_i)
  @tweet_class = 'latest'
  haml :tweets, :layout => false
end

get '/credits' do
  haml :credits
end

get '/how-to-play' do
  haml :how_to_play
end

get "/admin" do
  haml :admin
end

get '/croupier-tweet' do
  content_type :json
  STORE.get_croupier_tweet.to_json
end

get '/player-tweets' do
  content_type :json
  STORE.get_tweet_data('power', 10, (params[:since] || 0).to_i).to_json
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

get '/set-players' do
  if params[:pass] == "power"
    if params[:list] == "" || params[:list] == nil
      list = "power-game-online-players"
    else
      list = params[:list]
    end
    if params[:owner] == "" || params[:owner] == nil
      owner = "powergameonline"
    else
      owner = params[:owner]
    end
    response = TwitterRestful.get_list_members(list, owner)
    if response[:code] == 200 && response[:members].class == Array
      STORE.set_players(response[:members])
      "Set #{response[:members].length} players as per #{owner}/#{list}"
    else
      "Set players failed. Error: #{response[:code]}"
    end
  else
    'Set players failed (no password given). Please check the instructions on admin sheet.'
  end

end

get '/players' do
  "#{STORE.get_players}"
end

get "/flush" do
  STORE.clear_all
end