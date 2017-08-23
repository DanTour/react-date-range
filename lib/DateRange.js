'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _utilsParseInputJs = require('./utils/parseInput.js');

var _utilsParseInputJs2 = _interopRequireDefault(_utilsParseInputJs);

var _CalendarJs = require('./Calendar.js');

var _CalendarJs2 = _interopRequireDefault(_CalendarJs);

var _PredefinedRangesJs = require('./PredefinedRanges.js');

var _PredefinedRangesJs2 = _interopRequireDefault(_PredefinedRangesJs);

var _stylesJs = require('./styles.js');

var _stylesJs2 = _interopRequireDefault(_stylesJs);

var DateRange = (function (_Component) {
  _inherits(DateRange, _Component);

  function DateRange(props, context) {
    _classCallCheck(this, DateRange);

    _get(Object.getPrototypeOf(DateRange.prototype), 'constructor', this).call(this, props, context);

    var format = props.format;
    var linkedCalendars = props.linkedCalendars;
    var theme = props.theme;

    var startDate = (0, _utilsParseInputJs2['default'])(props.startDate, format, 'startOf');
    var endDate = (0, _utilsParseInputJs2['default'])(props.endDate, format, 'endOf');

    this.dayCellHoveredHandler = this.dayCellHovered.bind(this);

    this.state = {
      range: { startDate: startDate, endDate: endDate },
      link: linkedCalendars && endDate,
      isRangeFixed: startDate && endDate ? true : false,
      isStartDateChanging: false,
      isEndDateChanging: false,
      lastDateFixed: null,
      israngeError: false
    };

    this.step = 0;
    this.styles = (0, _stylesJs2['default'])(theme);
  }

  _createClass(DateRange, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var onInit = this.props.onInit;

      onInit && onInit(this.state.range);
    }
  }, {
    key: 'orderRange',
    value: function orderRange(range) {
      var startDate = range.startDate;
      var endDate = range.endDate;

      var swap = startDate.isAfter(endDate);

      if (!swap) return range;

      return {
        startDate: endDate,
        endDate: startDate
      };
    }
  }, {
    key: 'setRange',
    value: function setRange(range, source, triggerChange) {
      var additionalData = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
      var onChange = this.props.onChange;

      range = this.orderRange(range);

      var newState = {
        range: range
      };

      if (additionalData) {
        Object.keys(additionalData).forEach(function (key) {
          return newState[key] = additionalData[key];
        });
      }
      this.setState(newState, function () {
        return triggerChange && onChange && onChange(range, source);
      });
    }
  }, {
    key: 'handleSelect',
    value: function handleSelect(boundedRange, date, source) {
      var isRangeFixed = this.state.isRangeFixed;

      if (!isRangeFixed) {
        this.step = 0;
        var _state = this.state;
        var isStartDateChanging = _state.isStartDateChanging;
        var isEndDateChanging = _state.isEndDateChanging;
        var maxRange = this.props.maxRange;

        var isError = false;
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

      var _state$range = this.state.range;
      var startDate = _state$range.startDate;
      var endDate = _state$range.endDate;

      var range = {
        startDate: startDate,
        endDate: endDate
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
      var triggerChange = !this.props.twoStepChange || this.step === 0 && this.props.twoStepChange;

      this.setRange(range, source, triggerChange, {
        isRangeFixed: !isRangeFixed,
        lastDateFixed: date,
        isRangeError: false
      });
    }
  }, {
    key: 'handleLinkChange',
    value: function handleLinkChange(direction) {
      var link = this.state.link;

      this.setState({
        link: link.clone().add(direction, 'months')
      });
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      // Whenever date props changes, update state with parsed variant
      if (newProps.startDate || newProps.endDate) {
        var format = newProps.format || this.props.format;
        var startDate = newProps.startDate && (0, _utilsParseInputJs2['default'])(newProps.startDate, format, 'startOf');
        var endDate = newProps.endDate && (0, _utilsParseInputJs2['default'])(newProps.endDate, format, 'endOf');
        var oldStartDate = this.props.startDate && (0, _utilsParseInputJs2['default'])(this.props.startDate, format, 'startOf');
        var oldEndDate = this.props.endDate && (0, _utilsParseInputJs2['default'])(this.props.endDate, format, 'endOf');

        if (!startDate.isSame(oldStartDate) || !endDate.isSame(oldEndDate)) {
          this.setRange({
            startDate: startDate || oldStartDate,
            endDate: endDate || oldEndDate
          });
        }
      }
    }
  }, {
    key: 'isInRange',
    value: function isInRange(dayMoment, startDate, endDate) {
      var maxRange = this.props.maxRange;

      return Math.abs(dayMoment.diff(startDate, 'days')) <= maxRange && Math.abs(dayMoment.diff(endDate, 'days')) <= maxRange;
    }
  }, {
    key: 'dayCellHovered',
    value: function dayCellHovered(dayMoment, startDate, endDate) {
      var _state2 = this.state;
      var isRangeFixed = _state2.isRangeFixed;
      var isEndDateChanging = _state2.isEndDateChanging;
      var isStartDateChanging = _state2.isStartDateChanging;
      var lastDateFixed = _state2.lastDateFixed;
      var maxRange = this.props.maxRange;

      var isInMaxRange = this.isInRange(dayMoment, startDate, endDate);

      if (!isInMaxRange && !isRangeFixed) {
        var range = {};

        if (isStartDateChanging) {
          range.startDate = endDate.clone().add(-maxRange, 'days');
          range.endDate = endDate;
          if (dayMoment.month() === range.startDate.month()) {
            return this.setRange(range, false, true);
          } else {
            return;
          }
        }

        if (isEndDateChanging) {
          range.startDate = startDate;
          range.endDate = startDate.clone().add(+maxRange, 'days');

          if (dayMoment.month() === range.endDate.month()) {
            return this.setRange(range, false, true);
          } else {
            return;
          }
        }

        return this.setRange(range, false, true);
      }

      if (!isRangeFixed && isInMaxRange) {
        if (!(dayMoment.isSame(startDate, 'day') || dayMoment.isSame(endDate, 'day'))) {
          // dates not the same
          if (dayMoment.isAfter(endDate)) {
            // date after end of date range, means user moves right
            var range = {
              startDate: startDate,
              endDate: dayMoment
            };
            if (isStartDateChanging) {
              range.startDate = endDate, range.endDate = dayMoment;
            }
            return this.setRange(range, false, true, {
              isEndDateChanging: true,
              isStartDateChanging: false
            });
          }

          if (dayMoment.isBetween(startDate, endDate, 'day')) {
            var range = {};
            if (isEndDateChanging) {
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
            var range = {
              endDate: endDate,
              startDate: dayMoment
            };

            if (isEndDateChanging) {
              range.startDate = startDate;
              range.endDate = dayMoment;
            }

            return this.setRange(range, false, true, {
              isStartDateChanging: true,
              isEndDateChanging: false
            });
          }
        } else {
          if (isEndDateChanging) {
            this.setRange({ startDate: lastDateFixed, endDate: dayMoment }, false, true);
          } else {
            this.setRange({ startDate: dayMoment, endDate: lastDateFixed }, false, true);
          }
        }
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var _props = this.props;
      var ranges = _props.ranges;
      var format = _props.format;
      var linkedCalendars = _props.linkedCalendars;
      var style = _props.style;
      var calendars = _props.calendars;
      var firstDayOfWeek = _props.firstDayOfWeek;
      var minDate = _props.minDate;
      var maxDate = _props.maxDate;
      var classNames = _props.classNames;
      var onlyClasses = _props.onlyClasses;
      var specialDays = _props.specialDays;
      var lang = _props.lang;
      var disableDaysBeforeToday = _props.disableDaysBeforeToday;
      var offsetPositive = _props.offsetPositive;
      var shownDate = _props.shownDate;
      var showMonthArrow = _props.showMonthArrow;
      var rangedCalendars = _props.rangedCalendars;
      var Arrow = _props.Arrow;
      var maxRange = _props.maxRange;
      var _state3 = this.state;
      var range = _state3.range;
      var link = _state3.link;
      var isRangeFixed = _state3.isRangeFixed;
      var isEndDateChanging = _state3.isEndDateChanging;
      var isStartDateChanging = _state3.isStartDateChanging;
      var isRangeError = _state3.isRangeError;
      var styles = this.styles;

      var classes = _extends({}, _stylesJs.defaultClasses, classNames);
      var yearsDiff = range.endDate.year() - range.startDate.year();
      var monthsDiff = range.endDate.month() - range.startDate.month();
      var diff = yearsDiff * 12 + monthsDiff;
      var calendarsCount = Number(calendars) - 1;

      return _react2['default'].createElement(
        'div',
        { style: onlyClasses ? undefined : _extends({}, styles['DateRange'], style), className: classes.dateRange },
        ranges && _react2['default'].createElement(_PredefinedRangesJs2['default'], {
          format: format,
          ranges: ranges,
          range: range,
          theme: styles,
          onSelect: this.handleSelect.bind(this),
          onlyClasses: onlyClasses,
          classNames: classes }),
        (function () {
          var _calendars = [];
          var _method = offsetPositive ? 'unshift' : 'push';
          for (var i = calendarsCount; i >= 0; i--) {
            var offset = offsetPositive ? i : -i;
            var realDiff = offsetPositive ? diff : -diff;
            var realOffset = rangedCalendars && i == calendarsCount && diff != 0 ? realDiff : offset;

            _calendars[_method](_react2['default'].createElement(_CalendarJs2['default'], {
              showMonthArrow: showMonthArrow,
              shownDate: shownDate,
              disableDaysBeforeToday: disableDaysBeforeToday,
              lang: lang,
              key: i,
              offset: realOffset,
              link: linkedCalendars && link,
              linkCB: _this.handleLinkChange.bind(_this),
              range: range,
              format: format,
              firstDayOfWeek: firstDayOfWeek,
              theme: styles,
              minDate: minDate,
              maxDate: maxDate,
              onlyClasses: onlyClasses,
              specialDays: specialDays,
              classNames: classes,
              onChange: isRangeFixed ? _this.handleSelect.bind(_this) : _this.handleSelect.bind(_this, range),
              Arrow: Arrow,
              isEndDateChanging: isEndDateChanging,
              isStartDateChanging: isStartDateChanging,
              onDayCellHover: _this.dayCellHoveredHandler,
              isRangeError: isRangeError,
              maxRange: maxRange
            }));
          }
          return _calendars;
        })()
      );
    }
  }]);

  return DateRange;
})(_react.Component);

DateRange.defaultProps = {
  linkedCalendars: false,
  theme: {},
  format: 'DD/MM/YYYY',
  calendars: 2,
  onlyClasses: false,
  offsetPositive: false,
  classNames: {},
  specialDays: [],
  rangedCalendars: false,
  twoStepChange: false,
  firstDayOfWeek: 1,
  initialDate: (0, _moment2['default'])().add(1, 'days'),
  maxRange: 28
};

DateRange.propTypes = {
  format: _propTypes2['default'].string,
  firstDayOfWeek: _propTypes2['default'].number,
  calendars: _propTypes2['default'].oneOfType([_propTypes2['default'].string, _propTypes2['default'].number]),
  startDate: _propTypes2['default'].oneOfType([_propTypes2['default'].object, _propTypes2['default'].func, _propTypes2['default'].string]),
  endDate: _propTypes2['default'].oneOfType([_propTypes2['default'].object, _propTypes2['default'].func, _propTypes2['default'].string]),
  minDate: _propTypes2['default'].oneOfType([_propTypes2['default'].object, _propTypes2['default'].func, _propTypes2['default'].string]),
  maxDate: _propTypes2['default'].oneOfType([_propTypes2['default'].object, _propTypes2['default'].func, _propTypes2['default'].string]),
  dateLimit: _propTypes2['default'].func,
  ranges: _propTypes2['default'].object,
  linkedCalendars: _propTypes2['default'].bool,
  twoStepChange: _propTypes2['default'].bool,
  theme: _propTypes2['default'].object,
  onInit: _propTypes2['default'].func,
  onChange: _propTypes2['default'].func,
  onlyClasses: _propTypes2['default'].bool,
  specialDays: _propTypes2['default'].array,
  offsetPositive: _propTypes2['default'].bool,
  classNames: _propTypes2['default'].object,
  rangedCalendars: _propTypes2['default'].bool,
  Arrow: _propTypes2['default'].func
};

exports['default'] = DateRange;
module.exports = exports['default'];