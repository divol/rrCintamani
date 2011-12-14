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
 *    UX Design : pliage, Citymedia, Pascal Chirol (ENSADLabs), Douglas Edric Stanley
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

/**
 * @param panel the target DOM element for feed content
 * @param url rss feed url
 */
function get_rss_feed(panel, url) {
	//clear the content in the div for the next feed.
	panel.empty();

	//use the JQuery get to grab the URL from the selected item, put the results in to an argument for parsing in the inline function called when the feed retrieval is complete
	//Added the proxy prefix path
	$.get(XHRProxified(url, 'application/xml;charset=UTF-8'), function(d) {

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
					//imgElt.setAttribute('src',XHRProxified(imgElt.getAttribute('src'),'image/jpeg'));
					imgElt.setAttribute('class', '');
					img = imgElt.outerHTML;
					// Doesn't work with firefox :-()
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
			//html += content;
			html += "<hr/>";

			//put that feed content on the screen!
			panel.append($(html));
		});
	});
};

/**
 * touch event copy function to avoid cross reference
 * @param aEvent the event to be copied
 * @return the new event object
 */
function copyTouch(aEvent) {
	var retTouch = new Object();
	retTouch.identifier = aEvent.changedTouches[0].identifier;
	retTouch.pageX = aEvent.changedTouches[0].pageX;
	retTouch.pageY = aEvent.changedTouches[0].pageY;
	retTouch.timestamp = aEvent.timeStamp;
	return retTouch;
}

/**
 * Setup touch event handling for a given DOM Element
 * @param frame the DOM Element reference
 */
function setupTouchIteraction(frame) {
	var firstTouch = 0;
	var secondTouch = 0;

	var initialTop = 0;
	var initialLeft = 0;
	var initialDistance = 0;
	var initialWidth = 0;

	var leftWidth = 0;
	var rightWidth = 0;

	frame.addEventListener('touchstart', function(event) {
		if(0 == firstTouch) {
			firstTouch = copyTouch(event);
			initialTop = $(this).offset().top;
			initialLeft = $('.feedReader').offset().left;
			initialWidth = $(this).width();
			leftWidth = $(this).parent().prev().width();
			rightWidth = $(this).parent().next().width();
		} else {

			if(0 == secondTouch) {
				secondTouch = copyTouch(event);
				initialDistance = Math.abs(firstTouch.pageX - secondTouch.pageX);
			} else {
				// Only two fingers on the same element
				firstTouch = 0;
				secondTouch = 0;
			}
		}
		event.preventDefault();
		event.stopPropagation();
		return false;
	});

	frame.addEventListener('touchend', function(event) {
		var id = event.changedTouches[0].identifier;
		if(firstTouch) {
			if(id == firstTouch.identifier) {
				var touchB = event.changedTouches[0];
				var duration = event.timeStamp - firstTouch.timestamp;
				var distanceY = touchB.pageY - firstTouch.pageY;
				var velocityY = distanceY / duration;
				var distanceX = touchB.pageX - firstTouch.pageX;
				var velocityX = distanceX / duration;
				initialTop = $(this).offset().top + Math.abs(velocityY) * distanceY;
				if(initialTop < window.innerHeight - this.clientHeight)
					initialTop = window.innerHeight - this.clientHeight;
				if(0 < initialTop)
					initialTop = 0;
				animDuration = Math.abs(velocityY * 300);
				$(this).animate({
					top : initialTop + 'px'
				}, animDuration);
				initialLeft = $('.feedReader').offset().left + Math.abs(velocityX) * distanceX;
				if(0 < initialLeft) {
					initialLeft = 0;
				}
				if(0 < window.innerWidth - ($('.feedContent').last().offset().left + $('.feedContent').last().width())) {
					var localWidth = 0;
					$('.feedContent').each(function(index, frame) {
						localWidth += $(this).width();
					});
					initialLeft = window.innerWidth - localWidth;
				}
				$('.feedReader').animate({
					left : initialLeft + 'px'
				});
				firstTouch = 0;
				if(secondTouch) {
					if(id == secondTouch.identifier) {
						secondTouch = 0;
					}
				}

			}
		}
		if(secondTouch) {
			if(id == secondTouch.identifier) {
				secondTouch = 0;
				firstTouch = 0;
			}
		}
		event.preventDefault();
		event.stopPropagation();
		return false;
	});

	frame.addEventListener('touchmove', function(event) {
		var touchB = event.targetTouches[0];
		var id = touchB.identifier;
		var deltaDistance = 0;
		if(firstTouch) {

			if(id == firstTouch.identifier) {
				if(secondTouch) {
					var newWidth = initialWidth + Math.abs(secondTouch.pageX - touchB.pageX) - initialDistance;
					$(this).parent().width(newWidth);
					$(this).parent().prev().width(leftWidth - (Math.abs(secondTouch.pageX - touchB.pageX) - initialDistance) / 2);
					$(this).parent().next().width(rightWidth - (Math.abs(secondTouch.pageX - touchB.pageX) - initialDistance) / 2);
				} else {
					// vertical scrolling handling
					var newTop = initialTop - (firstTouch.pageY - touchB.pageY)
					$(this).css('top', newTop + 'px');
					if(32 < Math.abs(firstTouch.pageX - touchB.pageX)) {
						var newLeft = initialLeft - (firstTouch.pageX - touchB.pageX);
						$('.feedReader').css('left', newLeft + 'px');
					}
				}
			}
		}
		if(secondTouch) {
			if(id == secondTouch.identifier) {
				if(firstTouch) {
					var newWidth = initialWidth + Math.abs(firstTouch.pageX - touchB.pageX) - initialDistance;
					$(this).parent().width(newWidth);
					$(this).parent().prev().width(leftWidth - (Math.abs(firstTouch.pageX - touchB.pageX) - initialDistance) / 2);
					$(this).parent().next().width(rightWidth - (Math.abs(firstTouch.pageX - touchB.pageX) - initialDistance) / 2);
				}
			}
		}
		event.preventDefault();
		event.stopPropagation();
		return false;
	});
}

