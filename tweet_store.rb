require 'json'
require 'redis'
require File.join(File.dirname(__FILE__), 'tweet')

class TweetStore

  NUM_TWEETS = 40
  TRIM_THRESHOLD = 200

  def initialize
    if ENV["REDISTOGO_URL"]
      uri = URI.parse(ENV["REDISTOGO_URL"])
      @db = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
    else
      @db = Redis.new
    end
    @power_trim_count = 0
    @public_trim_count = 0
    @players = [53945780, 15363578, 15363578] #lilianelijn, andistuder, richardwilding
    @croupiers = [599169181, 292503547]  # @pgotest and @powergameonline
  end

  def tweets(limit=15, since=0)
    @db.lrange('public', 0, limit - 1).collect {|t|
      Tweet.new(JSON.parse(t))
    }.reject {|t| t.received_at <= since}
  end

  def push(data)
    if @croupiers.include?(data["userid"])
      @db.set('croupier', data.to_json)
    elsif @players.include?(data["userid"])
      @db.lpush('power', data.to_json)
      @power_trim_count += 1
      if @power_trim_count > TRIM_THRESHOLD
        @db.ltrim('power', 0, NUM_TWEETS)
        @power_trim_count = NUM_TWEETS
      end
    else
      @db.lpush('public', data.to_json)
      @public_trim_count += 1
      if @public_trim_count > TRIM_THRESHOLD
        @db.ltrim('public', 0, NUM_TWEETS)
        @public_trim_count = NUM_TWEETS
      end
    end
  end

  def get_croupier_tweet
    JSON.parse(@db.get('croupier'))
  end

  def get_tweet_data(key="power", limit=15, since=0)
    @db.lrange(key, 0, limit - 1).reject {|t|
      JSON.parse(t)["received_at"] <= since
    }
    #TODO maybe write to parse proper?
  end

  def write_errors(message)
    @db.lpush("error", message.to_json)
  end

  def get_errors
    no_of_errors = @db.llen('error')
    @db.lrange('error', 0, no_of_errors - 1).collect{|e|
    JSON.parse(e)}
    #TODO join with above?
  end
  def delete_errors
    no_of_errors = @db.llen('error')
    @errors = []
    @db.llen('error').times do
      @errors << JSON.parse(@db.lpop('error'))
    end
    @errors
    #TODO join with above?
  end

  def set_players(new_players)
    @players = new_players
  end
end
