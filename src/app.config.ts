export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/booking/index',
    'pages/rooms/index',
    'pages/mine/index',
    'pages/bookingDetail/index',
    'pages/roomDetail/index',
    'pages/levelHistory/index',
    'pages/assessment/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#F7F5F2',
    navigationBarTitleText: '鼓房陪练',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#8E8EA0',
    selectedColor: '#6C5CE7',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/home/index', text: '首页' },
      { pagePath: 'pages/booking/index', text: '预约' },
      { pagePath: 'pages/rooms/index', text: '鼓房' },
      { pagePath: 'pages/mine/index', text: '我的' }
    ]
  }
})
