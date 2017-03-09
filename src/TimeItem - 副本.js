function TimeItem(element, options) {
	this.element = element;
	this.options = options;
}
TimeItem.defaults = {

};
TimeItem.prototype = {
    init: function() {
    	console.log('init done');
    }
}
export {
	TimeItem,
}