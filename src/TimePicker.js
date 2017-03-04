import React, { Component } from 'react';
import './main.css';

const winWidth = window.innerWidth;
const winHeight = window.innerHeight;
export default class TimePicker extends Component {
	constructor(props) {
		super(props);
		this.state = {
            touchStartY: 0,
            touchStartTime: 0,
            touchMoveY: 0,//记录每一帧touchMove的y坐标
            touchEndTime: 0,//记录touchend的时间戳

            touchMoveTime: 0,//每帧touchMove事件的时间戳

            touching: false,
            objTranslate: {
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
            desY: 0, //move过程中的transform-y的值
            inertia: false,//是否处于惯性状态
		};
	}
	componentDidMount() {
        var ele = document.querySelectorAll('.time-item')[1];
        this.moveElement(ele, 0, 0);
        var that = this;
        
        ele.addEventListener('touchstart', function(event) {
        	var evt = event.touches[0] || event;
        	var rect = ele.getBoundingClientRect();
        	that.setState({
        	    touchStartY: evt.pageY,
                touchStartTime: +new Date(),
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
            that.setState({
                touchMoveY: evt.pageY,
                touchMoveTime: +new Date(),
            });
            
            var moveY = evt.pageY - that.state.touchStartY;
            
            var desTop = that.state.objBounding.top + moveY;
            var desBottom = that.state.objBounding.bottom + moveY;
            
            if(desTop < 0) {
            	moveY = -that.state.objBounding.top;
            }
            if(desBottom > winHeight) {
            	moveY = winHeight - that.state.objBounding.bottom;
            }

            var desY = that.state.objTranslate.y + moveY;
            that.moveElement(ele, 0, desY);
        });
        
        document.addEventListener('touchend', function(event) {
            var evt = event.touches[0] || event;
            
            that.setState({
        	    touching: false,
            	objTranslate: {
                    y: that.state.desY,
                },
                touchEndTime: +new Date(),
                inertia: true,
            });
            //最后一次touchMoveTime和touchEndTime之间超过30ms,意味着停留了长时间,不做滑动
            if(that.state.touchEndTime - that.state.touchMoveTime > 30) {
                return;
            }
            var moveY = that.state.touchMoveY - that.state.touchStartY; //矢量有+-
            var time = that.state.touchEndTime - that.state.touchStartTime;
            var speed = moveY / time * 16.666; //矢量有+-
            var rate = Math.min(10, Math.abs(speed)); //加速度a

            var slide = function () {
                if (that.state.touching) {
                    that.setState({
                        inertia: false,
                    })
                    return;
                }
                if(!that.state.inertia) {
                    return;
                }
                speed = speed - speed / rate;

                var y = that.state.objTranslate.y + speed;

                that.moveElement(ele, 0, y);
                that.setState({
                    objTranslate: {
                        y: y
                    }
                });

                if (Math.abs(speed) < 0.1) {
                    speed = 0;
                    that.setState({
                        inertia: false,
                    });
                } else {
                    requestAnimationFrame(slide);
                }
            };

            slide();
        });
	}
	moveElement(ele, x, y) {
        var x = Math.round(1000 * x) / 1000;
        var y = Math.round(1000 * y) / 1000;
        
        ele.style.webkitTransform = 'translate(' + x + 'px,' + y + 'px)';
        ele.style.transform = 'translate3d(' + x + 'px,' + y + 'px, 0)';
        this.setState({
        	desX: x,
        	desY: y,
        });
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