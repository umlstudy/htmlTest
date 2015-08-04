var senyu = {};

senyu.barCount = 17;
senyu.singleBarWidth = 20;
senyu.spaceBetweenBar = 1;
senyu.leftShift = 1;
senyu.green = '#00FF00';
senyu.darkGreen = '#008000';
senyu.defaultBackgroundColor = '#000000';

senyu.drawDotLine = function(ctx, x, y, width) {
	for ( var dx=0; dx<width; dx+=2 ) {
		ctx.fillRect( x+dx, y, 1, 1 );
	}
};

senyu.drawLine = function(ctx, x, y, width) {
	ctx.fillRect( x, y, width, 1 );
};

senyu.clearArea = function(ctx, x, y, width, height) {
	var oriFillStyle = ctx.fillStyle;
	{
		ctx.fillStyle = this.defaultBackgroundColor;
		ctx.fillRect(x,y,width, height);
	}
	ctx.fillStyle = oriFillStyle;
};

senyu.drawBarGraphPart = function(ctx, startX, startY, fillBarPercent) {
	var oriFillStyle = ctx.fillStyle;
	{
		var cx, cy;
		var funcDrawLine;
		var singleBarWidth_;
		var leftShift_;
		
		var fillBarCnt = Math.round(17 * fillBarPercent / 100);
		for ( var dy=0;dy<this.barCount;dy++ ) {
			if ( (this.barCount - dy ) <= fillBarCnt ) {
				// drawLine
				ctx.fillStyle=this.green;
				funcDrawLine = senyu.drawLine;
				singleBarWidth_ = this.singleBarWidth;
				leftShift_ = 0;
			} else {
				// dotLine
				ctx.fillStyle=this.darkGreen;
				funcDrawLine = senyu.drawDotLine;
				singleBarWidth_ = this.singleBarWidth;
				leftShift_ = this.leftShift;
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
}
	
senyu.drawBarGraph = function(ctx, startX, startY, fillBarPercent) {
	var oriFillStyle = ctx.fillStyle;
	{
		senyu.drawBarGraphPart(ctx, startX, startY, fillBarPercent);
		startX = startX+this.singleBarWidth+this.leftShift+this.spaceBetweenBar;
		senyu.drawBarGraphPart(ctx, startX, startY, fillBarPercent);
		
		startY = startY + this.barCount*3 + 20;
		ctx.fillStyle=this.green;
		ctx.font = "15px Arial";
		ctx.textAlign="center"; 
		ctx.fillText(fillBarPercent+'%',startX,startY);
		
	}
	ctx.fillStyle = oriFillStyle;
};
