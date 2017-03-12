import React, { Component } from 'react';
import { TimeItem } from './TimeItem';
import { getDateNumByMonthYear, addZero } from './Util';
import './main.css';

const winWidth = window.innerWidth;
const winHeight = window.innerHeight;
const itemHeight = 34;
var objTimeArr = [];
var touchCurItem = null;
var touchMoveY = null;//记录每一帧touchMove的y坐标
var touchMoveTime = null;//每帧touchMove事件的时间戳
var touchEndTime = null;//记录touchend的时间戳
var year = 0, month = 0, date = 0, hour = 0, minute = 0;
var ansTime = '';//当前时间字符串 2017-03-08 09:00
export default class TimePicker extends Component {
	constructor(props) {
		super(props);
		this.state = {
            containerBounding: {//time-item的范围
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                width: 0,
                height: 0,
            },
		};
	}

    componentWillMount() {
        var d = new Date();
        year = this.props.year || d.getFullYear();
        month = this.props.month || d.getMonth() + 1;
        date = this.props.date || d.getDate();
        hour = this.props.hour || d.getHours();
        minute = this.props.minute || d.getMinutes();
        this.setAnsTime();
    }
	componentDidMount() {
        var that = this;
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
            },
            calTimeCallback: function(val) {
                year = val;
                that.calTimeCallback();
            },
        }
        var yearObj = new TimeItem(that.refs.yearItemMask, options);
        yearObj.init(year);
        objTimeArr.push(yearObj);
        //new月模块
        options = {
            startNum: 1,
            endNum: 12,
            unit: '月',
            touchStartCallback: function(item) {
                touchCurItem = item;
            },
            calTimeCallback: function(val) {
                month = val;
                that.calTimeCallback();
            },
        }
        var monthObj = new TimeItem(that.refs.monthItemMask, options);
        monthObj.init(month);
        objTimeArr.push(monthObj);
        //new日模块
        options = {
            startNum: 1,
            endNum: getDateNumByMonthYear(year, month),
            unit: '日',
            touchStartCallback: function(item) {
                touchCurItem = item;
            },
            calTimeCallback: function(val) {
                date = val;
                that.setAnsTime();
            },
        }
        var dateObj = new TimeItem(that.refs.dateItemMask, options);
        dateObj.init(date);
        objTimeArr.push(dateObj);
        //new小时模块
        options = {
            startNum: 0,
            endNum: 23,
            unit: '时',
            touchStartCallback: function(item) {
                touchCurItem = item;
            },
            calTimeCallback: function(val) {
                hour = val;
                that.setAnsTime();
            },
        }
        var hourObj = new TimeItem(that.refs.hourItemMask, options);
        hourObj.init(hour);
        objTimeArr.push(hourObj);
        //new分钟模块
        options = {
            startNum: 0,
            endNum: 59,
            unit: '分',
            touchStartCallback: function(item) {
                touchCurItem = item;
            },
            calTimeCallback: function(val) {
                minute = val;
                that.setAnsTime();
            },
        }
        var minuteObj = new TimeItem(that.refs.minuteItemMask, options);
        minuteObj.init(minute);
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

            touchCurItem.inBox();
            //最后一次touchMoveTime和touchEndTime之间超过30ms,意味着停留了长时间,不做滑动
            if(touchEndTime - touchMoveTime > 30) {
                return;
            }
            var moveY = touchMoveY - touchCurItem.getTouchStartY(); //矢量有+-
            var time = touchEndTime - touchCurItem.getTouchStartTime();
            var speed = moveY / time * 16.666; //矢量有+-
            var rate = Math.min(10, Math.abs(speed)); //加速度a

            touchCurItem.slide(speed, rate);
        });
	}
    calTimeCallback() {
        if(month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
            objTimeArr[2].setTimeCount(31);
        }
        else if(month == 4 || month == 6 || month == 9 || month == 11) {
            objTimeArr[2].setTimeCount(30);
            if(date > 30) {
                objTimeArr[2].setTimeVal(30);
                objTimeArr[2].setTranslate();
            }
        }
        else if(month == 2){
            if( (year % 4 == 0) && (year % 100 != 0) || (year % 400 == 0) ) {
                objTimeArr[2].setTimeCount(29);
                if(date > 29) {
                    objTimeArr[2].setTimeVal(29);
                    objTimeArr[2].setTranslate();
                }
            }
            else {
                objTimeArr[2].setTimeCount(28);
                if(date > 28) {
                    objTimeArr[2].setTimeVal(28);
                    objTimeArr[2].setTranslate();
                }
            }
        }    
        this.setAnsTime();
    }
    setAnsTime() {
        var time = year + '-' + addZero(month) + '-' + addZero(date) + ' ' + addZero(hour) + ':' + addZero(minute) + ':' + '00';
        console.log(time);
        ansTime = time;
    }

    okHandler() {
        this.props.okHandler(ansTime);
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