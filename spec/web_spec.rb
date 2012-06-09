require File.expand_path(File.dirname(__FILE__) + '/spec_helper')

describe "web" do

  describe "GET on /" do

    it "should resolve" do
      get '/'
      last_response.should be_ok
    end
  end
end