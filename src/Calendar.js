import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import parseInput from './utils/parseInput.js';
import DayCell from './DayCell.js';
import LangDic from './LangDic.js';
import getTheme, { defaultClasses } from './styles.js';


function checkRange(dayMoment, range) {
  // a bit bugged as for me
  return (
    dayMoment.isBetween(range['startDate'], range['endDate']) ||
    dayMoment.isBetween(range['endDate'], range['startDate']) ||
    dayMoment.isSame(range['endDate'], 'day') ||
    dayMoment.isSame(range['startDate'], 'day')
  )
}

const RightArrow = (props) => {

  const { onClick } = props;

  const defaultStyles = {
    display: 'inline-block',
    fill: 'none',
    stroke: '#293355',
    strokeLinejoin: 'round',
    strokeWidth: '1px',
    fillRule: 'evenodd'
  }

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      width="4.87"
      height="18"
      viewBox="0 0 4.87 8.375"
      onClick={onClick}
      style={{float:'right', cursor: 'pointer'}}
      >
        <path 
          style={defaultStyles}
          d="M1124.75,406.313l4.2-3.814-4.2-3.815"
          transform="translate(-1124.41 -398.313)"
        />
    </svg>
  )
}

const LeftArrow = ( props ) => {

  const defaultStyles = {
    display: 'inline-block',
    fill: 'none',
    stroke: '#293355',
    strokeLinejoin: 'round',
    strokeWidth: '1px',
    fillRule: 'evenodd'
  }

  return (
  <svg 
    onClick={props.onClick}
    style={{ float: 'left', cursor: 'pointer' }}
    xmlns="http://www.w3.org/2000/svg"
    width="4.969"
    height="18"
    viewBox="0 0 4.969 8.062">
      <path 
        style={defaultStyles}
        d="M933.642,399.354l-4.3,3.644,4.3,3.644"
        transform="translate(-929 -398.969)"
      />
  </svg>
  )
}


function checkWeekend(dayMoment) {
  let isWeekend = false;

  if (dayMoment.day() === 0 || dayMoment.day() === 6) {
    isWeekend = true;
  }
  return isWeekend;
}

function checkStartEdge(dayMoment, range) {
  const { startDate } = range;

  return dayMoment.startOf('day').isSame(startDate.startOf('day'));
}

function checkEndEdge(dayMoment, range) {
  const { endDate } = range;

  return dayMoment.endOf('day').isSame(endDate.endOf('day'));
}

function isOusideMinMax(dayMoment, minDate, maxDate, format) {
  return (
    (minDate && dayMoment.isBefore(parseInput(minDate, format, 'startOf'))) ||
    (maxDate && dayMoment.isAfter(parseInput(maxDate, format, 'endOf')))
  )
}

class Calendar extends Component {

  constructor(props, context) {
    super(props, context);

    const { format, range, theme, offset, firstDayOfWeek, locale, shownDate, isRangeError, isOpen } = props;
    if(locale) {
      moment.locale(locale);
    }

    const date = parseInput(props.date, format, 'startOf')
    
    const state = {
      date,
      shownDate : (shownDate || range && range['endDate'] || date).clone().add(offset, 'months'),
      firstDayOfWeek: (firstDayOfWeek || moment.localeData().firstDayOfWeek()),
      isRangeError,
      isOpen
    }

    this.state  = state;
    this.styles = getTheme(theme);
  }

  componentDidMount() {
    const { onInit } = this.props;
    onInit && onInit(this.state.date);
  }

  componentWillReceiveProps(nextProps) {
    const { isOpen:oldOpen }                        = this.props;
    const { range, offset, isRangeError, isOpen }   = nextProps;
    const oldRange                                  = this.props.oldRange;

    if (!oldOpen) {
      return this.setState({ shownDate: range['startDate'], isOpen})
    }

    if ((range && range['endDate'] && !range['endDate'].isSame(range['startDate'], "day")) || (oldRange && !oldRange["startDate"].isSame(range["startDate"]))) {
      const { isEndDateChanging, isStartDateChanging } = this.props;
      
      if ( isEndDateChanging || (!isEndDateChanging && !isStartDateChanging) ) {
        return this.setState({ shownDate : range['endDate'].clone().add(offset, 'months'), isRangeError, isOpen }) 
      } 
      if ( isStartDateChanging ) {
        return this.setState({ shownDate : range['startDate'].clone().add(offset, 'months'), isRangeError, isOpen }) 
      }
    }
  }

