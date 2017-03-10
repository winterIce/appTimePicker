import React, { Component } from 'react';
import { TimeItem } from './TimeItem';
import { getDateNumByMonthYear } from './Util';
import './main.css';

const winWidth = window.innerWidth;
const winHeight = window.innerHeight;
const itemHeight = 34;
var objTimeArr = [];
var touchCurItem = null;
var touchMoveY = null;
var touchMoveTime = null;
var touchEndTime = null;
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

            containerBounding: {//time-item的范围
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                width: 0,
                height: 0,
            },
            moveY: 0, //move过程中的transform-y的值
            inertiaYear: false,//年份惯性状态
            inertiaMonth: false,//月份惯性状态
            inertiaDate: false,//日期惯性状态
            inertiaHour: false,//小时惯性状态
            inertiaMinute: false,//分钟惯性状态
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
        //初始化外层容器的bouding
        var containerRect = this.refs.yearItemMask.parentNode.getBoundingClientRect();
        that.setState({
            containerBounding: {
                left: containerRect.left,
                right: containerRect.right,
                top: containerRect.top,
                bottom: containerRect.bottom,
                width: containerRect.width,
                height: containerRect.height,
            }
        });
        //new年模块
        var options = {
            startNum: 2010,
            endNum: 2020,
            unit: '年',
            touchStartCallback: function(item) {
                touchCurItem = item;
            }
        }
        var yearObj = new TimeItem(that.refs.yearItemMask, options);
        yearObj.init(that.state.year);
        objTimeArr.push(yearObj);
        //new月模块
        options = {
            startNum: 1,
            endNum: 12,
            unit: '月',
            touchStartCallback: function(item) {
                touchCurItem = item;
            }
        }
        var monthObj = new TimeItem(that.refs.monthItemMask, options);
        monthObj.init(that.state.month);
        objTimeArr.push(monthObj);
        //new日模块
        options = {
            startNum: 1,
            endNum: getDateNumByMonthYear(that.state.year, that.state.month),
            unit: '日',
            touchStartCallback: function(item) {
                touchCurItem = item;
            }
        }
        var dateObj = new TimeItem(that.refs.dateItemMask, options);
        dateObj.init(that.state.date);
        objTimeArr.push(dateObj);
        //new小时模块
        options = {
            startNum: 0,
            endNum: 23,
            unit: '时',
            touchStartCallback: function(item) {
                touchCurItem = item;
            }
        }
        var hourObj = new TimeItem(that.refs.hourItemMask, options);
        hourObj.init(that.state.hour);
        objTimeArr.push(hourObj);
        //new分钟模块
        options = {
            startNum: 0,
            endNum: 59,
            unit: '分',
        }
        var minuteObj = new TimeItem(that.refs.minuteItemMask, options);
        minuteObj.init(that.state.minute);
        objTimeArr.push(minuteObj);

        document.addEventListener('touchmove', function(event) {
            if(touchCurItem == null) {
                return;
            }
            
            event.preventDefault();
            var evt = event.touches[0] || event;
            
            touchMoveY = evt.pageY;
            touchMoveTime = +new Date();
            
            var moveY = evt.pageY - touchCurItem.getTouchStartY();
            var tempY = touchCurItem.getMoveY() + moveY;

            if(tempY > itemHeight * 6) {
                tempY = itemHeight * 6;
            }
            if(tempY < -(touchCurItem.getObjBounding().height - itemHeight) ) {
                tempY = -(touchCurItem.getObjBounding().height - itemHeight);
            }
            touchCurItem.moveElement(0, tempY);
        });
        
        document.addEventListener('touchend', function(event) {
            if(touchCurItem == null) {
                return;
            }
            touchCurItem = null;
            event.preventDefault();
            var evt = event.touches[0] || event;
            touchEndTime = +new Date();
            touchCurItem.setMoveY();
            touchCurItem.setInertia(true);

            that.inBox();
            //最后一次touchMoveTime和touchEndTime之间超过30ms,意味着停留了长时间,不做滑动
            if(that.state.touchEndTime - that.state.touchMoveTime > 30) {
                return;
            }
            var moveY = that.state.touchMoveY - that.state.touchStartY; //矢量有+-
            var time = that.state.touchEndTime - that.state.touchStartTime;
            var speed = moveY / time * 16.666; //矢量有+-
            var rate = Math.min(10, Math.abs(speed)); //加速度a

            that.slide(that.state.curItem, speed, rate);
        });

        //初始化时间
        var time = this.state.year + '-' + this.addZero(this.state.month) + '-' + this.addZero(this.state.date) + ' ' + this.addZero(this.state.hour) + ':' + this.addZero(this.state.minute) + ':' + '00';
        this.setState({
            ansTime: time,
        });
	}
    slide(ele, speed, rate) {
        var that = this;
        var type = ele.getAttribute('data-type');
        if (that.state.touching && type == that.state.curType) {
            if(type == 'year') {
                that.setState({
                    inertiaYear: false,
                });
            }
            else if(type == 'month') {
                that.setState({
                    inertiaMonth: false,
                });
            }
            else if(type == 'date') {
                that.setState({
                    inertiaDate: false,
                });
            }
            else if(type == 'hour') {
                that.setState({
                    inertiaHour: false,
                });
            }
            else if(type == 'minute') {
                that.setState({
                    inertiaMinute: false,
                });
            }
            return;
        }
        
        if(type == 'year' && !that.state.inertiaYear) {
            return;
        }
        else if(type == 'month' && !that.state.inertiaMonth) {
            return;
        }
        else if(type == 'date' && !that.state.inertiaDate) {
            return;
        }
        else if(type == 'hour' && !that.state.inertiaHour) {
            return;
        }
        else if(type == 'minute' && !that.state.inertiaMinute) {
            return;
        }
        speed = speed - speed / rate;

        if(type == 'year') {
            var y = that.state.moveYYear + speed;
            that.moveElement(ele, 0, y);
            that.setState({
                moveYYear: y,
            });
        }
        else if(type == 'month') {
            var y = that.state.moveYMonth + speed;
            that.moveElement(ele, 0, y);
            that.setState({
                moveYMonth: y,
            });
        }
        else if(type == 'date') {
            var y = that.state.moveYDate + speed;
            that.moveElement(ele, 0, y);
            that.setState({
                moveYDate: y,
            });
        }
        else if(type == 'hour') {
            var y = that.state.moveYHour + speed;
            that.moveElement(ele, 0, y);
            that.setState({
                moveYHour: y,
            });
        }
        else if(type == 'minute') {
            var y = that.state.moveYMinute + speed;
            that.moveElement(ele, 0, y);
            that.setState({
                moveYMinute: y,
            });
        }

        if (Math.abs(speed) < 0.5) {
            speed = 0;
            if(type == 'year') {
                that.setState({
                    inertiaYear: false,
                });
            }
            else if(type == 'month') {
                that.setState({
                    inertiaMonth: false,
                });
            }
            else if(type == 'date') {
                that.setState({
                    inertiaDate: false,
                });
            }
            else if(type == 'hour') {
                that.setState({
                    inertiaHour: false,
                });
            }
            else if(type == 'minute') {
                that.setState({
                    inertiaMinute: false,
                });
            }
            that.inBox(ele);
        } else {
            requestAnimationFrame(function() {
                that.slide(ele, speed, rate);
            });
        }
    }
    inBox(ele) {
        var that = this;
        var maxY = 3 * itemHeight;
        var minY = -(that.state.objBounding.height - 4 * itemHeight);
        var moveY = 0; //delta变化量
        var y = 0;
        var type = ele.getAttribute('data-type');
        if(type == 'year') {
            y = that.state.moveYYear;
        }
        else if(type == 'month') {
            y = that.state.moveYMonth;
        }
        else if(type == 'date') {
            y = that.state.moveYDate;
        }
        else if(type == 'hour') {
            y = that.state.moveYHour;
        }
        else if(type == 'minute') {
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
            if(type == 'year') {
                that.setState({
                    inertiaYear: false,
                });
            }
            else if(type == 'month') {
                that.setState({
                    inertiaMonth: false,
                });
            }
            else if(type == 'date') {
                that.setState({
                    inertiaDate: false,
                });
            }
            else if(type == 'hour') {
                that.setState({
                    inertiaHour: false,
                });
            }
            else if(type == 'minute') {
                that.setState({
                    inertiaMinute: false,
                });
            }
            that.calTime(init, ele);
            return;
        }

        that.adjust(ele, start, init, moveY, during);
    }
    adjust(ele, start, init, moveY, during) {
        var that = this;
        var type = ele.getAttribute('data-type');
        if (that.state.touching && type == that.state.curType) {
            if(type == 'year') {
                that.setState({
                    inertiaYear: false,
                });
            }
            else if(type == 'month') {
                that.setState({
                    inertiaMonth: false,
                });
            }
            else if(type == 'date') {
                that.setState({
                    inertiaDate: false,
                });
            }
            else if(type == 'hour') {
                that.setState({
                    inertiaHour: false,
                });
            }
            else if(type == 'minute') {
                that.setState({
                    inertiaMinute: false,
                });
            }
            return;
        }

        start++;
        var y = that.easeOutQuad(start, init, moveY, during);
        that.moveElement(ele, 0, y);
        if(type == 'year') {
            that.setState({
                moveYYear: y,
            });
        }
        else if(type == 'month') {
            that.setState({
                moveYMonth: y,
            });
        }
        else if(type == 'date') {
            that.setState({
                moveYDate: y,
            });
        }
        else if(type == 'hour') {
            that.setState({
                moveYHour: y,
            });
        }
        else if(type == 'minute') {
            that.setState({
                moveYMinute: y,
            });
        }

        if (start < during) {
            requestAnimationFrame(function() {
                that.adjust(ele, start, init, moveY, during);
            });
        } else {
            if(type == 'year') {
                that.setState({
                    inertiaYear: false,
                });
            }
            else if(type == 'month') {
                that.setState({
                    inertiaMonth: false,
                });
            }
            else if(type == 'date') {
                that.setState({
                    inertiaDate: false,
                });
            }
            else if(type == 'hour') {
                that.setState({
                    inertiaHour: false,
                });
            }
            else if(type == 'minute') {
                that.setState({
                    inertiaMinute: false,
                });
            }

            that.calTime(y, ele);
        }
    }
    calTime(y, ele) {
        var type = ele.getAttribute('data-type');
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
        var time = this.state.year + '-' + this.addZero(this.state.month) + '-' + this.addZero(this.state.date) + ' ' + this.addZero(this.state.hour) + ':' + this.addZero(this.state.minute) + ':' + '00';
        console.log(time);
        this.setState({
            ansTime: time,
        });
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