
const claendarWidth = 214;

export default {
  Calendar: {
    padding: 0,
    width: claendarWidth,
    paddingTop: 2,
    color: '#454545',
    fontFamily: 'Proxima Nova Semibold, Tahoma, sans-serif',
    userSelect: 'none'
  },
  DateRange: {
    backgroundColor: '#fff',
  },
  DayInRange: {
    background: 'rgb(213, 227, 255)',
    color: '#454545'
  },
  DayHover: {
    backgroundColor: 'rgb(213, 227, 255)',
    borderRadius: '50%'
  },
  DayActive: {
    transform: 'none',
    background: 'rgb(213, 227, 255)'
  },
  DaySelected : {
    background: 'none',
    backgroundColor: 'rgb(213, 227, 255)',
    backgroundImage: "url(https://puu.sh/xcgoV.png)",
    backgroundOrigin: 'padding-box',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    padding: '0 2px'
  },
  MonthAndYear: {
    textTransform: 'uppercase',
    fontSize: '14px',
    color: '#345699',
    padding: 0,
    height: 'auto',
    textAlign: 'center',
    display: 'block',
    marginBottom: 16
  },
  Weekday: {
    color: '#a2a2a2',
    fontSize: '10px',
    textTransform: 'uppercase',
    width: 'auto',
    textAlign: 'center'
  },
  Day: {
    fontFamily: 'Proxima Nova Light, Tahoma, sans-serif',
    textAlign: 'center',
    fontSize: '15px',
    width: claendarWidth/7,
    height: 30,
    lineHeight: '30px'
  },
  DayStartEdge: {
    borderTopLeftRadius: '50%',
    borderBottomLeftRadius: '50%',
  },
  DayEndEdge: {
    borderTopRightRadius: '50%',
    borderBottomRightRadius: '50%',
  },
}
