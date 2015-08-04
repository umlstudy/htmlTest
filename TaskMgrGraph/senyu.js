var Senyu = function(canvas, graphCount) {
	this.graphCount = graphCount;
	this.barCount = 17;
	this.singleBarWidth = 20;
	this.spaceBetweenBar = 1;
	this.leftShift = 1;
	this.green = '#00FF00';
	this.darkGreen = '#008000';
	this.defaultBackgroundColor = '#000000';
	this.defaultFont = '15px Arial';
	this.paddingTop = this.paddingLeft = 10;
	
	this.canvas = canvas;
	this.canvasContext = canvas.getContext('2d');
	
	this.bufferCanvas = document.createElement('canvas');
	this.bufferContext = this.bufferCanvas.getContext('2d');
	
	this.width = this.paddingTop*2 + 60 * this.graphCount;
	this.height = this.paddingLeft*2 + this.barCount*3 + 20 + 30;
	
	canvas.style.width = this.width;
	canvas.style.height = this.height;
};

Senyu.fn = Senyu.prototype;
	
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
			ctx.fillStyle = this.defaultBackgroundColor;
			ctx.fillRect(x,y,width, height);
		}
		ctx.fillStyle = oriFillStyle;
	};
	
	var drawBarGraphPart = function(senyu, startX, startY, fillBarPercent) {
		var ctx = senyu.bufferContext;
		var oriFillStyle = ctx.fillStyle;
		{
			var cx, cy;
			var funcDrawLine;
			var singleBarWidth_;
			var leftShift_;
			
			var fillBarCnt = Math.round(senyu.barCount * fillBarPercent / 100);
			for ( var dy=0;dy < senyu.barCount;dy++ ) {
				if ( (senyu.barCount - dy ) <= fillBarCnt ) {
					// drawLine
					ctx.fillStyle = senyu.green;
					funcDrawLine = drawLine;
					singleBarWidth_ = senyu.singleBarWidth;
					leftShift_ = 0;
				} else {
					// dotLine
					ctx.fillStyle= senyu.darkGreen;
					funcDrawLine = drawDotLine;
					singleBarWidth_ = senyu.singleBarWidth;
					leftShift_ = senyu.leftShift;
				}
				// 첫번째라인
				cx = startX;
				cy = startY+dy*3
				funcDrawLine(ctx, cx, cy, singleBarWidth_);
				
				// 두번째라인
				cx = startX+leftShift_;
				cy = cy + 1;
				funcDrawLine(ctx, cx, cy, singleBarWidth_);
			}
		}
		ctx.fillStyle = oriFillStyle;
	};
	
	var drawBarGraph = function(senyu, startX, startY, fillBarPercent) {
		var ctx = senyu.bufferContext;
		var oriFillStyle = ctx.fillStyle;
		
		{
			drawBarGraphPart(senyu, startX, startY, fillBarPercent);
			startX = startX+senyu.singleBarWidth+senyu.leftShift+senyu.spaceBetweenBar;
			drawBarGraphPart(senyu, startX, startY, fillBarPercent);
			
			startY = startY + senyu.barCount*3 + 20;
			ctx.fillStyle=senyu.green;
			ctx.font = senyu.defaultFont;
			ctx.textAlign='center'; 
			ctx.fillText(Math.round(fillBarPercent)+'%',startX,startY);
			
		}
		ctx.fillStyle = oriFillStyle;
	};
	
	proto.drawBarGraph = function(fillBarPercents) {
		if ( this.graphCount != fillBarPercents.length ) {
			throw "this.graphCount != fillBarPercents.length";
		}
		var bufferContext = this.bufferContext;
		var sx = this.paddingLeft;
		var sy = this.paddingTop;
		
		clearArea(bufferContext, 0,0, this.width, this.height);
		for(var idx in fillBarPercents) {
			drawBarGraph(this, sx, sy, fillBarPercents[idx]); 
			sx = sx + 60;
    	}
		bufferContext.stroke();
		this.canvasContext.drawImage(this.bufferCanvas, 0, 0);
	};
	
}(Senyu.prototype);
