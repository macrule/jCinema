/* This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */


jCinema.UPnP = function () {
	
	// ---------------------------------------------------------------
	// Global options
	
	var options = {
		timeout: 500,
		host:    'localhost:80',
	};
	
	
	// ---------------------------------------------------------------
	// Command execution
	
	var executeCommand = function (service, action, args) {
		return executePreparedCommand(prepareCommand(service, action, args));
	};
	
	var executePreparedCommand = function (cmd) {
		// make the SOAP call
		var result = $.ajax(cmd);
		if (result.status == 200) {
			// and parse the result back into a dict
			return parseCommandResult(result.responseXML);
		} else {
			return null;
		}
	};
	
	var prepareCommand = function (service, action, args) {
		return {
			async:       false,
			timeout:     jCinema.UPnP.options.timeout,
			cache:       false,
			url:         'http://' + jCinema.UPnP.options.host + '/MediaRenderer_' + service + '/control',
			type:        'POST',
			contentType: 'text/xml',
			data:        buildSoapRequestBody(service, action, args),
			beforeSend:  function (xhr, settings) {
				xhr.setRequestHeader('SOAPACTION', '"urn:schemas-upnp-org:service:' + service + ':1#' + action + '"');
				return true;
			},
			error: function (xhr, textStatus, errorThrown) {
				jCinema.error('Failed jCinema.UPnP.executeCommand: ' + textStatus + ' ' + errorThrown)
			}
		};
	};
	
	var buildSoapRequestBody = function (service, action, args) {
		var request = '';
		
		request += '<?xml version="1.0" encoding="utf-8"?>\r\n';
		request += '<s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">\r\n';
		request += '   <s:Body>\r\n';
		request += '      <u:' + action + ' xmlns:u="urn:schemas-upnp-org:service:' + service + ':1">\r\n';
		
		for (var key in args) {
			var value = args[key];
			request += '<' + key + '>' + args[key] + '</' + key + '>\r\n';
		}
		
		request += '      </u:' + action + '>\r\n';
		request += '   </s:Body>\r\n';
		request += '</s:Envelope>\r\n';
		
		return request;
	}
	
	
	// ---------------------------------------------------------------
	// Result parsing
	
	var parseCommandResult = function (xml) {
		var dict = {};
		
		var nodes = xml.getElementsByTagName('Body')[0].childNodes[0].childNodes;
		for (var i = 0; i < nodes.length; i++) {
			var n = nodes[i];
			if (n.firstChild === null) {
				dict[n.nodeName] = null;
			} else {
				dict[n.nodeName] = n.firstChild.nodeValue;
				if (/MetaData$/.test(n.nodeName)) {
					dict[n.nodeName] = parseMetaData(dict[n.nodeName]);
				}
			}
		}
		
		return dict;
	};
	
	var parseMetaData = function (mediaInfoMetaData) {
		// TODO: incomplete
		if (mediaInfoMetaData == null) return null;
		
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(mediaInfoMetaData, "text/xml");
		
		var item = xmlDoc.getElementsByTagName('item')[0];
		if (item === undefined) {
			return {};
		}
		
		var nodes = item.childNodes;
		
		var dict = {};
		var title = item.getElementsByTagName('title')[0].firstChild.nodeValue;
		var resNode = item.getElementsByTagName('res')[0];
		var res = resNode.getAttribute('resolution');
		var uri = resNode.firstChild.nodeValue;
		
		var dict = {
			title: title,
			uri: uri,
			resolution: res.split('X', 2)
		};
		
		return dict;
	}
	
	
	// ---------------------------------------------------------------
	
	return {
		options: options,
		executeCommand: executeCommand,
		executePreparedCommand: executePreparedCommand,
	};
	
}();
