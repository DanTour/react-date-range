import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { defaultClasses } from './styles.js';

class DayCell extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      hover     : false,
      active    : false
    }

    this.styles = this.props.theme;
  }

  handleMouseEvent(event) {
    event.preventDefault();
    if (this.props.isPassive ) return null;
    let { onItemMouseEnter, dayMoment, startDate, endDate } = this.props;

    const newState = {};

    switch (event.type) {
      case 'mouseenter':
        newState['hover'] = true;
        onItemMouseEnter(dayMoment, startDate, endDate);
        break;

      case 'mouseup':
      case 'mouseleave':
        newState['hover'] = false;
        newState['active'] = false;
        break;

      case 'mousedown':
        newState['active'] = true;
        break;
    }

    this.setState(newState);
  }

  handleSelect(event) {
    event.preventDefault();

    if (this.props.isPassive) return null;

    this.props.onSelect(this.props.dayMoment);
  }

  getStateStyles() {
    const { hover, active } = this.state;
    const { isSelected, isInRange, isPassive, isStartEdge, isEndEdge, dayMoment, isToday, isSunday, isSpecialDay } = this.props;
    const { styles } = this;

    const hoverStyle    = hover ? styles['DayHover'] : {};
    const activeStyle   = active ? styles['DayActive'] : {};
    const passiveStyle  = isPassive ? styles['DayPassive'] : {};
    const startEdgeStyle = isStartEdge ? styles['DayStartEdge'] : {};
    const endEdgeStyle   = isEndEdge ? styles['DayEndEdge'] : {};
    const selectedStyle = isSelected ? styles['DaySelected'] : {};
    const inRangeStyle  = isInRange ? styles['DayInRange'] : {};
    const todayStyle    = isToday ? styles['DayToday'] : {};
    const sundayStyle = isSunday ? styles['DaySunday'] : {};
    const specialDayStyle = isSpecialDay ? styles['DaySpecialDay'] : {};

    return {
      ...todayStyle,
      ...sundayStyle,
      ...specialDayStyle,
      ...inRangeStyle,
      ...hoverStyle,
      ...passiveStyle,
      ...activeStyle,
      ...selectedStyle,
      ...startEdgeStyle,
      ...endEdgeStyle
    };
  }

  getClassNames(classes) {
    const { isSelected, 
            isInRange,
            isPassive,
            isStartEdge,
            isEndEdge,
            isToday,
            isSunday,
            isSpecialDay,
            inHoveredRange,
            isWeekend,
            isDisabled
           } = this.props;

    return classnames({
      [classes.day]           : true,
      [classes.dayActive]     : isSelected || inHoveredRange,
      [classes.dayPassive]    : isPassive,
      [classes.dayDisabled]   : isDisabled,
      [classes.dayInRange]    : isInRange || inHoveredRange,
      [classes.dayStartEdge]  : isStartEdge,
      [classes.dayEndEdge]    : isEndEdge,
      [classes.dayToday]      : isToday,
      [classes.daySunday]     : isSunday,
      [classes.daySpecialDay] : isSpecialDay,
      [classes.weekend]       : isWeekend
    });

  }

  render() {
    const { dayMoment, onlyClasses, classNames, isPassive, isDisabled } = this.props;

    const { styles } = this;
    const stateStyle = this.getStateStyles();
    const classes    = this.getClassNames(classNames);
    const dayWrapperStyles = {
      width: styles['Day'].width,
      height: !isPassive ? styles['Day'].height : 0,
      display: styles['Day'].display,
      overflow: !isPassive ? 'visible' : 'hidden'

    };

    return (
      <span
        style={onlyClasses ? undefined : dayWrapperStyles}
        onClick={ isDisabled ? undefined : this.handleSelect.bind(this) }>
        <span
          onMouseEnter={ isDisabled ? undefined : this.handleMouseEvent.bind(this) }
          onMouseLeave={ isDisabled ? undefined : this.handleMouseEvent.bind(this) }
          onMouseDown={ isDisabled ? undefined : this.handleMouseEvent.bind(this) }
          onMouseUp={ isDisabled ? undefined : this.handleMouseEvent.bind(this) }
          className={ classes }
          style={onlyClasses ? undefined : {...styles['Day'], ...stateStyle}}>
          { dayMoment.date() }
        </span>
      </span>
    );
  }
}

DayCell.defaultProps = {
  theme       : { 'Day' : {} },
  onlyClasses : false
}

DayCell.propTypes = {
  dayMoment   : PropTypes.object.isRequired,
  onSelect    : PropTypes.func,
  isSelected  : PropTypes.bool,
  isInRange   : PropTypes.bool,
  isPassive   : PropTypes.bool,
  theme       : PropTypes.shape({
    Day       : PropTypes.object.isRequired
  }).isRequired,
  onlyClasses : PropTypes.bool,
  isSpecialDay: PropTypes.bool,
  classNames  : PropTypes.object
}

export default DayCell;
