/**
 * 선유도 라이브 게이지 차트 API
 * Senyu
 */
var Senyu = function(canvas, param) {
	
	if (!(this instanceof arguments.callee )) {
		Senyu.throwError('you must use with \'new\' keyword.');
	}
	
	param = param || {};
	// assert type
	Senyu.assert (typeof param === 'object');
	Senyu.assert (typeof param.graphCount === "undefined" || typeof param.graphCount === "number");
	Senyu.assert (typeof param.barCount === "undefined" || typeof param.barCount === "number" );
	Senyu.assert (typeof param.singleBarWidth === "undefined" || typeof param.singleBarWidth === "number" );
	Senyu.assert (typeof param.gapBetweenSingleBar === "undefined" || typeof param.gapBetweenSingleBar === "number" );
	Senyu.assert (typeof param.singleBarHeight === "undefined" || typeof param.singleBarHeight === "number" );
	Senyu.assert (typeof param.gapBetweenSingleBarRow === "undefined" || typeof param.gapBetweenSingleBarRow === "number" );
	Senyu.assert (typeof param.gapBetweenGraph === "undefined" || typeof param.gapBetweenGraph === "number" );
	Senyu.assert (typeof param.leftShift === "undefined" || typeof param.leftShift === "number" );
	Senyu.assert (typeof param.font === "undefined" || typeof param.font === "string" );
	Senyu.assert (typeof param.paddingTop === "undefined" || typeof param.paddingTop === "number" );
	Senyu.assert (typeof param.paddingLeft === "undefined" || typeof param.paddingLeft === "number" );
	Senyu.assert (typeof param.bottomLabelAreaHeight === "undefined" || typeof param.bottomLabelAreaHeight === "number" );
	
	this.param = {};
	this.param.graphCount = param.graphCount || 1;
	this.param.barCount = param.barCount || 17;
	this.param.singleBarWidth = param.singleBarWidth || 20;
	this.param.singleBarHeight = param.singleBarHeight || 2;
	this.param.gapBetweenSingleBarRow = param.gapBetweenSingleBarRow || 1;
	this.param.gapBetweenSingleBar = param.gapBetweenSingleBar || 1;
	this.param.gapBetweenGraph = param.gapBetweenGraph || 10;
	this.param.leftShift = 1;
	this.param.green = '#00FF00';
	this.param.darkGreen = '#008000';
	this.param.backgroundColor = param.backgroundColor || '#000000';
	this.param.font = param.font || '15px Arial';
	this.param.paddingTop = param.paddingTop || 10;
	this.param.paddingLeft = param.paddingLeft || 10;
	this.param.bottomLabelAreaHeight = param.bottomLabelAreaHeight || 40;
	
	// for convenience
	param = this.param;
	
	// assert value
	Senyu.assert ( param.graphCount > 0 && param.graphCount < 12, "param.graphCount > 0 && param.graphCount < 12");
	Senyu.assert ( param.barCount > 9 && param.barCount < 30, "param.barCount > 9 && param.barCount < 30");
	Senyu.assert ( param.singleBarWidth > 4 && param.singleBarWidth < 50, "param.singleBarWidth > 4 && param.singleBarWidth < 50");
	Senyu.assert ( param.gapBetweenSingleBar > 0 && param.gapBetweenSingleBar < 11, "param.gapBetweenSingleBar > 0 && param.gapBetweenSingleBar < 11");
	Senyu.assert ( param.singleBarHeight > 0 && param.singleBarHeight < 11, "param.singleBarHeight > 0 && param.singleBarHeight < 11");
	Senyu.assert ( param.gapBetweenSingleBarRow > 0 && param.gapBetweenSingleBarRow < 11, "param.gapBetweenSingleBarRow > 0 && param.gapBetweenSingleBarRow < 11");
	Senyu.assert ( param.gapBetweenGraph > 5 && param.gapBetweenGraph < 41, "param.gapBetweenGraph > 5 && param.gapBetweenGraph < 41");
	Senyu.assert ( (/^#(?:[0-9a-f]{3}){1,2}$/i).exec(param.backgroundColor) !== null );
	Senyu.assert ( param.paddingTop >= 0 && param.paddingTop < 61, "param.paddingTop >= 0 && param.paddingTop < 61");
	Senyu.assert ( param.paddingLeft >= 0 && param.paddingLeft < 61, "param.paddingLeft >= 0 && param.paddingLeft < 61");
	Senyu.assert ( param.bottomLabelAreaHeight >= 0 && param.bottomLabelAreaHeight < 100, "param.bottomLabelAreaHeight >= 0 && param.bottomLabelAreaHeight < 100");
	
	// calculate canvas size.
	param.width = param.paddingLeft*2 + ((param.singleBarWidth*2+param.gapBetweenSingleBar) * param.graphCount) + (param.gapBetweenGraph * (param.graphCount - 1));
	param.height = param.paddingTop*2 + (param.singleBarHeight * param.barCount) + (param.gapBetweenSingleBarRow * (param.barCount - 1)) + param.bottomLabelAreaHeight;
	
	// define canvas
	param.canvas = canvas;
	param.canvas.width = param.width;
	param.canvas.height = param.height;
	param.canvasContext = canvas.getContext('2d');
	
	// create DoubleBuffer
	param.bufferCanvas = document.createElement('canvas');
	param.bufferCanvas.width = param.width;
	param.bufferCanvas.height = param.height;
	param.bufferContext = param.bufferCanvas.getContext('2d');
};

!function(proto) {
	
	// private methods
	var drawDotLine = function(ctx, x, y, width) {
		for ( var dx=0; dx<width; dx+=2 ) {
			ctx.fillRect( x+dx, y, 1, 1 );
		}
	};
	
	var drawLine = function(ctx, x, y, width) {
		ctx.fillRect( x, y, width, 1 );
	};
	
	var clearArea = function(param, x, y, width, height) {
		var ctx = param.bufferContext;
		var oriFillStyle = ctx.fillStyle;
		{
			ctx.fillStyle = param.backgroundColor;
			ctx.fillRect(x,y,width, height);
		}
		ctx.fillStyle = oriFillStyle;
	};
	
	var drawBarGraphPart = function(param, sx, sy, fillBarPercent) {
		var ctx = param.bufferContext;
		var oriFillStyle = ctx.fillStyle;
		{
			var tx, ty;
			var funcDrawLine;
			var singleBarWidth_;
			
			var fillBarCnt = Math.round(param.barCount * fillBarPercent / 100);
			for ( var dy=0;dy < param.barCount;dy++ ) {
				var fillBar = false;
				if ( (param.barCount - dy ) <= fillBarCnt ) {
					// drawLine
					ctx.fillStyle = param.green;
					funcDrawLine = drawLine;
					singleBarWidth_ = param.singleBarWidth;
					fillBar = true;
				} else {
					// dotLine
					ctx.fillStyle= param.darkGreen;
					funcDrawLine = drawDotLine;
					singleBarWidth_ = param.singleBarWidth;
				}
				
				for ( var singleLineIdx=0;singleLineIdx<(param.singleBarHeight); singleLineIdx++ ) {
					
					// FirstRow
					tx = sx;
					if ( !fillBar && (singleLineIdx%2 == 1) ) {
						tx += param.leftShift;
					}
					ty = sy+ (dy * (param.singleBarHeight + param.gapBetweenSingleBarRow)) + singleLineIdx;
					funcDrawLine(ctx, tx, ty, singleBarWidth_);
				}
			}
		}
		ctx.fillStyle = oriFillStyle;
	};
	
	var drawBarGraph = function(param, sx, sy, fillBarPercent, idx) {
		var ctx = param.bufferContext;
		var oriFillStyle = ctx.fillStyle;
		
		{
			drawBarGraphPart(param, sx, sy, fillBarPercent);
			sx = sx+param.singleBarWidth+param.leftShift+param.gapBetweenSingleBar;
			drawBarGraphPart(param, sx, sy, fillBarPercent);
			
			sy = param.height - param.paddingTop - param.bottomLabelAreaHeight + 15;
			ctx.fillStyle=param.green;
			ctx.font = param.font;
			ctx.textAlign='center'; 
			ctx.fillText(Math.round(fillBarPercent)+'%',sx,sy);
			
			sy = sy + 20;
			if ( param.labels != null ) {
				if ( param.labels[idx] != null ) {
					ctx.fillText(param.labels[idx],sx,sy);
				}
			}
			
		}
		ctx.fillStyle = oriFillStyle;
	};
	
	// public methods
	proto.drawBarGraph = function(fillBarPercents) {
		var param = this.param;
		if ( param.graphCount != fillBarPercents.length ) {
			Senyu.throwError("param.graphCount != fillBarPercents.length");
		}
		var bufferContext = param.bufferContext;
		var sx = param.paddingLeft;
		var sy = param.paddingTop;
		
		clearArea(param, 0, 0, param.width, param.height);
		for(var idx in fillBarPercents) {
			drawBarGraph(param, sx, sy, fillBarPercents[idx], idx); 
			sx += param.singleBarWidth*2 + param.gapBetweenSingleBar + param.gapBetweenGraph;
    	}
		
		bufferContext.stroke();
		param.canvasContext.drawImage(param.bufferCanvas, 0, 0);
	};
	
	proto.initLabel = function(labels) {
		var param = this.param;
		if ( param.graphCount != labels.length ) {
			Senyu.throwError("param.graphCount != labels.length");
		}
		param.labels = labels;
	};

	// assert ( Senyu static function)
	Senyu.assert = function(condition, message) {
	    if (!condition) {
	    	Senyu.throwError( message || "Assertion failed." );
	    }
	};

	// handling exception ( Senyu static function)
	Senyu.throwError = function(msg) {
		var e = new Error(msg);
		console.log(e);
		throw e;
	};
}(Senyu.prototype);
