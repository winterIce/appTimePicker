function TimeItem(element, options) {
	this.element = element;
	this.options = options;
}
TimeItem.defaults = {

};
TimeItem.prototype = {
    init: function() {
    	this.options.timeMask = this.element;
    	this.options.timeContainer = this.element.nextSibling.nextSibling;
    	this.options = Object.assign({}, TimeItem.defaults, this.options);
    	renderHtml();
    	console.log('====init done====');
    }
    renderHtml() {
    	var that = this;
    	var content = [];
        for(var i = that.options.startNum; i <= that.options.endNum; i++) {
            content.push('<div class="time-item-content">' + addZero(i) + that.options.unit + '</div>');
        }
        that.options.timeContainer.innerHTML = content.join('');
    }
}
addZero(n) {
    if(n < 10) {
        return '0' + n;
    }
    return n;
}
export {
	TimeItem,
}