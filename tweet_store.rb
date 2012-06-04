require 'json'
require 'redis'
require File.join(File.dirname(__FILE__), 'tweet')

class TweetStore

  REDIS_KEY = 'power'
  NUM_TWEETS = 20
  TRIM_THRESHOLD = 100

  def initialize
    if ENV["REDISTOGO_URL"]
      uri = URI.parse(ENV["REDISTOGO_URL"])
      @db = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
    else
      @db = Redis.new
    end
    @trim_count = 0
  end

  def tweets(limit=15, since=0)
    @db.lrange(REDIS_KEY, 0, limit - 1).collect {|t|
      Tweet.new(JSON.parse(t))
    }.reject {|t| t.received_at <= since}
  end

  def push(data)
    @db.lpush(REDIS_KEY, data.to_json)
    @trim_count += 1
    if @trim_count > TRIM_THRESHOLD
      @db.ltrim(REDIS_KEY, 0, NUM_TWEETS)
      @trim_count = 20
    end
    if data["username"] == "PGOtest"
      @db.set('croupier', data.to_json)
      puts "PGO tweet received"
    end
  end

  def get_croupier_tweet
    JSON.parse(@db.get('croupier'))
    #Tweet.new(JSON.parse(@db.get('croupier')))
  end

  def get_tweet_data(limit=15, since=0)
    #"hello"
    #@db.lrange(REDIS_KEY, 0, limit - 1)
    @db.lrange(REDIS_KEY, 0, limit - 1).reject {|t|
      #puts JSON.parse(t)
      JSON.parse(t)["received_at"] <= since}
  end

end
