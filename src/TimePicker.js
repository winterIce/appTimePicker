import React, { Component } from 'react';
import './main.css';

const winWidth = window.innerWidth;
const winHeight = window.innerHeight;
const itemHeight = 34;
export default class TimePicker extends Component {
	constructor(props) {
		super(props);
		this.state = {
            curItem: null,
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
            	left: 0,
            	right: 0,
            	top: 0,
            	bottom: 0,
            	width: 0,
            	height: 0,
            },
            containerBounding: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                width: 0,
                height: 0,
            },
            moveY: 0, //move过程中的transform-y的值
            inertia: false,//是否处于惯性状态
            moveYYear: 0,
            moveYMonth: 0,
            moveYDate: 0,
            moveYHour: 0,
            moveYMinute: 0,

            year: 2013,
            month: 4,
            date: 4,
            hour: 3,
            minute: 3,
		};
	}
    init() {
        var years = [];
        for(var i = 2010; i <= 2020; i++) {
            years.push('<div class="time-item-content">'+i+'</div>');
        }
        this.refs.yearItem.innerHTML = years.join('');

        var months = [];
        for(i = 1; i <= 12; i++) {
            months.push('<div class="time-item-content">' + i + '</div>');
        }
        this.refs.monthItem.innerHTML = months.join('');

        var dates = [];
        for(i = 1; i <= 31; i++) {
            dates.push('<div class="time-item-content">' + i + '</div>');
        }
        this.refs.dateItem.innerHTML = dates.join('');

        var hours = [];
        for(i = 0; i <= 23; i++) {
            hours.push('<div class="time-item-content">' + i + '</div>');
        }
        this.refs.hourItem.innerHTML = hours.join('');

        var minutes = [];
        for(i = 0; i <= 59; i++) {
            minutes.push('<div class="time-item-content">' + i + '</div>');
        }
        this.refs.minuteItem.innerHTML = minutes.join('');
    }
	componentDidMount() {
        var that = this;
        that.init();
        var eleArr = [];
        eleArr.push(that.refs.yearItemMask);
        eleArr.push(that.refs.monthItemMask);
        eleArr.push(that.refs.dateItemMask);
        eleArr.push(that.refs.hourItemMask);
        eleArr.push(that.refs.minuteItemMask);
        eleArr.forEach(function(item) {
            var itemContent = item.nextSibling.nextSibling;
            that.moveElement(itemContent, 0, 0);
            item.addEventListener('touchstart', function(event) {
                var item = itemContent;
                var evt = event.touches[0] || event;
                var rect = item.getBoundingClientRect();

                var container = item.parentNode;
                var containerRect = container.getBoundingClientRect();

                that.setState({
                    curItem: item,
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
                    },
                    containerBounding: {
                        left: containerRect.left,
                        right: containerRect.right,
                        top: containerRect.top,
                        bottom: containerRect.bottom,
                        width: containerRect.width,
                        height: containerRect.height,
                    }
                });
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
            
            var tempY = that.state.objTranslate.y + moveY;
            if(tempY > itemHeight * 6) {
                tempY = itemHeight * 6;
            }
            if(tempY < -(that.state.objBounding.height - itemHeight) ) {
                tempY = -(that.state.objBounding.height - itemHeight);
            }
            that.moveElement(that.state.curItem, 0, tempY);
        });
        
        document.addEventListener('touchend', function(event) {
            var evt = event.touches[0] || event;
            
            that.setState({
        	    touching: false,
            	objTranslate: {
                    y: that.state.moveY,
                },
                touchEndTime: +new Date(),
                inertia: true,
            });
            that.inBox(that.state.curItem);
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

                that.moveElement(that.state.curItem, 0, y);
                that.setState({
                    objTranslate: {
                        y: y
                    }
                });

                if (Math.abs(speed) < 0.5) {
                    speed = 0;
                    that.setState({
                        inertia: false,
                    });
                    that.inBox(that.state.curItem);
                } else {
                    requestAnimationFrame(slide);
                }
            };

            slide();
        });
	}
    inBox(ele) {
        var that = this;
        var maxY = 3 * itemHeight;
        var minY = -(that.state.objBounding.height - 4 * itemHeight);
        var moveY; //delta变化量
        if(that.state.objTranslate.y > maxY) {
            moveY = maxY - that.state.objTranslate.y;
        }
        else if(that.state.objTranslate.y < minY) {
            moveY = minY - that.state.objTranslate.y;   
        }
        else {
            //调整位置,使时间块位于中间
            moveY = Math.ceil(that.state.objTranslate.y / itemHeight) * itemHeight - that.state.objTranslate.y;
        }

        var start = 0;
        var during = 40;
        var init = that.state.objTranslate.y;
        //变化量为0,不用动
        if(moveY == 0) {
            that.setState({
                inertia: false,
            });
            that.calTime(init);
            return;
        }

        var run = function () {
            if (that.state.touching) {
                that.setState({
                    objTranslate: {
                        y: that.state.moveY,
                    },
                    inertia: false,
                });
                return;
            }

            start++;
            var y = that.easeOutQuad(start, init, moveY, during);
            that.moveElement(ele, 0, y);

            if (start < during) {
                requestAnimationFrame(run);
            } else {
                that.setState({
                    objTranslate:{
                        y: y
                    },
                    inertia: false,
                });
                that.calTime(y);
            }
        };
        run();
    }
    calTime(y) {
        var type = this.state.curItem.getAttribute('data-type');
        if(type == 'year') {
            this.setState({
                moveYYear: y,
                year: 2013 - y / itemHeight,
            });
        }
        else if(type == 'month') {
            this.setState({
                moveYMonth: y,
                month: 4 - y / itemHeight,
            });
        }
        else if(type == 'date') {
            this.setState({
                moveYDate: y,
                date: 4 - y / itemHeight,
            });
        }
        else if(type == 'hour') {
            this.setState({
                moveYMonth: y,
                hour: 3 - y / itemHeight,
            });
        }
        else if(type == 'minute') {
            this.setState({
                moveYMonth: y,
                minute: 3 - y / itemHeight,
            });
        }
        console.log(this.state.year + '-' + this.state.month + '-' + this.state.date + ' ' + this.state.hour + ':' +this.state.minute + ':' + '00');
    }
	moveElement(ele, x, y) {
        var x = Math.round(1000 * x) / 1000;
        var y = Math.round(1000 * y) / 1000;
        
        ele.style.webkitTransform = 'translate(' + x + 'px,' + y + 'px)';
        ele.style.transform = 'translate3d(' + x + 'px,' + y + 'px, 0)';
        this.setState({
        	moveY: y,
        });
	}
    // easeOutQuad算法,先慢后快
    /*
     * t: current time(当前时间)
     * b: beginning value(初始值)
     * c: change in value(变化量)
     * d: duration(持续时间)
    **/
    easeOutQuad(t, b, c, d) {
        return -c *(t /= d)*(t-2) + b;
    }

	render() {
		return(
			<div className="time-picker-container">
			    <div className="time-item-container">
                    <div className="time-item">
                        <div className="time-item-mask" ref="yearItemMask"></div>
                        <div className="time-item-middle-bg"></div>
                        <div className="time-item-contents" ref="yearItem" data-type="year">
                        </div>
                    </div>
                </div>
			    <div className="time-item-container">
                    <div className="time-item">
                        <div className="time-item-mask" ref="monthItemMask"></div>
                        <div className="time-item-middle-bg"></div>
                        <div className="time-item-contents" ref="monthItem" data-type="month">
                        </div>
                    </div>
                </div>
			    <div className="time-item-container">
                    <div className="time-item">
                        <div className="time-item-mask" ref="dateItemMask"></div>
                        <div className="time-item-middle-bg"></div>
                        <div className="time-item-contents" ref="dateItem" data-type="date">
                        </div>
                    </div>
                </div>
			    <div className="time-item-container">
                    <div className="time-item">
                        <div className="time-item-mask" ref="hourItemMask"></div>
                        <div className="time-item-middle-bg"></div>
                        <div className="time-item-contents" ref="hourItem" data-type="hour">
                        </div>
                    </div>
                </div>
			    <div className="time-item-container">
                    <div className="time-item">
                        <div className="time-item-mask" ref="minuteItemMask"></div>
                        <div className="time-item-middle-bg"></div>
                        <div className="time-item-contents" ref="minuteItem" data-type="minute">
                        </div>
                    </div>
                </div>
			</div>
		);
	}
}