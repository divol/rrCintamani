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
 *    base UX Design : pliage, Citymedia, Pascal Chirol (ENSADLabs), Douglas Edric Stanley
 */

var defaultPanelWidth = 256;
var isHorizontalScrollEnable = true;

$(document).ready(function() {
	$.getScript("js/touchinteraction.js", function() {
		$.getScript("js/rsscontent.js", function() {
			populateFromOpml();
		});
	});
});
