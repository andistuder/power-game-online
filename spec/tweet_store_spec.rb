require 'spec_helper'

describe TweetStore do

  it "can be initialised" do
    TweetStore.new.should be_an_instance_of(TweetStore)
  end

  describe 'tweets' do
    pending
  end
end