import React, { Component } from 'react';
import moment from 'moment';
import 'moment/locale/ru'
import { defaultRanges, Calendar, DateRange } from '../../../lib';
import Section from 'components/Section';
// import Arrow from 'react-arrow';
import theme from './DateRangeTheme.js';
import './rangePickerTheme.css';
import 'normalize.css';
import 'styles/global'
import styles from 'styles/main';
// import '../../../src/styles.scss'

const Arrow = ( props ) => {
  const styles = {
    cursor: 'pointer'
  }
  return <div style={styles} onClick={props.onClick}>Privet</div>
}

export default class Main extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      'rangePicker' : {},
      'linked' : {},
      'datePicker' : null,
      'firstDayOfWeek' : null,
      'predefined' : {},
    }
  }

  handleChange(which, payload) {
    this.setState({
      [which] : payload
    });
  }

  render() {
    const { rangePicker, linked, datePicker, firstDayOfWeek, predefined} = this.state;
    const format = 'dddd, D MMMM YYYY';

    return (
      <main className={styles['Main']}>

        <h1 className={styles['Title']}>React-date-range</h1>

        <Section title='Range Picker'>
          <div>
            <input
              type='text'
              readOnly
              value={ rangePicker['startDate'] && rangePicker['startDate'].format(format).toString() }
            />
            <input
              type='text'
              readOnly
              value={ rangePicker['endDate'] && rangePicker['endDate'].format(format).toString() }
            />
          </div>
          <DateRange
            calendars={1}
            startDate={moment().add(1, 'days')}
            endDate={moment().add(7, 'days')}
            lang={'ru'}
            Arrow={Arrow}
            onInit={ this.handleChange.bind(this, 'rangePicker') }
            onChange={ this.handleChange.bind(this, 'rangePicker') }
            theme={theme}
          />
        </Section>
      </main>
    )
  }
}
