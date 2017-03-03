import React, { Component } from 'react';
import './main.css';

const winWidth = window.innerWidth;
const winHeight = window.innerHeight;
export default class TimePicker extends Component {
	constructor(props) {
		super(props);
		this.state = {
            evtStartX: 0,
            evtStartY: 0,
            touching: false,
            objTranslate: {
            	x: 0,
            	y: 0,
            },
            objBounding: {
            	left: 0 ,
            	right: 0,
            	top: 0,
            	bottom: 0,
            	width: 0,
            	height: 0,
            },
            desX: 0, //move过程中的transform-x的值
            desY: 0, //move过程中的transform-y的值
		};
	}
	componentWillMount() {

	}
	componentDidMount() {
        var ele = document.querySelectorAll('.time-item')[1];
        this.moveElement(ele, 0, 0);
        var that = this;
        
        ele.addEventListener('touchstart', function(event) {
        	var evt = event.touches[0] || event;
        	var rect = ele.getBoundingClientRect();
        	that.setState({
        	    evtStartX: evt.pageX,
        	    evtStartY: evt.pageY,
        	    touching: true,
        	    objBounding: {
        	    	left: rect.left,
        	    	right: rect.right,
        	    	top: rect.top,
        	    	bottom: rect.bottom,
        	    	width: rect.width,
        	    	height: rect.height,
        	    } 
        	});
        });

        document.addEventListener('touchmove', function(event) {
            if(!that.state.touching) {
            	return;
            }
            event.preventDefault();
            var evt = event.touches[0] || event;
            //var moveX = evt.pageX - that.state.evtStartX;
            var moveY = evt.pageY - that.state.evtStartY;
            
            //var desLeft = that.state.objBounding.left + moveX;
            //var desRight = that.state.objBounding.right + moveX;
            var desTop = that.state.objBounding.top + moveY;
            var desBottom = that.state.objBounding.bottom + moveY;
            // if(desLeft < 0) {
            // 	moveX = -that.state.objBounding.left;
            // }
            // if(desRight > winWidth) {
            // 	moveX = winWidth - that.state.objBounding.right;
            // }
            if(desTop < 0) {
            	moveY = -that.state.objBounding.top;
            }
            if(desBottom > winHeight) {
            	moveY = winHeight - that.state.objBounding.bottom;
            }
            
            //var desX = that.state.objTranslate.x + moveX;
            var desY = that.state.objTranslate.y + moveY;
            that.moveElement(ele, 0, desY);
        });
        
        document.addEventListener('touchend', function(event) {
            that.setState({
        	    touching: false,
        	});
        	that.setState({
	            objTranslate: {
	            	x: that.state.desX,
	            	y: that.state.desY,
	            }
	        });
        });
	}
	componentDidUpdate() {

	}
	componentWillUnmount() {

	}
	moveElement(ele, x, y) {
        var x = Math.round(1000 * x) / 1000;
        var y = Math.round(1000 * y) / 1000;
        
        ele.style.webkitTransform = 'translate(' + x + 'px,' + y + 'px)';
        ele.style.transform = 'translate3d(' + x + 'px,' + y + 'px, 0)';
        this.setState({
        	desX: x,
        	desY: y,
        })
	}

	render() {
		return(
			<div className="time-picker-outer">
			    <div className="time-item">1</div>
			    <div className="time-item">2</div>
			    <div className="time-item">3</div>
			    <div className="time-item">4</div>
			    <div className="time-item">5</div>
			</div>
		);
	}
}