import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import parseInput from './utils/parseInput.js';
import Calendar from './Calendar.js';
import PredefinedRanges from './PredefinedRanges.js';
import getTheme, { defaultClasses } from './styles.js';


class DateRange extends Component {

  constructor(props, context) {
    super(props, context);

    const { format, linkedCalendars, theme } = props;

    const startDate = parseInput(props.startDate, format, 'startOf');
    const endDate   = parseInput(props.endDate, format, 'endOf');

    this.onCalendarLeavedHandler = this.onCalendarLeaved.bind(this);

    this.dayCellHoveredHandler = this.dayCellHovered.bind(this);

    this.state = {
      range         : { startDate, endDate },
      link          : linkedCalendars && endDate,
      isRangeFixed  : startDate && endDate ? true : false,
      isStartDateChanging: false,
      isEndDateChanging: false
    }

    this.step = 0;
    this.styles = getTheme(theme);
  }

  componentDidMount() {
    const { onInit } = this.props;
    onInit && onInit(this.state.range);
  }

  orderRange(range) {
    const { startDate, endDate } = range;
    const swap = startDate.isAfter(endDate);

    if (!swap) return range;

    return {
      startDate : endDate,
      endDate   : startDate
    }
  }

  setRange(range, source, triggerChange, additionalData = null) {
    const { onChange } = this.props
    range = this.orderRange(range);
    
    let newState = {
      range
    };

    if (additionalData) {
      Object.keys(additionalData).forEach(key => newState[key] = additionalData[key])
    }
    this.setState(newState, () => triggerChange && onChange && onChange(range, source));
  }

  onCalendarLeaved(evt) {
    if (evt.target.className.split(' ').indexOf('rdr-Day') !== -1)  {
      // yes className
      console.log('mouseenter');
      this.calendarLeaved = true;
    } else {
      // no className
      console.log('mouseleave')
    }
  }

  handleSelect(date, source) {
    
    if (date.startDate && date.endDate) {
      this.step = 0;
      return this.setRange(date, source, true, {
        isRangeFixed: !isRangeFixed,
      });
    }

    const { startDate, endDate } = this.state.range;
    const { isRangeFixed } = this.state;
    const range = {
      startDate,
      endDate,
    };
    switch (this.step) {
      case 0:
        range['startDate'] = date;
        range['endDate'] = date;
        this.step = 1;
        break;

      case 1:
        range['endDate'] = date;
        this.step = 0;
        break;
    }
    const triggerChange  = !this.props.twoStepChange || this.step === 0 && this.props.twoStepChange;
    
    this.setRange(range, source, triggerChange, {
      isRangeFixed: !isRangeFixed,
    });
  }

  handleLinkChange(direction) {
    const { link } = this.state;

    this.setState({
      link : link.clone().add(direction, 'months')
    });
  }

  componentWillReceiveProps(newProps) {
    // Whenever date props changes, update state with parsed variant
    if (newProps.startDate || newProps.endDate) {
      const format       = newProps.format || this.props.format;
      const startDate    = newProps.startDate   && parseInput(newProps.startDate, format, 'startOf');
      const endDate      = newProps.endDate     && parseInput(newProps.endDate, format, 'endOf');
      const oldStartDate = this.props.startDate && parseInput(this.props.startDate, format, 'startOf');
      const oldEndDate   = this.props.endDate   && parseInput(this.props.endDate, format, 'endOf');

      if (!startDate.isSame(oldStartDate) || !endDate.isSame(oldEndDate)) {
        this.setRange({
          startDate: startDate || oldStartDate,
          endDate: endDate || oldEndDate
        });
      }
    }
  }

  dayCellHovered(dayMoment, startDate, endDate) {
    const { isRangeFixed, isEndDateChanging, isStartDateChanging } = this.state;
    if ( !isRangeFixed ) {
      if ( !(dayMoment.isSame(startDate, 'day') || dayMoment.isSame(endDate, 'day')) ) {
        // dates not the same
        if (dayMoment.isAfter(endDate)) {
          // date after end of date range, means user moves right,
          let range = {
            startDate,
            endDate: dayMoment
          }
          if ( isStartDateChanging ) {
            range.startDate = endDate,
            range.endDate = dayMoment
          }
          return this.setRange(range, false, true, {
            isEndDateChanging: true,
            isStartDateChanging: false
          })
        }
        if (dayMoment.isBetween(startDate, endDate, 'day')) {
          let range = {}
          if ( isEndDateChanging ) {
            range.endDate = dayMoment;
            range.startDate = startDate;
          } else {
            range.startDate = dayMoment;
            range.endDate = endDate;
          }

          return this.setRange(range, false, true);
        }

        if (dayMoment.isBefore(startDate)) {
          // date before start date, means user moves left
          let range = {
            endDate,
            startDate: dayMoment
          };

          if ( isEndDateChanging ) {
            range.startDate = startDate;
            range.endDate = dayMoment;
          }

          return this.setRange(range, false, true, {
            isStartDateChanging: true,
            isEndDateChanging: false
          });
        }
      } else {
        return this.setRange({ startDate: dayMoment, endDate:dayMoment }, false, true);
      }
    }
  }

