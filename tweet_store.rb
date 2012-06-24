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
    @function_trim_count = 0
    @players = []
    @db.lrange('player', 0, 99).each{|id| @players << id.to_i}
    #@players = [53945780, 14060355, 15363578] #lilianelijn, andistuder, richardwilding
    @croupiers = [599169181, 292503547]  # @pgotest and @powergameonline
  end

  def tweets(key='public', limit=15, since=0)
    @db.lrange(key, 0, limit - 1).collect {|t|
      Tweet.new(JSON.parse(t))
    }.reject {|t| t.received_at <= since}
  end

  # @param [Object] data
  def push(data)
    if @croupiers.include?(data["userid"])
      @db.lpush('function', data.to_json)
      @function_trim_count += 1
      if @function_trim_count > TRIM_THRESHOLD
        @db.ltrim('function', 0, NUM_TWEETS)
        @function_trim_count = NUM_TWEETS
      end
    else
      if @players.include?(data["userid"])
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
  end

  def get_croupier_tweet
    JSON.parse(@db.lrange('function',0,0)[0])
  end

  def get_tweet_data(key="power", limit=15, since=0)
    @db.lrange(key, 0, limit - 1).reject {|t|
      JSON.parse(t)["received_at"] <= since
    }.reverse
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
    @db.del('player')
    @players = []
    new_players.each do |player|
      @db.lpush('player', player)
      @players << player
    end
  end
  def get_players
    @players
  end
  def clear_all
    @db.flushall
  end
end
