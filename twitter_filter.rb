require 'tweetstream'
require File.join(File.dirname(__FILE__), 'tweet_store')

load File.join(File.dirname(__FILE__), 'twitter_authentication.rb')

@tweet_store = TweetStore.new
query_params = {}
query_params.merge!(:track => 'powergameonline')
query_params.merge!(:follow => 'PGOtest')
puts query_params
#TweetStream::Client.new.track('powergameonline') do |status|
TweetStream::Client.new.filter(query_params ) do |status|
  @tweet_store.push(
    'id' => status[:id],
    'text' => status.text,
    'username' => status.user.screen_name,
    'userid' => status.user[:id],
    'name' => status.user.name,
    'profile_image_url' => status.user.profile_image_url,
    'created_at' => status.created_at,
    'received_at' => Time.new.to_i
  )
end
