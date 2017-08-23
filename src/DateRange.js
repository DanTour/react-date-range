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

    this.dayCellHoveredHandler = this.dayCellHovered.bind(this);

    this.state = {
      range         : { startDate, endDate },
      link          : linkedCalendars && endDate,
      isRangeFixed  : startDate && endDate ? true : false,
      isStartDateChanging: false,
      isEndDateChanging: false,
      lastDateFixed: null,
      israngeError: false
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

  handleSelect(boundedRange, date, source) {
    const { isRangeFixed } = this.state;
    if ( !isRangeFixed ) {
      this.step = 0;
      const { isStartDateChanging, isEndDateChanging } = this.state;
      const { maxRange } = this.props;
      let isError = false;
      if (isStartDateChanging && !this.isInRange(date, boundedRange.startDate, boundedRange.endDate)) {
        boundedRange['startDate'] = boundedRange.endDate.clone().add(-maxRange, 'days');
        isError = true;
      }

      if (isEndDateChanging && !this.isInRange(date, boundedRange.startDate, boundedRange.endDate)) {
        boundedRange['endDate'] = boundedRange.startDate.clone().add(+maxRange, 'days');
        isError = true;
      }

      return this.setRange(boundedRange, source, true, {
        isRangeFixed: !isRangeFixed,
        isRangeError: isError
      });
    }

    date = boundedRange;

    const { startDate, endDate } = this.state.range;
    
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
      lastDateFixed: date,
      isRangeError: false
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

  isInRange(dayMoment, startDate, endDate) {
    const { maxRange } = this.props;
    return Math.abs(dayMoment.diff(startDate, 'days')) <= maxRange && 
           Math.abs(dayMoment.diff(endDate, 'days')) <= maxRange;
  }

  dayCellHovered(dayMoment, startDate, endDate) {
    const { 
      isRangeFixed,
      isEndDateChanging,
      isStartDateChanging,
      lastDateFixed,
    } = this.state;

    const { maxRange } = this.props;
    
    const isInMaxRange = this.isInRange(dayMoment, startDate, endDate);

    if (!isInMaxRange && !isRangeFixed) {
      const range = {};

      if (isStartDateChanging) {
        range.startDate = endDate.clone().add(-maxRange, 'days');
        range.endDate = endDate;
        if (dayMoment.month() === range.startDate.month()) {
          return this.setRange(range, false, true)
        } else {
          return
        }
      }

      if (isEndDateChanging) {
        range.startDate = startDate;
        range.endDate = startDate.clone().add(+maxRange, 'days');

        if (dayMoment.month() === range.endDate.month() ) {
          return this.setRange(range, false, true)
        } else {
          return
        }
      }

      return this.setRange(range, false, true);
    }
    
    if ( !isRangeFixed && isInMaxRange) {
      if ( !(dayMoment.isSame(startDate, 'day') || dayMoment.isSame(endDate, 'day')) ) {
        // dates not the same
        if (dayMoment.isAfter(endDate)) {
          // date after end of date range, means user moves right
          const range = {
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
          const range = {}
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
          const range = {
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
        if ( isEndDateChanging ) {
          this.setRange({ startDate: lastDateFixed, endDate: dayMoment }, false, true)
        } else {
          this.setRange({ startDate: dayMoment, endDate: lastDateFixed }, false, true)
        }
      }
    }
  }

  render() {
    const { ranges, format, linkedCalendars, style, calendars, firstDayOfWeek, minDate, maxDate, classNames, onlyClasses, specialDays, lang, disableDaysBeforeToday, offsetPositive, shownDate, showMonthArrow, rangedCalendars, Arrow, maxRange } = this.props;
    const { range, link, isRangeFixed, isEndDateChanging, isRangeError } = this.state;
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

        {(() => {
          const _calendars = [];
          const _method = offsetPositive ? 'unshift' : 'push';
          for (let i = calendarsCount; i >= 0; i--) {
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
                onChange={ isRangeFixed ? this.handleSelect.bind(this) : this.handleSelect.bind(this, range) }  
                Arrow={Arrow}
                isEndDateChanging={ isEndDateChanging }
                onDayCellHover={ this.dayCellHoveredHandler }
                isRangeError={ isRangeError }
                maxRange={maxRange}
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
  initialDate     : moment().add(1, 'days'),
  maxRange        : 28
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
