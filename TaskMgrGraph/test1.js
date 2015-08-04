
(function(first, second) {
	alert('main ' + first);
	alert('main ' + second);
	return function(p1, p2) {
		alert(p1);
		alert(p2);
	};
}('aa', 'bb'));
