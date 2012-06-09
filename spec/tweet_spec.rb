require 'spec_helper'

describe Tweet do

  it "can be initialised" do
    data = true
    Tweet.new(data).should be_an_instance_of(Tweet)
  end
end