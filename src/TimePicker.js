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

            year: 0,
            month: 0,
            date: 0,
            hour: 0,
            minute: 0,

            ansTime: '',
		};
	}
    init() {
        var years = [];
        for(var i = 2010; i <= 2020; i++) {
            years.push('<div class="time-item-content">' + i + '年</div>');
        }
        this.refs.yearItem.innerHTML = years.join('');

        var months = [];
        for(i = 1; i <= 12; i++) {
            months.push('<div class="time-item-content">' + this.addZero(i) + '月</div>');
        }
        this.refs.monthItem.innerHTML = months.join('');

        var dates = [];
        for(i = 1; i <= 31; i++) {
            dates.push('<div class="time-item-content">' + this.addZero(i) + '日</div>');
        }
        this.refs.dateItem.innerHTML = dates.join('');

        var hours = [];
        for(i = 0; i <= 23; i++) {
            hours.push('<div class="time-item-content">' + this.addZero(i) + '时</div>');
        }
        this.refs.hourItem.innerHTML = hours.join('');

        var minutes = [];
        for(i = 0; i <= 59; i++) {
            minutes.push('<div class="time-item-content">' + this.addZero(i) + '分</div>');
        }
        this.refs.minuteItem.innerHTML = minutes.join('');
    }
    componentWillMount() {
        var d = new Date();
        this.setState({
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            date: d.getDate(),
            hour: d.getHours(),
            minute: d.getMinutes(),
        });
    }
	componentDidMount() {
        var that = this;
        that.init();
        var eleArr = [];
        eleArr.push(that.refs.yearItem);
        eleArr.push(that.refs.monthItem);
        eleArr.push(that.refs.dateItem);
        eleArr.push(that.refs.hourItem);
        eleArr.push(that.refs.minuteItem);
        eleArr.forEach(function(item) {
            var itemContent = item;
            var type = itemContent.getAttribute('data-type');
            if(type == 'year') {
                that.moveElement(itemContent, 0, 34 * (2013 - that.state.year));    
            }
            else if(type == 'month') {
                that.moveElement(itemContent, 0, 34 * (4 - that.state.month));   
            }
            else if(type == 'date') {
                that.moveElement(itemContent, 0, 34 * (4 - that.state.date));   
            }
            else if(type == 'hour') {
                that.moveElement(itemContent, 0, 34 * (3 - that.state.hour));   
            }
            else if(type == 'minute') {
                that.moveElement(itemContent, 0, 34 * (3 - that.state.minute));   
            }

            item.addEventListener('touchstart', function(event) {
                event.preventDefault();
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
            console.log(evt.pageY, that.state.touchStartY);
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
            if(!that.state.touching) {
                return;
            }
            event.preventDefault();
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

        //初始化时间
        var time = this.state.year + '-' + this.addZero(this.state.month) + '-' + this.addZero(this.state.date) + ' ' + this.addZero(this.state.hour) + ':' + this.addZero(this.state.minute) + ':' + '00';
        this.setState({
            ansTime: time,
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
        var time = this.state.year + '-' + this.addZero(this.state.month) + '-' + this.addZero(this.state.date) + ' ' + this.addZero(this.state.hour) + ':' + this.addZero(this.state.minute) + ':' + '00';
        console.log(time);
        this.setState({
            ansTime: time,
        });
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
    addZero(n) {
        if(n < 10) {
            return '0' + n;
        }
        return n;
    }
    okHandler() {
        this.props.okHandler(this.state.ansTime);
    }

	render() {
		return(
            <div>
                <div className="shadow-layer"></div>
    			<div className="time-picker-container">
                    <div className="operate-container">
                        <div ref="okBtn" className="operate-btn" onClick={this.props.cancelHandler.bind(this)}>取消</div>
                        <div ref="cancelBtn" className="operate-btn" onClick={this.okHandler.bind(this)}>确定</div>
                    </div>
    			    <div className="time-item-container">
                        <div className="time-item">
                        {/*
                            <div className="time-item-mask" ref="yearItemMask"></div>
                        */}
                            <div className="time-item-middle-bg"></div>
                            <div className="time-item-contents" ref="yearItem" data-type="year">
                            </div>
                        </div>
                    </div>
    			    <div className="time-item-container">
                        <div className="time-item">
                        {/*
                            <div className="time-item-mask" ref="monthItemMask"></div>
                        */}
                            <div className="time-item-middle-bg"></div>
                            <div className="time-item-contents" ref="monthItem" data-type="month">
                            </div>
                        </div>
                    </div>
    			    <div className="time-item-container">
                        <div className="time-item">
                        {/*
                            <div className="time-item-mask" ref="dateItemMask"></div>
                        */}
                            <div className="time-item-middle-bg"></div>
                            <div className="time-item-contents" ref="dateItem" data-type="date">
                            </div>
                        </div>
                    </div>
    			    <div className="time-item-container">
                        <div className="time-item">
                        {/*
                            <div className="time-item-mask" ref="hourItemMask"></div>
                        */}
                            <div className="time-item-middle-bg"></div>
                            <div className="time-item-contents" ref="hourItem" data-type="hour">
                            </div>
                        </div>
                    </div>
    			    <div className="time-item-container">
                        <div className="time-item">
                        {/*
                            <div className="time-item-mask" ref="minuteItemMask"></div>
                        */}
                            <div className="time-item-middle-bg"></div>
                            <div className="time-item-contents" ref="minuteItem" data-type="minute">
                            </div>
                        </div>
                    </div>
    			</div>
            </div>
		);
	}
}