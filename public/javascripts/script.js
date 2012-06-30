/**
FUNCTIONAL TWEETS:
1. NEW WORDS: X Y Z
2. ... CHOOSE MOST POWERFUL WORD ...
3. ... VOTE NOW ...
4. END ROUND x, the post powerful word is Y
--> at this point return to 1. or end the game using
5. ... GAME OVER ...

**/

$(document).ready(function(){
/** Setup some selectors **/
    var site_url = window.location.href;
    var $croupier_tweet = $('#croupier-tweet'), $info = $('#info'),
    $card1 = $('#card1'),
    $card2 = $('#card2'),
    $card3 = $('#card3'),
    $pCol1 = $('#players1'),
    $pCol2 = $('#players2'),
    $pCol3 = $('#players3');

/** Begin some basic functions **/
    function showInfo(message) {
        $info.html(message).fadeIn();
    }
    function hideInfo(){
        $info.html("").fadeOut();
    }
//    function secondsToString(seconds) {
//        var numdays = Math.floor(seconds / 86400);
//        var numhours = Math.floor((seconds % 86400) / 3600);
//        var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
//        var numseconds = ((seconds % 86400) % 3600) % 60;
//        return "Time to reset is " + numhours + " hours " + numminutes + " minutes " + numseconds + " seconds";
//    }
    function searchTweet(string, check) {
        var a = new RegExp(check, "gi"),
            isMatched = string.match(a);
        //console.log(check,isMatched);
        if (isMatched != null) {
            return true;
        } else {
            return false;
        }
    }
    function renderCroupierTweet(tweet) {
        html = '<p><a href="http://twitter.com/' + tweet.username + '" class="username" target="_blank">' + tweet.username + '</a> ';
        html += tweet.text;
        html += '</p>';
        return $croupier_tweet.html(html);
    }

    function renderPlayerTweet($column, tweet) {
        var html = '<div class="player">';
        html += '<img class="avatar" alt="' + tweet.name + '" height="30" width="30" src="' + tweet.profile_image_url + '" width="48" />';
        html += '<p class="player-tweet"><a href="http://twitter.com/' + tweet.username + '" ';
        html += 'class="username" title="' + tweet.name + '">';
        html += tweet.username + '</a> ';
        html += tweet.text
        html += '</p>';
        $column.find('.waiting').remove();
        return $column.prepend(html);
    }
/** Cards and card functions,
		The scope has gone all to pieces here! **/
	
	var cards = {};
	cards = {
		words : null,
		placeholder : $('#populate'),
		$cardword : $('.card-word'),
		playersTweetTime : null,
		searchTweetTime : null,
		new_words_search : 'new words',		
		with_colon : 'new words:',		
		players_choose_search : 'choose most powerful word',
		players_last_call : 'last call',
		public_vote_search : 'vote now',
		end_round_search : 'end round',
		game_over_search : 'game over',
        first_vote_call : false,
		returnCardHtml : function(word){
			var cardHtml = '<span class="card-word">'+word+'</span>';
			cardHtml += '<span class="vote-count"></span>';
			return cardHtml;
		},
		voteCount : {word1:0,word2:0,word3:0},
		getCroupierTweet : function(stop){
			if(stop == true){return false;}
            var url = site_url+'croupier-tweet'
			$.ajax({
			 	url: url,
			 	dataType : "json",
				statusCode : {
					400 : function(){showInfo("rate limit hit");},
                    500 : function() {showInfo("db error")}
                },
				complete : function(r_tweet){
                    var tweet = $.parseJSON(r_tweet.responseText);
                    cards.processTweet(tweet);
                    setTimeout(function(){cards.getCroupierTweet()},2e3);
			    }
			});
		},
		setNewWords : function(text){
			hideInfo();
			var wordsArray = text.split(' '), chosen = wordsArray.slice(-3), cardHtml = new Array();
			for(i=0;chosen.length>i;i++){
				chosen[i] = $.trim(chosen[i]);
				cardHtml[i] = cards.returnCardHtml(chosen[i]);
			}
			cards.words = chosen; //set card words
			return cards.putOnTable(cardHtml); //put the cards on the table and resize
		},
		putOnTable : function(cwords){
			$(cwords).each(function(i,v){
				var sel = "#card"+(i+1), $card = $(sel);
				$card.html(v);
			});
			return cards.cardResize($('.card-word'));
		},
		cardResize : function($card){
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
		startPlayers : function(){
            setTimeout(function () {
                $.ajax({
                    url:site_url + 'player-tweets?since=' + cards.playersTweetTime,
                    dataType:"json",
                    statusCode:{
                        400:function () {showInfo("rate limit hit");},
                        500:function () {showInfo("db error");}
                    },
                    complete:function (player_tweets) {
                        var tweet_array = $.parseJSON(player_tweets.responseText);
                        cards.filterPlayerTweets(tweet_array);
                    }
                });
            }, 200);
        },
		filterPlayerTweets : function(results){
			if(cards.words != null){
                var words = cards.words;
                for(i=0;i<results.length;i++){
                    var result = $.parseJSON(results[i]);
    				if(searchTweet(result.text, "#"+words[0])){
    					renderPlayerTweet($pCol1, result);
    				}
    				if(searchTweet(result.text, "#"+words[1])){
    					renderPlayerTweet($pCol2, result);
    				}
    				if(searchTweet(result.text, "#"+words[2])){
    					renderPlayerTweet($pCol3, result);
    				}
                    cards.playersTweetTime = result.received_at;
    			}
            }

		},
		startPublicSearch : function(words){
			setTimeout(function(){
                $.ajax({
   			 	    url: site_url + 'public-tweets?since=' + cards.searchTweetTime,
   			 	    dataType : "json",
   				    statusCode : {
                        400:function () {showInfo("rate limit hit");},
                        500:function () {showInfo("db error");}
   				    },
   				    complete : function(public_tweets){
                        var public_tweet_array = $.parseJSON(public_tweets.responseText);
                        cards.checkVotes(public_tweet_array);
                    }
                });
			},300);
		},
		checkVotes : function (results)	{
			if(cards.words!=null){

                var words = cards.words;
    			for(i=0;i<results.length;i++){
                    var result = $.parseJSON(results[i]);
    				if(searchTweet(result.text, "#"+words[0])){
    					cards.voteCount.word1++;
    				}
    				if(searchTweet(result.text, "#"+words[1])){
    					cards.voteCount.word2++;
    				}
    				if(searchTweet(result.text, "#"+words[2])){
    					cards.voteCount.word3++;
    				}
                    cards.searchTweetTime = result.received_at;
    			}
    			cards.setVotes();
            }
		},
		setVotes : function(){
    		//TODO refactor this horribly inefficient function
			var counts = cards.voteCount;
			$card1.children('.vote-count').html(counts.word1 + " votes");
			$card2.children('.vote-count').html(counts.word2 + " votes");
			$card3.children('.vote-count').html(counts.word3 + " votes");
		},
		resetVotes : function(){
            $('.vote-count').empty();
			return cards.voteCount = {word1:0,word2:0,word3:0};
		},
		stopCroupier : function(){
			return cards.getCroupierTweet(true); // param is 'stop' === true, to stop croupier tweets searches.
		},
        resetPlayers : function() {
            $pCol1.html('<p class="waiting">Waiting for nominations...</p>');
            $pCol2.html('<p class="waiting">Waiting for nominations...</p>');
         	$pCol3.html('<p class="waiting">Waiting for nominations...</p>');
        },
		endRound : function (){
			cards.resetVotes();
            cards.resetPlayers();
			$('.card').html('<p class="waiting">Waiting for new words...</p>');
			showInfo("Round has finished, waiting for new words...");
		},
		gameOver : function(){
			//TODO restore all original values
//			cards.stopCroupier();
			cards.resetVotes();
			cards.putOnTable(['<span class="card-word">game</span>','<span class="card-word">has</span>','<span class="card-word">finished</span>']);
			//$('#players1,#players2,#players3').html('<p class="waiting">Game has finished</p>');
			$('#players').hide();
			$('#croupier').hide();
			showInfo("Game Has Ended");
		},
        processTweet : function(tweet) {
            var mostRecent = $.trim(tweet.text);
//            cards.croupierTweetId = tweet.id;  no longer used;
            renderCroupierTweet(tweet);
            var _got_new_words = searchTweet(mostRecent, cards.new_words_search),
                _new_words_colon = searchTweet(mostRecent, cards.with_colon),
                _got_players_choose_words = searchTweet(mostRecent, cards.players_choose_search),
                _got_players_last_call = searchTweet(mostRecent, cards.players_last_call),
                _got_public_vote_now = searchTweet(mostRecent, cards.public_vote_search),
                _got_end_round = searchTweet(mostRecent, cards.end_round_search),
                _got_game_over = searchTweet(mostRecent, cards.game_over_search);

            if (_got_new_words || _new_words_colon) {
                cards.resetVotes();
                cards.resetPlayers();
                cards.setNewWords(mostRecent);
                cards.playersTweetTime = tweet.received_at;
            } else if (_got_players_choose_words || _got_players_last_call) {
                cards.startPlayers();
                cards.searchTweetTime = tweet.received_at;
            } else if (_got_public_vote_now) {
                //Start searching public votes
                if(cards.first_vote_call == false){
                    cards.searchTweetTime = tweet.received_at;
                }
                cards.startPublicSearch(cards.words);
                cards.first_vote_call = true;
            } else if (_got_end_round) {
                cards.endRound();
            } else if (_got_game_over) {
                console.log('Game over');
//              return cards.gameOver();
            } else {
                //if we don't find new words log this
                console.log('Searching for croupier key words, couldn\'nt find anything...');
            }
        }
	};

/** Initialisation **/

    function init() {
//    showInfo("Catching up...");
        var time = 1000;

        $.each(innit_tweets, function (index, value) {
            var tweet = $.parseJSON(value);
            setTimeout(function () {
                cards.processTweet(tweet);
            }, time);
            time += 1000;

        });
        showInfo("Catching up...");
        setTimeout(function () {
            hideInfo();
            cards.getCroupierTweet();
        }, 8e3);
    }
    init();
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