  getShownDate() {
    const { link, offset } = this.props;
    const shownDate = (link) ? link.clone().add(offset, 'months') : this.state.shownDate;

    return shownDate;
  }

  handleSelect(newDate) {
    const { link, onChange } = this.props;
    const { date } = this.state;

    onChange && onChange(newDate, Calendar);
    if (!link) {
      this.setState({ date : newDate });
    }
  }

  changeMonth(direction, event) {
    event.preventDefault();
    const { link, linkCB } = this.props;

    if (link && linkCB) {
      return linkCB(direction);
    }

    const current  = this.state.shownDate.month();
    const newMonth = this.state.shownDate.clone().add(direction, 'months');

    this.setState({
      shownDate : newMonth,
      isRangeError: false
    });
  }

  renderMonthAndYear(classes) {
    const shownDate       = this.getShownDate();
    let month             = moment.months(shownDate.month());
    const year            = shownDate.year();
    const { styles }      = this;
    const { onlyClasses, lang, showMonthArrow, initialDate, maxDate } = this.props;
    
    let monthLower = month.toLowerCase()
    month = (lang && LangDic[lang] && LangDic[lang][monthLower]) ? LangDic[lang][monthLower] : month;

    return (
      <div style={onlyClasses ? undefined : styles['MonthAndYear']} className={classes.monthAndYearWrapper}>
        {
          showMonthArrow && shownDate.isAfter(initialDate, 'month') ?
          <LeftArrow 
            onClick={this.changeMonth.bind(this, -1)}
          />
          : null
        }
        <span>
          <span className={classes.month}>{month}</span>
          <span className={classes.monthAndYearDivider}>{' '}</span>
          <span className={classes.year}>{year}</span>
        </span>
        {
          showMonthArrow && shownDate.isBefore(maxDate, 'month') ?
          <RightArrow 
            onClick={this.changeMonth.bind(this, +1)}
          /> 
          : null
        }
      </div>
    )
  }

  renderWeekdays(classes) {
    const dow             = this.state.firstDayOfWeek;
    const weekdays        = [];
    const { styles }      = this;
    const { onlyClasses, lang } = this.props;

    for (let i = dow; i < 7 + dow; i++) {
      let day = moment.weekdaysMin(i);
      let dayLower = day.toLowerCase();
      day = (lang && LangDic[lang] && LangDic[lang][dayLower]) ? LangDic[lang][dayLower] : day;
      weekdays.push(
        <span style={onlyClasses ? undefined : styles['Weekday']} className={classes.weekDay} key={i + day}>{day}</span>
      );
    }

    return weekdays;
  }

