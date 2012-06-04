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
    @power_trim_count = 0
    @public_trim_count = 0
    @players = ["andistuder", "another"]
  end

  def tweets(limit=15, since=0)
    @db.lrange(REDIS_KEY, 0, limit - 1).collect {|t|
      Tweet.new(JSON.parse(t))
    }.reject {|t| t.received_at <= since}
  end

  def push(data)
    if @players.include?(data["username"])
      @db.lpush(REDIS_KEY, data.to_json)
      @power_trim_count += 1
      if @power_trim_count > TRIM_THRESHOLD
        @db.ltrim(REDIS_KEY, 0, NUM_TWEETS)
        @power_trim_count = 20
      end
    else
      @db.lpush("public", data.to_json)
      @public_trim_count += 1
      if @pulic_trim_count > TRIM_THRESHOLD
        @db.ltrim(REDIS_KEY, 0, NUM_TWEETS)
        @public_trim_count = 20
      end
    end
    if data["username"] == "PGOtest"
      @db.set('croupier', data.to_json)
      puts "PGO tweet received"
    end
  end

  def get_croupier_tweet
    JSON.parse(@db.get('croupier'))
  end

  def get_tweet_data(key="power", limit=15, since=0)
    @db.lrange(key, 0, limit - 1).reject {|t|
      JSON.parse(t)["received_at"] <= since
    }
  end

end
