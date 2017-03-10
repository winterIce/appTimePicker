function TimeItem(element, options) {
	this.element = element;
	this.options = options;
    this.transformY = 0;//存储style.transform里的y
    this.moveY = 0;
    this.itemHeight = 34;
    this.offset = 3;
    this.timeVal = 0;
    this.timeMask = null;//遮罩
    this.timeContainer = null;//时间内容容器
    this.parentContainer = null;//最外层容器

    this.objBounding = null;//内容容器的bounding
    this.touching = false;//是否正在触摸当前滑块
    this.touchStartY = 0;//开始触摸时的transformY
    this.touchStartTime = 0;//开始触摸的时间
    this.touchStartCallback = function() {

    };//触摸开始时的回调函数
    this.inertia = false;
    this.calTimeCallback = function() {

    };//计算时间的回调函数
}
TimeItem.defaults = {
    startNum: '',
    endNum: '',
    unit: '',
};
TimeItem.prototype = {
    init: function(timeVal) {
        this.timeVal = timeVal;
    	this.timeMask = this.element;
    	this.timeContainer = this.element.nextSibling.nextSibling;
        this.parentContainer = this.element.parentNode;
    	this.options = Object.assign({}, TimeItem.defaults, this.options);
    	this.renderHtml();
        this.initTranslate();
        this.calBounding();
        this.touchStartEvt();
    	console.log('====init done====');
    }
    renderHtml: function() {
    	var that = this;
    	var content = [];
        for(var i = that.options.startNum; i <= that.options.endNum; i++) {
            content.push('<div class="time-item-content">' + addZero(i) + that.options.unit + '</div>');
        }
        that.options.timeContainer.innerHTML = content.join('');
    }
    initTranslate: function() {
        var y = this.itemHeight * (this.options.startNum + this.offset - this.timeVal);
        this.moveElement(0, y);
        this.moveY = y;
    }
    moveElement: function(x, y) {
        var x = Math.round(1000 * x) / 1000;
        var y = Math.round(1000 * y) / 1000;

        this.options.timeContainer.style.webkitTransform = 'translate(' + x + 'px,' + y + 'px)';
        this.options.timeContainer.style.transform = 'translate3d(' + x + 'px,' + y + 'px, 0)';
        this.transformY = y;
    }
    calBounding: function() {
        var rect = this.timeContainer.getBoundingClientRect();
        this.objBounding = {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
        }
    }
    touchStartEvt: function() {
        var that = this;
        this.timeMask.addEventListener('touchstart', function(event) {
            event.preventDefault();
            var evt = event.touches[0] || event;
            that.touching = true;
            that.touchStartY = evt.pageY;
            that.touchStartTime = +new Date();
            that.touchStartCallback(that);
        });
    }
    getTouchStartY: function() {
        return this.touchStartY;
    }
    getMoveY: function() {
        return this.moveY;
    }
    setMoveY: function() {
        this.moveY = this.transformY;
    }
    getObjBounding: function() {
        return this.objBounding;
    }
    setInertia: function(inertia) {
        this.inertia = inertia;
    }

    inBox: function() {
        var maxY = 3 * itemHeight;
        var minY = -(this.objBounding.height - 4 * itemHeight);
        var delta = 0; //delta变化量
        var y = this.moveY;

        if(y > maxY) {
            delta = maxY - y;
        }
        else if(y < minY) {
            delta = minY - y;   
        }
        else {
            //调整位置,使时间块位于中间
            delta = Math.ceil(y / itemHeight) * itemHeight - y;
        }

        var start = 0;
        var during = 40;
        var init = y;
        //变化量为0,不用动
        if(delta == 0) {
            this.inertia = false;
            
            this.calTime(init);
            return;
        }

        this.adjust(start, init, delta, during);
    }

    adjust: function(start, init, delta, during) {
        var that = this;
        if (this.touching) {
            this.inertia = false;
            return;
        }

        start++;
        var y = easeOutQuad(start, init, delta, during);
        this.moveElement(0, y);
        this.moveY = y;

        if (start < during) {
            requestAnimationFrame(function() {
                that.adjust(start, init, delta, during);
            });
        } else {
            this.inertia = false;
            this.calTime(y);
        }
    }

    calTime: function(y) {
        this.moveY = y;
        this.timeVal = this.options.startNum + this.offset - y / this.itemHeight;
        this.calTimeCallback(this.timeVal);
    }
}
function addZero(n) {
    if(n < 10) {
        return '0' + n;
    }
    return n;
}

/*
 * easeOutQuad算法,先慢后快
 * t: current time(当前时间)
 * b: beginning value(初始值)
 * c: change in value(变化量)
 * d: duration(持续时间)
**/
function easeOutQuad(t, b, c, d) {
    return -c *(t /= d)*(t-2) + b;
}

export {
	TimeItem,
}