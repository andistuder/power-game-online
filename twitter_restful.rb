require 'httparty'

class TwitterRestful
  include HTTParty
  #base_uri 'https://api.twitter.com'

  def get_list_members(list, owner)
    response = self.class.get("https://api.twitter.com/1/lists/members.json?slug=#{list}&owner_screen_name=#{owner}&cursor=-1&skip_status=1")
    #puts response.body, response.code, response.message, response.headers.inspect
    out = {}
    out[:code] = response.code
    users = JSON.parse(response.body)["users"]
    if users.class == Array
      out[:members] = users.collect{|u| u["id"]}
    end
    out
  end
end