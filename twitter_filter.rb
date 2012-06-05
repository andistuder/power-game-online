require 'tweetstream'
require File.join(File.dirname(__FILE__), 'tweet_store')

load File.join(File.dirname(__FILE__), 'twitter_authentication.rb')

@tweet_store = TweetStore.new
#query_params = {}
#query_params.merge!(:track => %w(powergameonline power))
#query_params.merge!(:follow => %w(PGOtest))
#puts query_params
#TweetStream::Client.new
#@client = TweetStream::Client.new

#@client.on_inited do
#  puts 'Connected...'
#end
#puts "someting"
#@client.on_no_data_received do
#  puts 'Make note of no data, possi'
#end
#@client.sample do |status|
#  puts "[#{status.user.screen_name}] #{status.text}"
#end
TweetStream::Client.new.track('power', 'powergameonline') do |status|
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
#end
#puts "over"
