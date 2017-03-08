import React, { Component } from 'react';
import './main.css';

const winWidth = window.innerWidth;
const winHeight = window.innerHeight;
const itemHeight = 34;
export default class TimePicker extends Component {
	constructor(props) {
		super(props);
		this.state = {
            curItem: null,//当前touch的item
            curType: null,//当前touch的data-type:year month date hour minute 
            touchStartY: 0,
            touchStartTime: 0,
            touchMoveY: 0,//记录每一帧touchMove的y坐标
            touchEndTime: 0,//记录touchend的时间戳

            touchMoveTime: 0,//每帧touchMove事件的时间戳

            touching: false,//是否触摸ing
            objBounding: {//正在触摸的滑块
            	left: 0,
            	right: 0,
            	top: 0,
            	bottom: 0,
            	width: 0,
            	height: 0,
            },
            containerBounding: {//time-item的范围
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                width: 0,
                height: 0,
            },
            moveY: 0, //move过程中的transform-y的值
            inertia: false,//是否处于惯性状态
            moveYYear: 0,//年份transform-y
            moveYMonth: 0,//月份transform-y
            moveYDate: 0,//日期transform-y
            moveYHour: 0,//小时transform-y
            moveYMinute: 0,//分钟transform-y

            year: 0,//当前时间的年
            month: 0,//当前时间的月
            date: 0,//当前时间的日
            hour: 0,//当前时间的小时
            minute: 0,//当前时间的分钟

            ansTime: '',//当前时间字符串 2017-03-08 09:00
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
            year: this.props.year || d.getFullYear(),
            month: this.props.month || d.getMonth() + 1,
            date: this.props.date || d.getDate(),
            hour: this.props.hour || d.getHours(),
            minute: this.props.minute || d.getMinutes(),
        });
    }
	componentDidMount() {
        var that = this;
        that.init();
        this.refs.shadowLayer.addEventListener('touchstart', function(event) {
            event.preventDefault();
        });
        var eleArr = [];
        eleArr.push(that.refs.yearItemMask);
        eleArr.push(that.refs.monthItemMask);
        eleArr.push(that.refs.dateItemMask);
        eleArr.push(that.refs.hourItemMask);
        eleArr.push(that.refs.minuteItemMask);
        eleArr.forEach(function(item) {
            var itemContent = item.nextSibling.nextSibling;
            var type = itemContent.getAttribute('data-type');
            var y = 0;
            if(type == 'year') {
                y = itemHeight * (2013 - that.state.year);
                that.moveElement(itemContent, 0, y);
                that.setState({
                    moveYYear: y,
                });
            }
            else if(type == 'month') {
                y = itemHeight * (4 - that.state.month);
                that.moveElement(itemContent, 0, y);   
                that.setState({
                    moveYMonth: y,
                });
            }
            else if(type == 'date') {
                y = itemHeight * (4 - that.state.date);
                that.moveElement(itemContent, 0, y);
                that.setState({
                    moveYDate: y,
                }); 
            }
            else if(type == 'hour') {
                y = itemHeight * (3 - that.state.hour);
                that.moveElement(itemContent, 0, y);
                that.setState({
                    moveYHour: y,
                });
            }
            else if(type == 'minute') {
                y = itemHeight * (3 - that.state.minute);
                that.moveElement(itemContent, 0, y);
                that.setState({
                    moveYMinute: y,
                });  
            }

            item.addEventListener('touchstart', function(event) {
                event.preventDefault();
                var evt = event.touches[0] || event;
                var rect = itemContent.getBoundingClientRect();

                var container = itemContent.parentNode;
                var containerRect = container.getBoundingClientRect();

                that.setState({
                    curItem: itemContent,
                    curType: itemContent.getAttribute('data-type'),
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
            var tempY = 0;
            if(that.state.curType == 'year') {
                tempY = that.state.moveYYear + moveY;
            }
            else if(that.state.curType == 'month') {
                tempY = that.state.moveYMonth + moveY;
            }
            else if(that.state.curType == 'date') {
                tempY = that.state.moveYDate + moveY;
            }
            else if(that.state.curType == 'hour') {
                tempY = that.state.moveYHour + moveY;
            }
            else if(that.state.curType == 'minute') {
                tempY = that.state.moveYMinute + moveY;
            }

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
                touchEndTime: +new Date(),
                inertia: true,
            });
            if(that.state.curType == 'year') {
                that.setState({
                    moveYYear: that.state.moveY,
                });
            }
            else if(that.state.curType == 'month') {
                that.setState({
                    moveYMonth: that.state.moveY,
                });
            }
            else if(that.state.curType == 'date') {
                that.setState({
                    moveYDate: that.state.moveY,
                });
            }
            else if(that.state.curType == 'hour') {
                that.setState({
                    moveYHour: that.state.moveY,
                });
            }
            else if(that.state.curType == 'minute') {
                that.setState({
                    moveYMinute: that.state.moveY,
                });
            }

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

                if(that.state.curType == 'year') {
                    var y = that.state.moveYYear + speed;
                    that.moveElement(that.state.curItem, 0, y);
                    that.setState({
                        moveYYear: y,
                    });
                }
                else if(that.state.curType == 'month') {
                    var y = that.state.moveYMonth + speed;
                    that.moveElement(that.state.curItem, 0, y);
                    that.setState({
                        moveYMonth: y,
                    });
                }
                else if(that.state.curType == 'date') {
                    var y = that.state.moveYDate + speed;
                    that.moveElement(that.state.curItem, 0, y);
                    that.setState({
                        moveYDate: y,
                    });
                }
                else if(that.state.curType == 'hour') {
                    var y = that.state.moveYHour + speed;
                    that.moveElement(that.state.curItem, 0, y);
                    that.setState({
                        moveYHour: y,
                    });
                }
                else if(that.state.curType == 'minute') {
                    var y = that.state.moveYMinute + speed;
                    that.moveElement(that.state.curItem, 0, y);
                    that.setState({
                        moveYMinute: y,
                    });
                }

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
        var moveY = 0; //delta变化量
        var y = 0;
        if(that.state.curType == 'year') {
            y = that.state.moveYYear;
        }
        else if(that.state.curType == 'month') {
            y = that.state.moveYMonth;
        }
        else if(that.state.curType == 'date') {
            y = that.state.moveYDate;
        }
        else if(that.state.curType == 'hour') {
            y = that.state.moveYHour;
        }
        else if(that.state.curType == 'minute') {
            y = that.state.moveYMinute;
        }

        if(y > maxY) {
            moveY = maxY - y;
        }
        else if(y < minY) {
            moveY = minY - y;   
        }
        else {
            //调整位置,使时间块位于中间
            moveY = Math.ceil(y / itemHeight) * itemHeight - y;
        }

        var start = 0;
        var during = 40;
        var init = y;
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
                    inertia: false,
                });
                return;
            }

            start++;
            var y = that.easeOutQuad(start, init, moveY, during);
            that.moveElement(ele, 0, y);
            if(that.state.curType == 'year') {
                that.setState({
                    moveYYear: y,
                });
            }
            else if(that.state.curType == 'month') {
                that.setState({
                    moveYMonth: y,
                });
            }
            else if(that.state.curType == 'date') {
                that.setState({
                    moveYDate: y,
                });
            }
            else if(that.state.curType == 'hour') {
                that.setState({
                    moveYHour: y,
                });
            }
            else if(that.state.curType == 'minute') {
                that.setState({
                    moveYMinute: y,
                });
            }

            if (start < during) {
                requestAnimationFrame(run);
            } else {
                that.setState({
                    inertia: false,
                });

                that.calTime(y);
            }
        };
        run();
    }
    calTime(y) {
        var type = this.state.curType;
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
        var month = this.state.month;
        var year = this.state.year;
        if(type == 'month') {
            if(month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
                this.setDateCount(31);
            }
            else if(month == 4 || month == 6 || month == 9 || month == 11) {
                this.setDateCount(30);
                if(this.state.date > 30) {
                    this.setDateNum(30);
                }
            }
            else if(month == 2){
                if( (year % 4 == 0) && (year % 100 != 0) || (year % 400 == 0) ) {
                    this.setDateCount(29);
                    if(this.state.date > 29) {
                        this.setDateNum(29);
                    }
                }
                else {
                    this.setDateCount(28);
                    if(this.state.date > 28) {
                        this.setDateNum(28);
                    }
                }
            }    
        }
        else if(type == 'year') {
            if(month == 2) {
                if( (year % 4 == 0) && (year % 100 != 0) || (year % 400 == 0) ) {
                    this.setDateCount(29);
                    if(this.state.date > 29) {
                        this.setDateNum(29);
                    }
                }
                else {
                    this.setDateCount(28);
                    if(this.state.date > 28) {
                        this.setDateNum(28);
                    }
                }
            }
        }
    }

    setDateCount(cnt) {
        var dates = [];
        for(var i = 1; i <= cnt; i++) {
            dates.push('<div class="time-item-content">' + this.addZero(i) + '日</div>');
        }
        this.refs.dateItem.innerHTML = dates.join('');
    }
    setDateNum(date) {
        var y = itemHeight * (4 - date);
        this.moveElement(this.refs.dateItem, 0, y);
        this.setState({
            moveYDate: y,
            date: date,
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
                <div className="shadow-layer" ref="shadowLayer"></div>
    			<div className="time-picker-container">
                    <div className="operate-container">
                        <div ref="okBtn" className="operate-btn" onClick={this.props.cancelHandler.bind(this)}>取消</div>
                        <div ref="cancelBtn" className="operate-btn" onClick={this.okHandler.bind(this)}>确定</div>
                    </div>
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
            </div>
		);
	}
}