  renderDays(classes) {
    // TODO: Split this logic into smaller chunks
    const { styles }               = this;

    const { 
      range,
      minDate,
      maxDate,
      format,
      onlyClasses,
      disableDaysBeforeToday,
      specialDays,
      initialDate,
      onDayCellHover,
    } = this.props;
    
    const shownDate                = this.getShownDate();
    const { date, firstDayOfWeek } = this.state;
    const dateUnix                 = date.unix();

    const monthNumber              = shownDate.month();
    const dayCount                 = shownDate.daysInMonth();
    const startOfMonth             = shownDate.clone().startOf('month').isoWeekday();

    const lastMonth                = shownDate.clone().month(monthNumber - 1);
    const lastMonthNumber          = lastMonth.month();
    const lastMonthDayCount        = lastMonth.daysInMonth();

    const nextMonth                = shownDate.clone().month(monthNumber + 1);
    const nextMonthNumber          = nextMonth.month();

    const days                     = [];

    // Previous month's days
    const diff = (Math.abs(firstDayOfWeek - (startOfMonth + 7)) % 7);
    for (let i = diff-1; i >= 0; i--) {
      const dayMoment  = lastMonth.clone().date(lastMonthDayCount - i);
      days.push({ dayMoment, isPassive : true });
    }

    // Current month's days
    for (let i = 1; i <= dayCount; i++) {
      const dayMoment  = shownDate.clone().date(i);
      // set days before today to isPassive
      var _today = moment()
      if (disableDaysBeforeToday && Number(dayMoment.diff(_today,"days")) <= -1) {
        days.push({ dayMoment, isPassive:true});
      } else {
        days.push({ dayMoment });
      }
    }

    // Next month's days
    const remainingCells = 42 - days.length; // 42cells = 7days * 6rows
    for (let i = 1; i <= remainingCells; i++ ) {
      const dayMoment  = nextMonth.clone().date(i);
      days.push({ dayMoment, isPassive : true });
    }
    const today = moment().startOf('day');

    return days.map((data, index) => {
      const { dayMoment, isPassive } = data;
      const isSelected      = !range && (dayMoment.unix() === dateUnix);
      const isInRange       = range && checkRange(dayMoment, range);
      const isStartEdge     = range && checkStartEdge(dayMoment, range);
      const isEndEdge       = range && checkEndEdge(dayMoment, range);
      const isEdge          = isStartEdge || isEndEdge;
      const isToday         = today.isSame(dayMoment);
      const isWeekend       = checkWeekend(dayMoment);
      const isSunday        = dayMoment.day() === 0;
      const isSpecialDay    = specialDays && specialDays.some((specialDay) => {
        return dayMoment.endOf('day').isSame(specialDay.date.endOf('day'));
      });
      
      const isOutsideMinMax = isOusideMinMax(dayMoment, minDate, maxDate, format);
      
      return (
        <DayCell
          isDisabled={ !dayMoment.isAfter(initialDate, 'day') }
          onSelect={ this.handleSelect.bind(this) }
          { ...range }
          { ...data }
          theme={ styles }
          isStartEdge = { isStartEdge }
          isEndEdge = { isEndEdge }
          isSelected={ isSelected || isEdge }
          isInRange={ isInRange }
          isWeekend={ isWeekend }
          isSunday={ isSunday }
          isSpecialDay={ isSpecialDay }
          isToday={ isToday }
          key={`${dayMoment.dayOfYear()}`}
          isPassive = { isPassive || isOutsideMinMax }
          onlyClasses = { onlyClasses }
          classNames = { classes }
          onDayCellHover = { onDayCellHover }
        />
      );
    })
  }

  render() {
    const { styles } = this;
    const { onlyClasses, classNames, onCalendarOver, maxRange } = this.props;
    const { isRangeError } = this.state;
    const classes = { ...defaultClasses, ...classNames };

    return (
      <div 
        style={ onlyClasses ? undefined : { ...styles['Calendar'], ...this.props.style } }
        className={ classes.calendar }
        onMouseOver={ onCalendarOver }
      >
        <div className={classes.monthAndYear}>{ this.renderMonthAndYear(classes) }</div>
        <div className={classes.weekDays}>{ this.renderWeekdays(classes) }</div>
        <div 
          className={classes.days}
        >
          { this.renderDays(classes) }
        </div>
        {isRangeError &&
        <div
          style={ styles['RangeError'] }
        >
          Внимание! Максимально допустимый
          диапазон дат вылета — { maxRange + 1 } дней
        </div>
        }
      </div>
    )
  }
}

Calendar.defaultProps = {
  format      : 'DD/MM/YYYY',
  theme       : {},
  showMonthArrow: true,
  disableDaysBeforeToday: false,
  onlyClasses : false,
  classNames  : {},
  specialDays : [],
}

Calendar.propTypes = {
  showMonthArrow : PropTypes.bool,
  disableDaysBeforeToday : PropTypes.bool,
  lang           : PropTypes.string,
  sets           : PropTypes.string,
  range          : PropTypes.shape({
    startDate    : PropTypes.object,
    endDate      : PropTypes.object
  }),
  minDate        : PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  maxDate        : PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  date           : PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.func]),
  format         : PropTypes.string.isRequired,
  firstDayOfWeek : PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange       : PropTypes.func,
  onInit         : PropTypes.func,
  link           : PropTypes.oneOfType([PropTypes.shape({
    startDate    : PropTypes.object,
    endDate      : PropTypes.object,
  }), PropTypes.bool]),
  linkCB         : PropTypes.func,
  theme          : PropTypes.object,
  onlyClasses    : PropTypes.bool,
  specialDays    : PropTypes.array,
  classNames     : PropTypes.object,
  locale         : PropTypes.string
}

export default Calendar;
