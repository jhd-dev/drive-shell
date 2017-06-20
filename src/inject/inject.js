'use strict';

$(document).ready(function(){

	var commands = {
		clear: clearLines,
		exit: closeShell,
		logout: closeShell,
		history: function(){
			history.reverse().slice(1).forEach(function(item){
				addLine(item);
			});
		},
		date: function(){
			addLine(new Date().toString());
		},
		pwd: function(){
			addLine(cwd);
		},
		ls: function(){
			busy = true;
			gapi.client.drive.files.list({
			    'pageSize': 10,
			    'fields': "nextPageToken, files(id, name)"
			}).then(function(response) {
				console.log(response);
				//files.forEach(addLine);
				busy = false;
			});
		}
	}

	var history = [];
	var cwd = '/';
	var busy = false;

	$('#drive_main_page').append('<div id="drive-bash">\
									<div id="drive-bash-dragbar">::</div>\
									<div id="drive-bash-text">Welcome to Drive Bash! Type "help" for a list of commands.</div>\
									<input type="text" id="drive-bash-input" />\
								</div>');
	$('#drive-bash')
		.on({
			click: function(){
				$('#drive-bash-input').focus();
			}
		})
		.draggable({
			handle: '#drive-bash-dragbar'
		});

	$('#drive-bash-input').on('keydown', function(e){
		if (e.keyCode === 13){ //enter
			var input = $(this).val();
			var inputs = input.split(' ');
			if (inputs[0] && inputs[0].length){
				history.push(input);//console.log(history);
				addLine(input);
				if (commands[inputs[0]]){
					commands[inputs[0]](inputs.slice(1));
				}
			}
			$(this).val('');
			e.preventDefault();
		} else if (e.keyCode === 38){ //up
			$('#drive-bash-input').val(history[history.length - 1]);
		}
	});

	function closeShell(){
		$('#drive-bash').remove();
	}

	function addLine(text){
		$('#drive-bash-text').append('<div class="drive-bash-text-line">' + text + '</div>');
	}

	function clearLines(){
		$('#drive-bash-text').html('');
	}

	var CLIENT_ID = '108205116788-g6pl6bc2lm1251j3sfbf2bddkmae4nv2.apps.googleusercontent.com';

	// Array of API discovery doc URLs for APIs used by the quickstart
	var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

	// Authorization scopes required by the API; multiple scopes can be
	// included, separated by spaces.
	var SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

	/**
	*    On load, called to load the auth2 library and API client library.
	*/
	function handleClientLoad() {
		gapi.load('client:auth2', initClient);
	} handleClientLoad();

	/**
	*    Initializes the API client library and sets up sign-in state
	*    listeners.
	*/
	function initClient() {
		gapi.client.init({
		    discoveryDocs: DISCOVERY_DOCS,
		    clientId: CLIENT_ID,
		    scope: SCOPES
		}).then(function () {
		    // Listen for sign-in state changes.
		    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

		    // Handle the initial sign-in state.
		    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
		});
	}

	/**
	*    Called when the signed in status changes, to update the UI
	*    appropriately. After a sign-in, the API is called.
	*/
	function updateSigninStatus(isSignedIn) {
		if (isSignedIn) {
		    authorizeButton.style.display = 'none';
		    signoutButton.style.display = 'block';
		    listFiles();
		} else {
		    authorizeButton.style.display = 'block';
		    signoutButton.style.display = 'none';
		}
	}

	/**
	*    Sign in the user upon button click.
	*/
	function handleAuthClick(event) {
		gapi.auth2.getAuthInstance().signIn();
	} handleAuthClick();

	/**
	*    Sign out the user upon button click.
	*/
	function handleSignoutClick(event) {
		gapi.auth2.getAuthInstance().signOut();
	}

	/**
	* Append a pre element to the body containing the given message
	* as its text node. Used to display the results of the API call.
	*
	* @param {string} message Text to be placed in pre element.
	*/
	function appendPre(message) {
		var pre = document.getElementById('content');
		var textContent = document.createTextNode(message + '\n');
		pre.appendChild(textContent);
	}

	/**
	* Print files.
	*/
	function listFiles() {
		gapi.client.drive.files.list({
		    'pageSize': 10,
		    'fields': "nextPageToken, files(id, name)"
		}).then(function(response) {
		    appendPre('Files:');
		    var files = response.result.files;
		    if (files && files.length > 0) {
		        for (var i = 0; i < files.length; i++) {
		            var file = files[i];
		            appendPre(file.name + ' (' + file.id + ')');
		        }
		    } else {
		        appendPre('No files found.');
		    }
		});
	}

});
