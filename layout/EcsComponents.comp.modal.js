
if ( !window.EcsComponents ) {
	window.EcsComponents = {
	};
}

/**
 * initModalDialog
 */
EcsComponents.initModalDialog=function(modalId, headerHtml, bodyHtml) {
	var modalElement = document.getElementById(modalId);
	if ( !!modalElement ) {
		return;
	}
	
	var jsFileLocation = EcsComponents.getJsFileLocation('EcsComponents.comp.modal.js');
	var htmlPart = EcsComponents.loadUrlText(jsFileLocation+"EcsComponents.comp.modal.tmpl.html");
	var modalElement = EcsComponents.htmlToElement(htmlPart);
	modalElement.id=modalId;
	document.body.appendChild(modalElement);
	
	// header
	if ( !!headerHtml ) {
		var headerElement = modalElement.getElementsByClassName("modal-header")[0];
		var headerInnerElement = EcsComponents.htmlToElement(headerHtml);
		headerElement.appendChild(headerInnerElement);
	}
	
	// close button
	var span = modalElement.getElementsByClassName("modal-close")[0];
	if ( !span ) {
		var msg = "modal-close 요소가 존재하지 않습니다.";
		console.log(msg);
		throw msg;
	}
	span.onclick = function() {
		modalElement.style.display = "none";
	};
	window.onclick = function(event) {
	    if (event.target == modalElement) {
	    	modalElement.style.display = "none";
	    }
	};
};

/**
 * replaceModalDialogBody
 */
EcsComponents.replaceModalDialogBody=function(modalId, bodyHtml) {
	var modalElement = document.getElementById(modalId);
	if ( !modalElement ) {
		throw "initModalDialog 를 수행햐야 합니다.";
	}
	if ( !!bodyHtml ) {
		var bodyElement = modalElement.getElementsByClassName("modal-body")[0];
		EcsComponents.removeAllChilds(bodyElement);

		var newBodyInnerElement = EcsComponents.htmlToElement(bodyHtml);
		bodyElement.appendChild(newBodyInnerElement);
	}
};

/**
 * addShowModalEvent
 */
EcsComponents.addShowModalEvent=function(modalId, clickElement, callback) {
	var modalElement = document.getElementById(modalId);
	if ( !modalElement ) {
		throw "initModalDialog 를 수행햐야 합니다.";
	}
	if ( !clickElement ) {
		var msg = "clickElement가 널입니다.";
		console.log(msg);
		throw msg;
	}
	clickElement.onclick = function() {
		callback();
		modalElement.style.display = "block";
	};
};

