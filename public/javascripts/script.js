/**
FUNCTIONAL TWEETS:
1. NEW WORDS: X Y Z
2. ... CHOOSE MOST POWERFUL WORD ...
3. ... VOTE NOW ...
4. END ROUND x, the post powerful word is Y
--> at this point return to 1. or end the game using
5. ... GAME OVER ...

**/

$(function(){


/** Setup some selectors **/

var $croupier_tweet = $('#croupier-tweet'), $info = $('#info'),
$card1 = $('#card1'),
$card2 = $('#card2'),
$card3 = $('#card3'),
$pCol1 = $('#players1'),
$pCol2 = $('#players2'),
$pCol3 = $('#players3'); //yes it's dumb atm.

/** Begin some basic functions **/
	
	
//Info Panel
function showInfo(message)
{
	$info.html(message).fadeIn();
}

function hideInfo(){
	$info.html("").fadeOut();
}

function secondsToString(seconds)
{
	
	var numdays = Math.floor(seconds / 86400);
	var numhours = Math.floor((seconds % 86400) / 3600);
	var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
	var numseconds = ((seconds % 86400) % 3600) % 60;
	
	return "Time to reset is " + numhours + " hours " + numminutes + " minutes " + numseconds + " seconds";

}
	
function searchTweet(string, check){
	var a = new RegExp(check, "gi"),
    isMatched = string.match(a);
    //console.log(check,isMatched);	
	if(isMatched != null){
		return true;
	} else return false;
};

function renderCroupierTweet(tweet){
		//console.log(tweet);
  		html = '<p><a href="http://twitter.com/' + tweet.username + '" class="username" target="_blank">'+ tweet.username +'</a> ';
  		//html += container[twitterlib].ify.clean(tweet.text);
  		html += tweet.text;
  		html += '</p>';
  		return $croupier_tweet.html(html);
};

function renderPlayerTweet($column, tweet){
//    console.log(tweet)
	var html = '<div class="player">';
	html += '<img class="avatar" alt="' + tweet.name + '" height="30" width="30" src="' + tweet.profile_image_url + '" width="48" />';
	html += '<p class="player-tweet"><a href="http://twitter.com/' + tweet.username + '" ';
	html += 'class="username" title="' + tweet.name + '">';
	html += tweet.username + '</a> ';
	html += tweet.text
//	html += twitterlib.ify.clean(tweet.text); TODO maybe we need this?
	html += '</p>';

	//update tweet id to last tweet id rendered to ensure we look for "new" tweets
	//console.log(cards.playersTweetId, "before");

	cards.playersTweetId = tweet.received_at;
	
	//console.log(cards.playersTweetId, "after");

	$('.waiting').remove(); //just in case
	
	return $column.prepend(html);
};
	
	/** Cards and card functions,
		The scope has gone all to pieces here!
	**/
	
	var cards = {};
	cards = {
		words : ['war', 'love', 'live'],
//		words : null, TODO change back
		placeholder : $('#populate'),
		$cardword : $('.card-word'),
		croupierTweetId : null,
		playersTweetId : null,
		searchTweetId : null,
		new_words_search : 'new words',		
		with_colon : 'new words:',		
		players_choose_search : 'choose most powerful word',
		public_vote_search : 'vote now',
		end_round_search : 'end round',
		game_over_search : 'game over',
		returnCardHtml : function(word){
			var cardHtml = '<span class="card-word">'+word+'</span>';
			cardHtml += '<span class="vote-count"></span>';
			return cardHtml;
		},
		voteCount : {word1:0,word2:0,word3:0},
		getCroupierTweet : function(stop)
		{
			if(stop == true){return false};
			
						
//			var url = 'http://api.twitter.com/1/statuses/user_timeline.json?';
//			url += 'screen_name=powergameonline&count=1&page=1&include_rts=false';
//
//			if(cards.croupierTweetId != null){
//				url += '&since_id='+cards.croupierTweetId;
//			}
            var url = 'http://localhost:9393/croupier-tweet'
			
			/** test rate limiting - seems to fail if requested from jquery :'( **/
			/*
			$.ajax({
			 	url: "http://api.twitter.com/1/account/rate_limit_status.json?",
				complete : function(data){
					showInfo(secondsToString(date.reset_time_in_seconds));
				}
			});
			
			return false;
			*/
				
			
			
			$.ajax({
			 	url: url,
			 	dataType : "json",
				statusCode : {
					400 : function(){
						showInfo("rate limit hit");
					}
				},
				complete : function(r_tweet){
					if(r_tweet.statusText == 'error'){
						showInfo("rate limit has been hit... game should come back online in 15 minutes");
						cards.stopPublicSearch();
						cards.stopPlayers();
						return setTimeout(function(){cards.getCroupierTweet()},600e3);
					} else {
			
				// FOR TESTING USE THIS - var tweet = $.parseJSON(croupier_test);
                        var tweet = $.parseJSON(r_tweet.responseText);

						var	mostRecent = $.trim(tweet.text);
						//set croupier tweet id to most recent
						cards.croupierTweetId = tweet.id;
						
						renderCroupierTweet(tweet);	//render the tweet into the page
					
						//Define searches
						//console.log(mostRecent, cards.new_words_search);
												
						var	_got_new_words = searchTweet(mostRecent, cards.new_words_search),
						_new_words_colon = searchTweet(mostRecent, cards.with_colon),
						_got_players_choose_words = searchTweet(mostRecent, cards.players_choose_search),
						_got_public_vote_now = searchTweet(mostRecent, cards.public_vote_search),
						_got_end_round = searchTweet(mostRecent, cards.end_round_search),
						_got_game_over = searchTweet(mostRecent, cards.game_over_search);
						
						if(_got_new_words || _new_words_colon){
							//Set new words
							cards.setNewWords(mostRecent);
						} else if (_got_players_choose_words) {
							// Start searching players list
							cards.startPlayers();
						} else if (_got_public_vote_now){
							//Start searching public votes
							cards.startPublicSearch(cards.words);
						} else if (_got_end_round){
							//end the round...
							cards.endRound();
						} else if (_got_game_over){
							return cards.gameOver();
						} else{ 
							//if we don't find new words log this
							log('Searching for croupier key words, couldn\'nt find anything...');
						}
						//one minute search timeout
						setTimeout(function(){cards.getCroupierTweet()},5e3);
					
					
					}
				}				
			});
						
		},
		setNewWords : function(text)
		{
			hideInfo();
	
			//split the tweet into an array, grab all the words after 'new words'
			var wordsArray = text.split(' '), chosen = wordsArray.slice(-3), cardHtml = new Array();
						
			//dumbest way of generating this array eva? And is this even necessary?
			for(i=0;chosen.length>i;i++)
			{
				chosen[i] = $.trim(chosen[i]);
				cardHtml[i] = cards.returnCardHtml(chosen[i]);
			}
			
			cards.words = chosen; //set card words
			
			//console.log("card words set as",cards.words);
						
			return cards.putOnTable(cardHtml); //put the cards on the table and resize

		},
		putOnTable : function(cwords)
		{
			$(cwords).each(function(i,v){
				var sel = "#card"+(i+1), $card = $(sel);
				$card.html(v);
			});

			return cards.cardResize($('.card-word'));

		},
		
		cardResize : function($card)
		{
			/* Text reszier function, hat tip to:
				http://vidasp.net/tinydemos/adjust-font-size.html
			*/
			$card.each(function() {
			
				var $this = $(this), boxWidth = $(this).css("width"), fontSize = parseInt($(this).css("fontSize"), 10),
				$line, lineWidth;
				
				$this.html(function(i,v) {
					return $("<span>").text(v).css({"white-space":"nowrap","vertical-align":"bottom"});
				});
				
				$line = $this.children("span").first();
				lineWidth = $line.css("width");
				
				while ( lineWidth < boxWidth ) {
					fontSize += 1;
					$line.css("fontSize", fontSize + "px");
					lineWidth = $line.css("width");
				}
				
				fontSize -= 5; // reduce down to fit once we've found the absolute value.
				$line.css("fontSize", fontSize + "px");
			
			});
		},
		startPlayers : function(stop){
			if(stop === true) return;
			
			$('.waiting').remove();

			
			log("starting players");
			
			setTimeout(function(){
                    $.ajax({
       			 	url: 'http://localhost:9393/player-tweets?since=' + cards.playersTweetId,
       			 	dataType : "json",
       				statusCode : {
       					400 : function(){
       						showInfo("rate limit hit");
       					}
       				},
       				complete : function(player_tweets){
//                           console.log("Andi");
//                           console.log(player_tweets.responseText);
//                           console.log($.parseJSON(player_tweets.responseText));
                           var tweet_array = $.parseJSON(player_tweets.responseText)
                           cards.filterPlayerTweets(tweet_array);
                       }
                    });
                console.log(cards.playersTweetId);
			//get players timeline
//				twitterlib.list('powergameonline/power-game-online-players',
//					{ filter: '-R OR -via', since: cards.playersTweetId }, cards.filterPlayerTweets);
			},20e3); // 60e3 wait a minute before checking for nominations
			
			// Add a loop in here.
			return setTimeout(function(){cards.startPlayers()},100e3);

		},
		filterPlayerTweets : function(results)
		{
			//define columns based on words
			//console.log(results);
			var words = cards.words;
						
			//Loop through results and assign votes to each word
				//TODO make less stupid
			for(i=0;i<results.length;i++){

                var result = $.parseJSON(results[i]);
//                console.log(result)

				if(searchTweet(result.text, "#"+words[0])){
					renderPlayerTweet($pCol1, result);
				}
				if(searchTweet(result.text, "#"+words[1])){
					renderPlayerTweet($pCol2, result);
				}
				if(searchTweet(result.text, "#"+words[2])){
					renderPlayerTweet($pCol3, result);
				}
			}
			
			//TODO - set cards.playersTweetId so we don't permaloop
			
		},
		startPublicSearch : function(words,stop)
		{
			//console.log(words,stop);
			if(stop === true) return;
			
			setTimeout(function(){
			//get public search
				twitterlib.search(words[0] + ' OR ' + words[1] + ' OR ' + words[2] + ' OR #powergameonline', 
				{ since: cards.searchTweetId }, cards.checkVotes);
			},30e3); // 30 second timeout
			
			return setTimeout(function(){cards.startPublicSearch(words,stop);},30e3); //30 second timeout
						
		},
		checkVotes : function (results)
		{
			//check the results of timeline search and update vote count
			//console.log(cards.words);
			//console.log(results);
			
			var words = cards.words;
						
			//console.log(cards.voteCount,'votes obj before');
			//Loop through results and assign votes to each word
				//TODO make less stupid
			for(i=0;i<results.length;i++){
				if(searchTweet(results[i].text, words[0])){
					cards.voteCount.word1++;
				}
				if(searchTweet(results[i].text, words[1])){
					cards.voteCount.word2++;
				}
				if(searchTweet(results[i].text, words[2])){
					cards.voteCount.word3++;
				}
			}
			//console.log(cards.voteCount,'votes obj after');
			
			cards.setVotes();
			
			cards.searchTweetId = results[results.length-1].id; //Set cards.searchTweetId to last ID we don't infinitely loop
			
		},
		setVotes : function()
		{
			//puts vote counts on table
				//TODO refactor this horribly inefficient function
			var counts = cards.voteCount;
			$card1.children('.vote-count').html(counts.word1 + " votes");
			$card2.children('.vote-count').html(counts.word2 + " votes");
			$card3.children('.vote-count').html(counts.word3 + " votes");
			
		},
		resetVotes : function()
		{
			return cards.voteCount = {word1:0,word2:0,word3:0};
		},
		stopPlayers : function()
		{
			return cards.startPlayers(true);
		},
		stopPublicSearch : function()
		{
			return cards.startPublicSearch(false,true);
		},
		stopCroupier : function()
		{
			return cards.getCroupierTweet(true); // param is 'stop' === true, to stop croupier tweets searches.

		},
		endRound : function ()
		{
			//Add round over notice
			//Stop all queries apart from croupier
			//reset all counts etc.
			cards.stopPublicSearch();
			cards.stopPlayers();
			cards.resetVotes();
			$('.card').html('<p class="waiting">Waiting for new words...</p>');
			$pCol1.html('<p class="waiting">Waiting for nominations...</p>');
			$pCol2.html('<p class="waiting">Waiting for nominations...</p>');
			$pCol3.html('<p class="waiting">Waiting for nominations...</p>');
			showInfo("Round has finished, waiting for new words...");

		
		},
		gameOver : function()
		{
			//TODO restore all original values
			
			cards.stopPublicSearch();
			cards.stopPlayers();
			cards.stopCroupier();
			cards.resetVotes();
						
			cards.putOnTable(['<span class="card-word">game</span>','<span class="card-word">has</span>','<span class="card-word">finished</span>']);
			//$('#players1,#players2,#players3').html('<p class="waiting">Game has finished</p>');
			$('#players').hide();
			$('#croupier').hide();
			
			showInfo("Game Has Ended");
			
			return;
		}

	}
	
//NO Tweets



//Initialisation

function init(){
	showInfo("Ready to start...");
	setTimeout(function(){cards.getCroupierTweet()},1e3);
}

init();

/***
Tests
***/
//cards.setNewWords('power hope light');
//cards.startPublicSearch(['power','hope','light'],false);
//cards.startPlayers();
//cards.startPlayers();	
//cards.endRound();
//cards.gameOver();
	
});


// log helper
String.prototype.count=function(s1) { 
    return (this.length - this.replace(new RegExp(s1,"g"), '').length) / s1.length;
}
window.log = function() {
    log.history = log.history || [];
    log.history.push(arguments);
    if (this.console) {
        var message = arguments[0];
        var args = Array.prototype.slice.call(arguments, 1);
        if (typeof message === 'string' && arguments[0].count('%@') == args.length) {
            for(var a in args) {
                message = message.replace('%@', args[a]);
            }
        }
        console.log(message);
    }
};
