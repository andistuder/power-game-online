require File.dirname(__FILE__) + '/../web'
require File.expand_path(File.dirname(__FILE__) + '/spec_helper')

describe "web" do

  describe "GET on /" do
    it "should resolve" do
      get '/'
      last_response.should be_ok
    end
  end

  describe "GET /power" do
    it "should call the tweets and resolve" do
      STORE.should_receive(:tweets).and_return([])
      get '/power'
      last_response.should be_ok
    end
  end

  describe "GET /latest" do
    it "should call the tweets and resolve" do
      STORE.should_receive(:tweets).with(5, 0).and_return([])
      get '/latest'
      last_response.should be_ok
    end
  end

  describe "GET /credits" do
    it "should resolve" do
      get '/credits'
      last_response.should be_ok
    end
  end

  describe "GET /how-to-play" do
    it "should resolve" do
      get '/how-to-play'
      last_response.should be_ok
    end
  end

  describe "GET /croupier-tweet" do
    it "should call the tweets and resolve" do
      STORE.should_receive(:get_croupier_tweet).and_return("")
      get '/croupier-tweet'
      last_response.should be_ok
    end
  end

  describe "GET /player-tweets" do
    it "should call the tweets and resolve" do
      STORE.should_receive(:get_tweet_data).with("power", 15, 0).and_return("")
      get '/player-tweets'
      last_response.should be_ok
    end
  end

  describe "GET /player-tweets" do
    it "should call the tweets and resolve" do
      STORE.should_receive(:get_tweet_data).with("public", 25, 0).and_return("")
      get '/public-tweets'
      last_response.should be_ok
    end
  end
  describe "GET /player-tweets" do
    it "should call the tweets and resolve" do
      STORE.should_receive(:get_tweet_data).with("public", 25, 0).and_return("")
      get '/public-tweets'
      last_response.should be_ok
    end
  end

  describe "GET /show-errors" do
    it "should call the tweets and resolve" do
      STORE.should_receive(:get_errors).and_return("")
      get '/show-errors'
      last_response.should be_ok
    end
  end

  describe "GET /delete-errors" do
    it "should call the tweets and resolve" do
      STORE.should_receive(:delete_errors)
      get '/delete-errors'
      last_response.should be_ok
    end
  end

  describe "GET on /set-players" do
    it "should resolve and moan about password" do
      #response = {:code => 404}
      #TwitterRestful.any_instance.stub(:get_list_members).and_return(response)
      get "/set-players"
      last_response.should be_ok
      last_response.body.should include("Set players failed (no password given). Please check the instructions on admin sheet.")
    end

    context "with correct pass phrase" do
      it "should resolve even if Twitter can find the list" do
        response = {:code => 404}
        TwitterRestful.any_instance.should_receive(:get_list_members).with("not-existing","lost").and_return(response)
        get "/set-players?pass=power&list=not-existing&owner=lost"
        last_response.should be_ok
        last_response.body.should include("Set players failed. Error: 404")
      end

      it "should resolve even if no list or owner declared" do
        @members = [123, 456]
        response = {:code => 200, :members => @members}
        TwitterRestful.any_instance.should_receive(:get_list_members).with("power-game-online-players", "powergameonline").and_return(response)
        STORE.should_receive(:set_players).with(@members)
        get "/set-players?pass=power"
        last_response.should be_ok
        last_response.body.should == "Set #{@members.length} players as per powergameonline/power-game-online-players"
      end
    end
  end
end