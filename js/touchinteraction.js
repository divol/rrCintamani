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
 */

/**
 * Setup touch event handling for a given DOM Element
 * @param frame the DOM Element reference
 */
var globalTouchCount = 0;
function setupContentTouchIteraction(frame) {
	/**
	 * Simple function to constrain a variable
	 * @param x the variable
	 * @param min
	 * @param max
	 * @return min < x < max
	 */
	function constrain(x, min, max) {
		if(x < min)
			return min;
		else if(max < x)
			return max;
		return x;
	}

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

	function moveFirstAtLast(frame) {
		$(frame).children(":last").after(($(frame).children(":first")));
	}

	function moveLastAtFirst(frame) {
		$(frame).children(":first").before(($(frame).children(":last")));
	}

	var firstTouch = 0;

	var initialTop = 0;
	var initialLeft = 0;
	var initialDistance = 0;

	frame.addEventListener('touchstart', function(event) {
		globalTouchCount++;
		firstTouch = copyTouch(event);
		initialTop = $(this).offset().top-40;
		initialLeft = $('.feedReader').offset().left;
		event.preventDefault();
		event.stopPropagation();
		return false;
	});

	frame.addEventListener('touchend', function(event) {
		globalTouchCount--;
		var id = event.changedTouches[0].identifier;
		if(firstTouch) {
			if(id == firstTouch.identifier) {
				var touchB = event.changedTouches[0];
				var duration = event.timeStamp - firstTouch.timestamp;

				var distanceY = touchB.pageY - firstTouch.pageY;
				var velocityY = distanceY / duration;
				initialTop = constrain($(this).offset().top + Math.abs(velocityY) * distanceY, window.innerHeight - this.clientHeight, 0);
				animDuration = Math.abs(velocityY * 300);
				$(this).animate({
					top : initialTop + 'px'
				}, animDuration);

				var distanceX = touchB.pageX - firstTouch.pageX;
				var velocityX = distanceX / duration;
				animDuration = Math.abs(velocityY * 300);
				initialLeft = $('.feedReader').offset().left + Math.abs(velocityX) * distanceX;
				$('.feedReader').animate({
					left : initialLeft + 'px'
				});
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

				// vertical scrolling handling
				var newTop = initialTop - Math.floor(firstTouch.pageY - touchB.pageY)
				$(this).css('top', newTop + 'px');

				// horizontal scrolling handling with one touch only
				if((isHorizontalScrollEnable)) {
					if(32 < Math.abs(firstTouch.pageX - touchB.pageX)) {
						if(0 < firstTouch.pageX - touchB.pageX) {
							// Slide to the left
							if($('.feedReader').children(":first").offset().left < -defaultPanelWidth) {
								moveFirstAtLast($('.feedReader'));
								// feed reader left pos correction
								initialLeft += defaultPanelWidth;
							}
						} else {
							// Slide to the right
							if(screen.width < $('.feedReader').children(":last").offset().left) {
								moveLastAtFirst($('.feedReader'));
								// feed reader left pos correction
								initialLeft -= defaultPanelWidth;
							}

						}
						var newLeft = initialLeft - (firstTouch.pageX - touchB.pageX);
						$('.feedReader').css('left', newLeft + 'px');
					}
				}

			}
		}
		event.preventDefault();
		event.stopPropagation();
		return false;
	});
}