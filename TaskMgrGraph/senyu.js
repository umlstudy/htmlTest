// assert
var assert = function(condition, message) {
    if (!condition) {
        throw message || "Assertion failed.";
    }
};

// handling exception
var throwError = function(msg) {
	var e = new Error('dummy');
	var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
		.replace(/^\s+at\s+/gm, '')
		.replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
		.split('\n');
	console.log(stack);
	throw msg;
};

// Senyu
var Senyu = function(canvas, prop) {
	
	if (!(this instanceof arguments.callee )) {
		throwError('you must use with \'new\' keyword.');
	}
	
	prop = prop || {};
	// assert type
	assert(typeof prop === 'object');
	assert(typeof prop.graphCount === "undefined" || typeof prop.graphCount === "number");
	assert(typeof prop.barCount === "undefined" || typeof prop.barCount === "number" );
	assert(typeof prop.singleBarWidth === "undefined" || typeof prop.singleBarWidth === "number" );
	assert(typeof prop.gapBetweenSingleBar === "undefined" || typeof prop.gapBetweenSingleBar === "number" );
	assert(typeof prop.singleBarHeight === "undefined" || typeof prop.singleBarHeight === "number" );
	assert(typeof prop.gapBetweenSingleBarRow === "undefined" || typeof prop.gapBetweenSingleBarRow === "number" );
	assert(typeof prop.gapBetweenGraph === "undefined" || typeof prop.gapBetweenGraph === "number" );
	assert(typeof prop.leftShift === "undefined" || typeof prop.leftShift === "number" );
	assert(typeof prop.font === "undefined" || typeof prop.font === "string" );
	assert(typeof prop.paddingTop === "undefined" || typeof prop.paddingTop === "string" );
	assert(typeof prop.paddingLeft === "undefined" || typeof prop.paddingLeft === "string" );
	assert(typeof prop.bottomLabelAreaHeight === "undefined" || typeof prop.bottomLabelAreaHeight === "number" );
	
	this.prop = {};
	this.prop.graphCount = prop.graphCount || 1;
	this.prop.barCount = prop.barCount || 17;
	this.prop.singleBarWidth = prop.singleBarWidth || 20;
	this.prop.singleBarHeight = prop.singleBarHeight || 2;
	this.prop.gapBetweenSingleBarRow = prop.gapBetweenSingleBarRow || 1;
	this.prop.gapBetweenSingleBar = prop.gapBetweenSingleBar || 1;
	this.prop.gapBetweenGraph = prop.gapBetweenGraph || 10;
	this.prop.leftShift = 1;
	this.prop.green = '#00FF00';
	this.prop.darkGreen = '#008000';
	this.prop.backgroundColor = prop.backgroundColor || '#000000';
	this.prop.font = prop.font || '15px Arial';
	this.prop.paddingTop = prop.paddingTop || 10;
	this.prop.paddingLeft = prop.paddingLeft || 10;
	this.prop.bottomLabelAreaHeight = prop.bottomLabelAreaHeight || 40;
	
	// for convenience
	prop = this.prop;
	
	// assert value
	assert ( prop.graphCount > 0 && prop.graphCount < 12, "prop.graphCount > 0 && prop.graphCount < 12");
	assert ( prop.barCount > 9 && prop.barCount < 30, "prop.barCount > 9 && prop.barCount < 30");
	assert ( prop.singleBarWidth > 4 && prop.singleBarWidth < 50, "prop.singleBarWidth > 4 && prop.singleBarWidth < 50");
	assert ( prop.gapBetweenSingleBar > 0 && prop.gapBetweenSingleBar < 4, "prop.gapBetweenSingleBar > 0 && prop.gapBetweenSingleBar < 4");
	assert ( prop.singleBarHeight > 0 && prop.singleBarHeight < 7, "prop.singleBarHeight > 0 && prop.singleBarHeight < 7");
	assert ( prop.gapBetweenSingleBarRow > 0 && prop.gapBetweenSingleBarRow < 4, "prop.gapBetweenSingleBarRow > 0 && prop.gapBetweenSingleBarRow < 4");
	assert ( prop.gapBetweenGraph > 5 && prop.gapBetweenGraph < 20, "prop.gapBetweenGraph > 5 && prop.gapBetweenGraph < 20");
	assert ( (/^#(?:[0-9a-f]{3}){1,2}$/i).exec(prop.backgroundColor) !== null );
	assert ( prop.paddingTop >= 0 && prop.paddingTop < 30, "prop.paddingTop >= 0 && prop.paddingTop < 30");
	assert ( prop.paddingLeft >= 0 && prop.paddingLeft < 30, "prop.paddingLeft >= 0 && prop.paddingLeft < 30");
	assert ( prop.bottomLabelAreaHeight >= 0 && prop.bottomLabelAreaHeight < 100, "prop.bottomLabelAreaHeight >= 0 && prop.bottomLabelAreaHeight < 100");
	
	
	// calculate canvas size.
	prop.width = prop.paddingLeft*2 + ((prop.singleBarWidth*2+prop.gapBetweenSingleBar) * prop.graphCount) + (prop.gapBetweenGraph * (prop.graphCount - 1));
	prop.height = prop.paddingTop*2 + (prop.singleBarHeight * prop.barCount) + (prop.gapBetweenSingleBarRow * (prop.barCount - 1)) + prop.bottomLabelAreaHeight;
	
	// define canvas
	prop.canvas = canvas;
	prop.canvas.width = prop.width;
	prop.canvas.height = prop.height;
	prop.canvasContext = canvas.getContext('2d');
	
	// create DoubleBuffer
	prop.bufferCanvas = document.createElement('canvas');
	prop.bufferCanvas.width = prop.width;
	prop.bufferCanvas.height = prop.height;
	prop.bufferContext = prop.bufferCanvas.getContext('2d');
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
	
	var clearArea = function(ctx, x, y, width, height) {
		var oriFillStyle = ctx.fillStyle;
		{
			ctx.fillStyle = this.backgroundColor;
			ctx.fillRect(x,y,width, height);
		}
		ctx.fillStyle = oriFillStyle;
	};
	
	var drawBarGraphPart = function(prop, sx, sy, fillBarPercent) {
		var ctx = prop.bufferContext;
		var oriFillStyle = ctx.fillStyle;
		{
			var tx, ty;
			var funcDrawLine;
			var singleBarWidth_;
			var leftShift_;
			
			var fillBarCnt = Math.round(prop.barCount * fillBarPercent / 100);
			for ( var dy=0;dy < prop.barCount;dy++ ) {
				if ( (prop.barCount - dy ) <= fillBarCnt ) {
					// drawLine
					ctx.fillStyle = prop.green;
					funcDrawLine = drawLine;
					singleBarWidth_ = prop.singleBarWidth;
					leftShift_ = 0;
				} else {
					// dotLine
					ctx.fillStyle= prop.darkGreen;
					funcDrawLine = drawDotLine;
					singleBarWidth_ = prop.singleBarWidth;
					leftShift_ = prop.leftShift;
				}
				// FirstRow
				tx = sx;
				ty = sy+dy*3;
				funcDrawLine(ctx, tx, ty, singleBarWidth_);
				
				// SecondRow
				tx = sx+leftShift_;
				ty = ty + 1;
				funcDrawLine(ctx, tx, ty, singleBarWidth_);
			}
		}
		ctx.fillStyle = oriFillStyle;
	};
	
	var drawBarGraph = function(prop, sx, sy, fillBarPercent) {
		var ctx = prop.bufferContext;
		var oriFillStyle = ctx.fillStyle;
		
		{
			drawBarGraphPart(prop, sx, sy, fillBarPercent);
			sx = sx+prop.singleBarWidth+prop.leftShift+prop.gapBetweenSingleBar;
			drawBarGraphPart(prop, sx, sy, fillBarPercent);
			
			sy = prop.height - prop.paddingTop - prop.bottomLabelAreaHeight + 15;
			ctx.fillStyle=prop.green;
			ctx.font = prop.font;
			ctx.textAlign='center'; 
			ctx.fillText(Math.round(fillBarPercent)+'%',sx,sy);
			
			sy = sy + 20;
			ctx.fillText('하하행',sx,sy);
			
		}
		ctx.fillStyle = oriFillStyle;
	};
	
	// public methods
	proto.drawBarGraph = function(fillBarPercents) {
		if ( this.prop.graphCount != fillBarPercents.length ) {
			throwError("prop.graphCount != fillBarPercents.length");
		}
		var bufferContext = this.prop.bufferContext;
		var sx = this.prop.paddingLeft;
		var sy = this.prop.paddingTop;
		
		clearArea(bufferContext, 0, 0, this.prop.width, this.prop.height);
		for(var idx in fillBarPercents) {
			drawBarGraph(this.prop, sx, sy, fillBarPercents[idx]); 
			sx += this.prop.singleBarWidth*2 + this.prop.gapBetweenSingleBar + this.prop.gapBetweenGraph;
    	}
		bufferContext.stroke();
		this.prop.canvasContext.drawImage(this.prop.bufferCanvas, 0, 0);
	};
	
	proto.initLabel = function(labels) {
		if ( this.prop.graphCount != labels.length ) {
			throwError("prop.graphCount != labels.length");
		}
		this.prop.labels = labels;
	};
}(Senyu.prototype);