  render() {
    const { ranges, format, linkedCalendars, style, calendars, firstDayOfWeek, minDate, maxDate, classNames, onlyClasses, specialDays, lang, disableDaysBeforeToday, offsetPositive, shownDate, showMonthArrow, rangedCalendars, Arrow } = this.props;
    const { range, link, isRangeFixed } = this.state;
    const { styles } = this;

    const classes = { ...defaultClasses, ...classNames };
    const yearsDiff = range.endDate.year() - range.startDate.year();
    const monthsDiff = range.endDate.month() - range.startDate.month();
    const diff = yearsDiff * 12 + monthsDiff;
    const calendarsCount = Number(calendars) - 1;

    return (
      <div style={onlyClasses ? undefined : { ...styles['DateRange'], ...style }} className={classes.dateRange}>
        { ranges && (
          <PredefinedRanges
            format={ format }
            ranges={ ranges }
            range={ range }
            theme={ styles }
            onSelect={this.handleSelect.bind(this)}
            onlyClasses={ onlyClasses }
            classNames={ classes } />
        )}

        {(()=>{
          const _calendars = [];
          const _method = offsetPositive ? 'unshift' : 'push';
          for (var i = calendarsCount; i >= 0; i--) {
            const offset = offsetPositive ? i : -i;
            const realDiff = offsetPositive ? diff : -diff;
            const realOffset = (rangedCalendars && i == calendarsCount && diff != 0) ? realDiff : offset;

            _calendars[_method](
              <Calendar
                showMonthArrow={ showMonthArrow }
                shownDate={ shownDate }
                disableDaysBeforeToday={ disableDaysBeforeToday }
                lang={ lang }
                key={i}
                offset={ realOffset }
                link={ linkedCalendars && link }
                linkCB={ this.handleLinkChange.bind(this) }
                range={ range }
                format={ format }
                firstDayOfWeek={ firstDayOfWeek }
                theme={ styles }
                minDate={ minDate }
                maxDate={ maxDate }
		            onlyClasses={ onlyClasses }
		            specialDays={ specialDays }
                classNames={ classes }
                onChange={ isRangeFixed ? this.handleSelect.bind(this) : () => this.handleSelect.bind(this)(range) }  
                Arrow={Arrow}
                onDayCellHover={ this.dayCellHoveredHandler }
                onCalendarOver={ this.onCalendarLeavedHandler }
              />
            );
          }
          return _calendars;
        })()}
      </div>
    );
  }
}

DateRange.defaultProps = {
  linkedCalendars : false,
  theme           : {},
  format          : 'DD/MM/YYYY',
  calendars       : 2,
  onlyClasses     : false,
  offsetPositive  : false,
  classNames      : {},
  specialDays     : [],
  rangedCalendars : false,
  twoStepChange   : false,
  firstDayOfWeek  : 1,
  initialDate    : moment().add(1, 'days')
}

DateRange.propTypes = {
  format          : PropTypes.string,
  firstDayOfWeek  : PropTypes.number,
  calendars       : PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  startDate       : PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  endDate         : PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  minDate         : PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  maxDate         : PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  dateLimit       : PropTypes.func,
  ranges          : PropTypes.object,
  linkedCalendars : PropTypes.bool,
  twoStepChange   : PropTypes.bool,
  theme           : PropTypes.object,
  onInit          : PropTypes.func,
  onChange        : PropTypes.func,
  onlyClasses     : PropTypes.bool,
  specialDays     : PropTypes.array,
  offsetPositive  : PropTypes.bool,
  classNames      : PropTypes.object,
  rangedCalendars : PropTypes.bool,
  Arrow       : PropTypes.func
}

export default DateRange;
