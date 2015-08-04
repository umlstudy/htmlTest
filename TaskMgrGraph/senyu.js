var assert = function(condition, message) {
    if (!condition) {
        throw message || "Assertion failed.";
    }
};

var throwError = function(msg) {
	var e = new Error('dummy');
	var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
		.replace(/^\s+at\s+/gm, '')
		.replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
		.split('\n');
	console.log(stack);
	throw msg;
};

var Senyu = function(canvas, prop) {
	
	if (!(this instanceof arguments.callee )) {
		throwError('you must use with \'new\' keyword.');
	}
	
	prop = prop || {};
	assert(typeof prop === 'object');
	assert(typeof prop.graphCount === "undefined" || typeof prop.graphCount === "number");
	assert(typeof prop.barCount === "undefined" || typeof prop.barCount === "number" );
	assert(typeof prop.singleBarWidth === "undefined" || typeof prop.singleBarWidth === "number" );
	assert(typeof prop.spaceBetweenBar === "undefined" || typeof prop.spaceBetweenBar === "number" );
	assert(typeof prop.leftShift === "undefined" || typeof prop.leftShift === "number" );
	assert(typeof prop.font === "undefined" || typeof prop.font === "string" );
	assert(typeof prop.paddingTop === "undefined" || typeof prop.paddingTop === "string" );
	assert(typeof prop.paddingLeft === "undefined" || typeof prop.paddingLeft === "string" );
	
	this.prop = {};
	this.prop.graphCount = prop.graphCount || 1;
	this.prop.barCount = prop.barCount || 17;
	this.prop.singleBarWidth = prop.singleBarWidth || 20;
	this.prop.spaceBetweenBar = prop.spaceBetweenBar || 1;
	this.prop.leftShift = prop.leftShift || 1;
	this.prop.green = '#00FF00';
	this.prop.darkGreen = '#008000';
	this.prop.backgroundColor = prop.backgroundColor || '#000000';
	this.prop.font = prop.font || '15px Arial';
	this.prop.paddingTop = prop.paddingTop || 10;
	this.prop.paddingLeft = prop.paddingLeft || 10;
	
	// calculate canvas size.
	this.prop.width = this.prop.paddingTop*2 + 60 * this.prop.graphCount;
	this.prop.height = this.prop.paddingLeft*2 + this.prop.barCount*3 + 20 + 30;
	
	// define canvas
	this.prop.canvas = canvas;
	this.prop.canvas.width = this.prop.width;
	this.prop.canvas.height = this.prop.height;
	this.prop.canvasContext = canvas.getContext('2d');
	
	// create DoubleBuffer
	this.prop.bufferCanvas = document.createElement('canvas');
	this.prop.bufferCanvas.width = this.prop.width;
	this.prop.bufferCanvas.height = this.prop.height;
	this.prop.bufferContext = this.prop.bufferCanvas.getContext('2d');
};

//Senyu.fn = Senyu.prototype;
//Senyu.prototype.constructor = Senyu;
	
!function(proto) {
	
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
	
	var drawBarGraphPart = function(prop, startX, startY, fillBarPercent) {
		var ctx = prop.bufferContext;
		var oriFillStyle = ctx.fillStyle;
		{
			var cx, cy;
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
				cx = startX;
				cy = startY+dy*3
				funcDrawLine(ctx, cx, cy, singleBarWidth_);
				
				// SecondRow
				cx = startX+leftShift_;
				cy = cy + 1;
				funcDrawLine(ctx, cx, cy, singleBarWidth_);
			}
		}
		ctx.fillStyle = oriFillStyle;
	};
	
	var drawBarGraph = function(prop, startX, startY, fillBarPercent) {
		var ctx = prop.bufferContext;
		var oriFillStyle = ctx.fillStyle;
		
		{
			drawBarGraphPart(prop, startX, startY, fillBarPercent);
			startX = startX+prop.singleBarWidth+prop.leftShift+prop.spaceBetweenBar;
			drawBarGraphPart(prop, startX, startY, fillBarPercent);
			
			startY = startY + prop.barCount*3 + 20;
			ctx.fillStyle=prop.green;
			ctx.font = prop.font;
			ctx.textAlign='center'; 
			ctx.fillText(Math.round(fillBarPercent)+'%',startX,startY);
			
		}
		ctx.fillStyle = oriFillStyle;
	};
	
	proto.drawBarGraph = function(fillBarPercents) {
		if ( this.prop.graphCount != fillBarPercents.length ) {
			printStackTrace();
			throwError("this.graphCount != fillBarPercents.length");
		}
		var bufferContext = this.prop.bufferContext;
		var sx = this.prop.paddingLeft;
		var sy = this.prop.paddingTop;
		
		clearArea(bufferContext, 0,0, this.prop.width, this.prop.height);
		for(var idx in fillBarPercents) {
			drawBarGraph(this.prop, sx, sy, fillBarPercents[idx]); 
			sx = sx + 60;
    	}
		bufferContext.stroke();
		this.prop.canvasContext.drawImage(this.prop.bufferCanvas, 0, 0);
	};
}(Senyu.prototype);
