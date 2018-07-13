!function() {
	var paint = {
		touch: ("ontouchstart" in document),
		init: function(canvas) {
			if(canvas.inited){
				return;
			}
			this.load(canvas);
			this.bind();
			canvas.inited = true;
		},
		load: function(canvas) {
			var _this = this;
			_this.x = []; //记录鼠标移动是的X坐标
			_this.y = []; //记录鼠标移动是的Y坐标
			_this.clickDrag = [];
			_this.lock = false;
			_this.isEraser = false;
			_this.storageColor = "#FF0000";
			_this.eraserRadius = 15;
			// _this.color = ["#FF0000", "#80FF00", "#00FFFF", "#808080", "#FF8000", "#408080", "#8000FF", "#CCCC00", "#000000"];
			_this.fontWeight = [5];
			_this.$ = function(id) {
				return typeof id == "string" ? document.getElementById(id) : id;
			};
			_this.canvas = canvas;
			_this.cxt = _this.canvas.getContext('2d');
			_this.cxt.lineJoin = "round";
			_this.cxt.strokeStyle = _this.storageColor;
			_this.cxt.lineWidth = 4;
			_this.w = _this.canvas.width;
			_this.h = _this.canvas.height;
			_this.StartEvent = _this.touch ? "touchstart" : "mousedown";
			_this.MoveEvent = _this.touch ? "touchmove" : "mousemove";
			_this.EndEvent = _this.touch ? "touchend" : "mouseup";
		},
		bind: function() {
			var t = this;
			var $canvas = $(t.canvas);
			$canvas.bind(t.StartEvent, function(e) {
				t.cxt.strokeStyle = t.storageColor; //强制重置颜色
				if(e.originalEvent){
					e = e.originalEvent;
				}
				var touch = t.touch ? e.touches[0] : e;
				t.preventDefault(e);
				var _x = touch.clientX - touch.target.offsetLeft;
				var _y = touch.clientY - touch.target.offsetTop;
				if (t.isEraser) {
					t.resetEraser(_x, _y, touch);
				} else {
					t.movePoint(_x, _y);
					t.drawPoint();
				}
				t.lock = true;
			});
			$canvas.bind(t.MoveEvent, function(e) {
				if(e.originalEvent){
					e = e.originalEvent;
				}
				var touch = t.touch ? e.touches[0] : e;
				if (t.lock) {
					var _x = touch.clientX - touch.target.offsetLeft;
					var _y = touch.clientY - touch.target.offsetTop;
					if (t.isEraser) {
						t.resetEraser(_x, _y, touch);
					} else {
						t.movePoint(_x, _y, true);
						t.drawPoint();
					}
				}
			});
			$canvas.bind(t.EndEvent, function(e) {
				t.lock = false;
				t.x = [];
				t.y = [];
				t.clickDrag = [];
				clearInterval(t.Timer);
				t.Timer = null;
			});
		},
		movePoint: function(x, y, dragging) {
			this.x.push(x);
			this.y.push(y);
			this.clickDrag.push(y);
		},
		drawPoint: function(x, y, radius) {
			for (var i = 0; i < this.x.length; i++) {
				this.cxt.beginPath();
				this.cxt.lineWidth = 4;
				if (this.clickDrag[i] && i) {
					this.cxt.moveTo(this.x[i - 1], this.y[i - 1]);
				} else {
					this.cxt.moveTo(this.x[i] - 1, this.y[i]);
				}
				this.cxt.lineTo(this.x[i], this.y[i]);
				this.cxt.closePath();
				this.cxt.stroke();
			}
		},
		clear: function() {
			this.cxt && this.cxt.clearRect(0, 0, this.w, this.h);
		},
		redraw: function() {
			this.cxt.restore();
		},
		preventDefault: function(e) {
			if(e.preventDefault){
				e.preventDefault();
			}else{
				window.event.returnValue = false;
			}
			// var touch = this.touch ? e.touches[0] : e;
			// if (this.touch) e.preventDefault();
			// else window.event.returnValue = false;
		},
		getUrl: function() {
			this.$("html").innerHTML = this.canvas.toDataURL();
		},
		resetEraser: function(_x, _y, touch) {
			var t = this;
			t.cxt.globalCompositeOperation = "destination-out";
			t.cxt.beginPath();
			t.cxt.lineWidth = 4;
			t.cxt.arc(_x, _y, t.eraserRadius, 0, Math.PI * 2);
			t.cxt.strokeStyle = "rgba(250,250,250,0)";
			t.cxt.fill();
			t.cxt.globalCompositeOperation = "source-over"
		}
	};

	window.Paint = paint;
}()