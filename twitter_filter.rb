require 'tweetstream'
require File.join(File.dirname(__FILE__), 'tweet_store')

load File.join(File.dirname(__FILE__), 'twitter_authentication.rb')

@tweet_store = TweetStore.new
query_params = {}
query_params.merge!(:track => "powergameonline")
query_params.merge!(:follow => "599169181,292503547") # @pgotest and @powergameonline
puts query_params

@client = TweetStream::Client.new

@client.on_inited do
  msg = {:msg => "TweetStream: Connected...", :timestamp => Time.new}
  @tweet_store.write_errors(msg)
end
@client.on_no_data_received do
  msg = {:msg => "TweetStream: No data received ...", :timestamp => Time.new}
  @tweet_store.write_errors(msg)

end
@client.on_error do |message|
  msg = {:msg => "TweetStream: Error #{message}", :timestamp => Time.new}
  @tweet_store.write_errors(msg)

end
@client.on_limit do |skip_count|
  msg = {:msg => "TweetStream: skip count #{skip_count}", :timestamp => Time.new}
  @tweet_store.write_errors(msg)

end

@client.on_delete do |status_id, user_id|
  msg = {:msg => "TweetStream: delete #{status_id} of user #{user_id}", :timestamp => Time.new}
  #TODO Tweet.delete(status_id)
  @tweet_store.write_errors(msg)

end
@client.on_reconnect do |timeout, retries|
  msg =  {:msg => "TweetStream: on reconnect timeout:#{timeout}, retries#{retries}", :timestamp => Time.new}
  @tweet_store.write_errors(msg)

end

@client.filter(query_params) do |status|
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