function setupHandle(frame) {
	frame.addEventListener('touchmove', function(event) {
		var touch = event.targetTouches[0];
		$('#cont1').css('width', touch.pageX - 16 + 'px');
	});
}


$(document).ready(function() {
	$('.feedReader').each(function(index, frame) {
		if($(this).attr('url')) {
			var count = 0;
			$.get($(this).attr('url'), function(d) {
				$(d).find('outline').each(function() {
					if($(this).attr('type')) {
						if($(this).attr('type') == 'rss') {
							count = (count + 1) % 4;
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
					get_rss_feed($(this), $(this).attr('name'));
					// Populate feed content
					setupTouchIteraction(frame);
				});
				$('.feedHeader').each(function(index, frame) {
					frame.addEventListener('touchend', function(event) {
						if($(this).parent().width() < 512) {
							var leftPos = $('.feedReader').offset().left - $(this).parent().offset().left + 256;
							$('.feedReader').animate({
								left : leftPos + 'px'
							});
							$(this).parent().animate({
								width : '768px'
							}, function() {
								var initialLeft = $('.feedReader').offset().left;
								if(0 < initialLeft) {
									initialLeft = 0;
									$('.feedReader').animate({
										left : initialLeft + 'px'
									});
								}
								if(0 < window.innerWidth - ($('.feedContent').last().offset().left + $('.feedContent').last().width())) {
									var localWidth = 0;
									$('.feedContent').each(function(index, frame) {
										localWidth += $(this).width();
									});
									var initialLeft = window.innerWidth - localWidth;
									$('.feedReader').animate({
										left : initialLeft + 'px'
									});
								}
								var initialTop = $(this).next().offset().top;
								console.log(initialTop);
								if(initialTop < window.innerHeight - $(this).next().clientHeight)
									initialTop = window.innerHeight - $(this).next().clientHeight;
								$(this).next().animate({
									top : initialTop + 'px'
								});

							});
							$(this).parent().prev().animate({
								width : '256px'
							});
							$(this).parent().next().animate({
								width : '256px'
							});
						} else {
							$(this).next().animate({
								top : '0px'
							}, 500);
							$(this).parent().animate({
								width : '256px'
							}, function() {
								if(0 < window.innerWidth - ($('.feedContent').last().offset().left + $('.feedContent').last().width())) {
									var localWidth = 0;
									$('.feedContent').each(function(index, frame) {
										localWidth += $(this).width();
									});
									var initialLeft = window.innerWidth - localWidth;
									$('.feedReader').animate({
										left : initialLeft + 'px'
									});
								}
							});
						}
					});
				})
			});
		}
	});
});
