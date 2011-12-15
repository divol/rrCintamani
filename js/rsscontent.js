/**
 *    rrCintamani
 *    multi touch rss reader
 *
 *
 *    Copyright (c) 2011, David Olivari
 *    All rights reserved.
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *    RSS Code extract from : Chad Udell http://visualrinse.com/2008/09/24/how-to-build-a-simple-rss-reader-with-jquery/
 */

/**
 * populate class feedReader div with rss stream from the opml indicate by utl attribute
 *
 */
function populateFromOpml() {
	$('.feedReader').each(function(index, frame) {
		if($(this).attr('url')) {
			var count = 0;
			// feed counter
			$.get($(this).attr('url'), function(d) {
				// opml loading
				var feedList = $(d).find('outline');
				if(defaultPanelWidth < screen.width / feedList.length) {
					// prevent "black" space because of too few feed to fill width
					defaultPanelWidth = Math.floor(screen.width / feedList.length);
					isHorizontalScrollEnable = false;
				}
				feedList.each(function() {
					// for each feed prepare the html skeleton
					if($(this).attr('type')) {
						if($(this).attr('type') == 'rss') {
							count = (count + 1) % 4;
							// modulo for to iterate thru the 4 colors
							var html = '<div class="feedPanel pan' + (count + 1) + '">';
							html += '<div class="feedHeader">';
							html += $(this).attr('title') + '</div>';
							html += '<div class="feedContent" name="' + $(this).attr('xmlUrl') + '"></div>';
							html += '</div>';
							$(frame).append($(html));
						}
					}
				});

				$('.feedContent').each(function(index, frame) {
					// Iterate on the feeds to fill with items
					getRssFeed($(this), $(this).attr('name'));
					// Populate feed content
					setupContentTouchIteraction(frame);
					// setup touch callback
				});
			});
		}
		$(this)
	});
}

/**
 * Ajax proxy access
 * @param url distant server data source url
 * @param mime expected mime type
 */
function XHRProxified(url, mime) {

	if(document.location.port == 8000) {
		// local python proxy
		return '/__ajaxproxy/' + url;
	} else {
		// hosted internet php proxy
		return 'http://www.bype.org/proxy.php?mimeType=' + mime + '&url=' + escape(url);
	}
}

function shortenUrl(longUrl, imgElt) {
	$.getJSON("https://api-ssl.bitly.com/v3/shorten?callback=?", {
		"format" : "json",
		"apiKey" : 'R_3a2dd5771d80c3fd9eb4acf2a6cc7190',
		"login" : 'davidonet',
		"longUrl" : longUrl
	}, function(response) {
		imgElt.setAttribute('src', response.data.url + '.qrcode');
		$(imgElt).animate({
			width : "96px",
			height : "96px"
		}, 1000).delay(10000).animate({
			width : "32px",
			height : "32px"
		});
	});
}

/**
 * @param panel the target DOM element for feed content
 * @param url rss feed url
 */
function getRssFeed(panel, url) {
	//clear the content in the div for the next feed.
	panel.empty();

	/* use the JQuery get to grab the URL from the selected item, put the results in to an
	 * argument for parsing in the inline function called when the feed retrieval is complete
	 * Added the proxy prefix path
	 */
	$.get(XHRProxified(url, 'application/xml;charset=UTF-8'), function(d) {

		// Hide the panel waiting for http loading
		panel.parent().hide();
		//find each 'item' in the file and parse it
		$(d).find('item').each(function() {

			//name the current found item this for this particular loop run
			var $item = $(this);
			// grab the post title
			var title = $item.find('title').text();
			// grab the post's URL

			var description = $item.find('description').text();
			var img = " ";
			try {
				var content = $item.find('[nodeName="content:encoded"]').text();
				var imgElt = $(content).find('img')[0];
				// Get the first image in the content
				if(imgElt) {
					imgElt.setAttribute('class', '');
					img = imgElt.outerHTML;
					// Doesn't work with firefox :-() for CORS reason
				}
			} catch(err) {
				console.log("pb with img search" + err);
			}

			var pubDate = $item.find('pubDate').text();

			// now create a var 'html' to store the markup we're using to output the feed to the browser window
			var html = "<div class=\"entry\"><h2 class=\"postTitle\">" + title + "<\/h2>";
			html += "<em class=\"date\">" + pubDate + "</em><br/>";
			html += img;
			html += "<p class=\"description\">" + description + "</p>";
			//put that feed content on the screen!
			panel.append($(html));
			$(document.createElement("img")).attr({
				src : 'img/qrcode-icon.png',
				name : $item.find('link').text()
			}).addClass("qrcode").appendTo(panel).one('touchend', function() {
				shortenUrl(this.getAttribute('name'), this);
			});
			$(document.createElement("hr")).appendTo(panel);
		});
		// panel populate and filled make an animation to the default width
		panel.parent().show();
		panel.parent().animate({
			width : defaultPanelWidth + 'px'
		}, 1000);
	});
};