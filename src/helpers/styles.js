import { Dimensions, StyleSheet, Platform } from 'react-native';
import * as GFun from './globalFunction';
import { hasNotch } from 'react-native-device-info';

const width = Dimensions.get('window').width;

export const styles = StyleSheet.create({
  defaultView: {
    fontFamily: 'Kanit-Light',
    flex: 1,
    backgroundColor: '#EEEEEE',
  },

  centerScreen: {
    fontFamily: 'Kanit-Light',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    alignContent: 'center',
  },

  textHead: {
    fontFamily: 'Kanit-Light',
    fontSize: GFun.fontSize(29),
    paddingBottom: 10,
  },

  textSub: {
    fontFamily: 'Kanit-Light',
    fontSize: GFun.fontSize(18),
    paddingBottom: 20,
    color: '#666666',
  },

  textCaption: {
    fontFamily: 'Kanit-Light',
    fontSize: GFun.fontSize(10),
    paddingBottom: 20,
    color: '#666666',
  },

  borderBase: {
    width: 30,
    height: 45,
  },

  borderHighLighted: {
    borderColor: '#03DAC6',
  },

  underlineBase: {
    width: 30,
    height: 45,
    borderWidth: 0,
    borderBottomWidth: 2,
  },

  underlineHighLighted: {
    borderColor: '#03DAC6',
  },

  resendOTP: {
    fontFamily: 'Kanit-Light',
    fontSize: GFun.fontSize(18),
    paddingTop: 50,
    paddingBottom: 5,
    color: '#666666',
  },

  listCard: {
    fontFamily: 'Kanit-Light',
    height: 40,
    borderLeftColor: '#03DAC6',
    borderLeftWidth: 3,
  },

  textCardList: {
    fontFamily: 'Kanit-Light',
    paddingLeft: 15,
    fontSize: GFun.fontSize(19),
  },

  titleContainer: {
    fontFamily: 'Kanit-Light',
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageTitle: {
    fontFamily: 'Kanit-Light',
    color: 'white',
    backgroundColor: 'transparent',
    fontSize: GFun.fontSize(18),
    marginBottom: GFun.hp(4.5),
  },

  image: {
    width: width,
    alignSelf: 'stretch',
    resizeMode: 'cover',
  },

  deliveryTime: {
    borderRadius: 20,
    width: GFun.wp(50),
    height: GFun.hp(4),
    backgroundColor: 'transparent',
    borderColor: '#FFF',
    borderWidth: 2,
    alignContent: 'center',
    justifyContent: 'center',
  },

  deliveryTimeText: {
    fontWeight: 'bold',
    alignSelf: 'center',
    color: '#FFF',
    fontSize: GFun.fontSize(13),
  },

  popUpModal: {
    backgroundColor: '#FFF',
  },

  overlayModal: {
    backgroundColor: 'transparent',
  },

  handleModal: {
    backgroundColor: '#C5C5C5',
  },

  spinnerTextStyle: {
    fontFamily: 'Kanit-Light',
  },

  actionButtonIcon: {
    fontSize: GFun.fontSize(18),
    height: 22,
    color: 'white',
  },

  iconMenu: {
    fontSize: GFun.fontSize(16),
    height: 22,
  },

  infoIcon: {
    fontSize: GFun.fontSize(15),
    justifyContent: 'flex-end',
    alignContent: 'flex-end',
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    marginRight: 10,
    marginTop: 10,
  },

  openLinkIcon: {
    fontSize: GFun.fontSize(20),
    height: 26,
  },

  signOutIcon: {
    fontSize: GFun.fontSize(26),
    height: 32,
  },

  modalButtonBackIcon: {
    fontSize: GFun.fontSize(28),
    height: 30,
  },

  modalButtonIcon: {
    fontSize: GFun.fontSize(36),
    height: 40,
  },

  modalButtonMatIcon: {
    fontSize: GFun.fontSize(28),
    height: 30,
  },

  modalShareButtonIcon: {
    fontSize: GFun.fontSize(28),
    height: 30,
  },

  circle: {
    borderRadius: 20,
    borderTopEndRadius: 80,
    borderBottomEndRadius: 80,
    justifyContent: 'center',
  },

  circleStatus: {
    borderRadius: 27,
    borderTopEndRadius: 80,
    borderBottomEndRadius: 80,
    justifyContent: 'center',
  },

  imageCircleSearch: {
    width: 25,
    height: 25,
    alignSelf: 'center',
  },

  imageCircleStatus: {
    width: 35,
    height: 35,
    alignSelf: 'center',
    zIndex: 10000,
  },

  imageSearch: {
    alignSelf: 'center',
    width: GFun.isIpad() ? 295 : 195,
    height: GFun.isIpad() ? 395 : 295,
    justifyContent: 'center',
    zIndex: 10000,
  },

  imageSearchNotFound: {
    alignSelf: 'center',
    width: GFun.isIpad() ? 295 : 195,
    height: GFun.isIpad() ? 355 : 225,
    justifyContent: 'center',
    zIndex: 10000,
  },

  imageError: {
    alignSelf: 'center',
    width: GFun.isIpad() ? 395 : 295,
    height: GFun.isIpad() ? 495 : 395,
    justifyContent: 'center',
    zIndex: 10000,
  },

  imageNoAds: {
    alignSelf: 'center',
    width: GFun.isIpad() ? 495 : 395,
    height: GFun.isIpad() ? 395 : 295,
    zIndex: 10000,
  },

  imageSystemMaintenance: {
    alignSelf: 'center',
    marginTop: 20,
    width: 235,
    height: 235,
    justifyContent: 'center',
    zIndex: 10000,
  },

  imageAlertSystemMaintenance: {
    marginLeft: 10,
    marginTop: 15,
    width: 105,
    height: 155,
    zIndex: 10000,
  },

  appETrackings: {
    width: 355,
    height: 395,
    alignSelf: 'center',
    zIndex: 10000,
  },

  appETrackingsIpad: {
    width: 555,
    height: 595,
    alignSelf: 'center',
    zIndex: 10000,
  },

  imageTrack: {
    width: 335,
    height: 435,
    alignSelf: 'center',
    zIndex: 10000,
  },

  imageLogo: {
    width: 135,
    height: 235,
    alignSelf: 'center',
    zIndex: 10000,
  },

  imagePromotion: {
    width: 335,
    height: 335,
    alignSelf: 'center',
    zIndex: 10000,
  },

  imageStatus: {
    width: 32,
    height: 32,
    alignSelf: 'center',
  },

  imageRight: {
    marginTop: 10,
    marginRight: 10,
    width: 40,
    height: 40,
    alignSelf: 'flex-end',
  },

  imageSelect: {
    marginRight: 10,
    width: 40,
    height: 40,
    borderRadius: 40,
    alignSelf: 'flex-end',
  },

  imageRightStatus: {
    marginTop: -30,
    marginRight: 15,
    width: 45,
    height: 45,
    alignSelf: 'flex-end',
  },

  imageSigner: {
    margin: 10,
    width: 125,
    height: 125,
    alignSelf: 'center',
    backgroundColor: '#fff',
    zIndex: 0,
  },

  imageTrackingStatus: {
    margin: 10,
    width: 75,
    height: 75,
    alignSelf: 'center',
  },

  headerImageTrackingStatus: {
    width: 63,
    height: 63,
    alignSelf: 'flex-end',
  },

  imageSignerOnView: {
    margin: 10,
    width: width,
    height: 400,
    alignSelf: 'center',
    backgroundColor: '#fff',
    zIndex: 0,
  },

  list: {
    flex: 1,
    marginTop: 20,
  },

  profilePhoto: {
    alignSelf: 'center',
    width: 150,
    height: 150,
    borderRadius: 150 / 2,
    borderWidth: 3,
    borderColor: '#07DC95',
  },

  profile: {
    fontFamily: 'Kanit-Light',
    flex: 1,
    padding: 10,
    alignSelf: 'center',
  },

  iconStatus: {
    fontSize: GFun.fontSize(28),
    color: 'black',
    alignSelf: 'center',
  },

  imageChip: {
    borderRadius: 55,
  },

  imageNotification: {
    width: 45,
    height: 45,
    alignSelf: 'center',
    alignItems: 'center',
  },

  imageSearchNoData: {
    width: 35,
    height: 35,
    borderRadius: 35,
    alignSelf: 'center',
  },

  buttonLoginWith: {
    fontFamily: 'Kanit-Light',
    alignSelf: 'center',
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
  },

  copyIcon: {
    fontSize: GFun.fontSize(18),
    color: '#FFDF2D',
  },

  callIcon: {
    fontSize: GFun.fontSize(18),
    color: '#28DCA5',
  },

  mapIcon: {
    fontSize: GFun.fontSize(18),
    color: '#F59C0A',
  },

  checkPriceStoreIcon: {
    fontSize: GFun.fontSize(25),
    color: '#13E27B',
  },

  iconShare: {
    fontSize: GFun.fontSize(18),
  },

  detailIcon: {
    fontSize: GFun.fontSize(25),
    color: '#28DCA5',
  },

  checkPrice: {
    flex: 0.3,
    borderRadius: 20,
    borderTopEndRadius: 80,
    borderBottomEndRadius: 80,
    justifyContent: 'center',
  },

  imageCheckPrice: {
    margin: 20,
    width: 90,
    height: 90,
    borderRadius: 10,
  },

  imageStore: {
    margin: 7,
    width: 45,
    height: 45,
    borderRadius: 10,
  },

  imageStoreForIpadLandscape: {
    margin: 7,
    width: 65,
    height: 65,
    borderRadius: 10,
  },

  imageCheckPriceRight: {
    marginTop: -28,
    marginRight: 12,
    width: 40,
    height: 40,
    alignSelf: 'flex-end',
  },

  imageOrcRight: {
    width: 70,
    height: 70,
    alignSelf: 'flex-end',
  },

  fab: {
    position: 'absolute',
    margin: 12,
    right: 0,
    bottom: 0,
    fontFamily: 'Kanit-Light',
    marginBottom: hasNotch() ? 65 : 75,
    borderRadius: 15,
  },

  fabNote: {
    position: 'absolute',
    margin: 12,
    right: 0,
    bottom: 0,
    fontFamily: 'Kanit-Light',
    borderRadius: 15,
  },

  fabQRCode: {
    position: 'absolute',
    margin: 12,
    right: 0,
    bottom: 0,
    fontFamily: 'Kanit-Light',
    borderRadius: 15,
    backgroundColor: '#000',
  },

  fabWithAd: {
    position: 'absolute',
    margin: 12,
    right: 0,
    bottom: hasNotch() ? 65 : 55,
    fontFamily: 'Kanit-Light',
    marginBottom: 10,
    borderRadius: 15,
  },

  fabWithAdWithTab: {
    position: 'absolute',
    margin: 12,
    right: 0,
    bottom: hasNotch() ? 125 : 115,
    fontFamily: 'Kanit-Light',
    marginBottom: 10,
    borderRadius: 15,
  },

  fabIpad: {
    position: 'absolute',
    margin: 12,
    right: 0,
    bottom: 0,
    fontFamily: 'Kanit-Light',
    marginBottom: 30,
  },

  fabIpadNoAd: {
    position: 'absolute',
    margin: 12,
    right: 0,
    bottom: 0,
    fontFamily: 'Kanit-Light',
    marginBottom: 25,
  },

  fabForGuest: {
    position: 'absolute',
    margin: 12,
    right: 0,
    bottom: 0,
    fontFamily: 'Kanit-Light',
  },

  footer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  centerText: {
    flex: 1,
    fontSize: GFun.fontSize(28),
    padding: 32,
  },

  textBold: {
    fontWeight: '500',
    color: '#000',
  },

  buttonText: {
    fontSize: GFun.fontSize(19),
    color: 'rgb(0,122,255)',
  },

  buttonTouchable: {
    padding: 16,
  },

  closeButton: {
    margin: 10,
  },

  imageTrackingMenu: {
    width: 23,
    height: 23,
    alignSelf: 'center',
    zIndex: 10000,
  },

  container: {
    marginLeft: 24,
    marginRight: 24,
  },

  topBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },

  floatLeft: {
    marginTop: 15,
    marginRight: 'auto',
  },

  floatLeftAuth: {
    marginTop: 15,
    marginLeft: 20,
    marginRight: 'auto',
  },

  floatRight: {
    marginTop: 15,
    marginLeft: 'auto',
  },

  menuImageStyle: {
    width: 20,
    height: 20,
  },

  profileImageStyle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  contentContainer: {
    marginTop: 12,
  },

  titleTextStyle: {
    fontFamily: 'Kanit-Light',
    fontSize: GFun.fontSize(22),
    fontWeight: 'bold',
  },

  subtitleTextStyle: {
    fontFamily: 'Kanit-Light',
    fontSize: GFun.fontSize(18),
    marginTop: 5,
    fontWeight: '400',
  },

  searchBarStyle: {
    padding: 16,
    marginTop: 24,
    borderRadius: 24,
    flexDirection: 'row',
  },

  searchImageStyle: {
    width: 20,
    height: 20,
  },

  searchInputStyle: {
    marginLeft: 12,
    fontWeight: '500',
  },

  scrollView: {
    backgroundColor: '#FFF',
  },

  body: {
    backgroundColor: '#FFF',
    marginLeft: 24,
    marginRight: 24,
  },

  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },

  sectionTitle: {
    fontSize: GFun.fontSize(21),
    fontWeight: '600',
    color: '#000',
  },

  sectionDescription: {
    marginTop: 8,
    fontSize: GFun.fontSize(16),
    fontWeight: '400',
    color: '#000',
  },

  highlight: {
    fontWeight: '700',
  },

  headerIcon: {
    fontSize: GFun.fontSize(GFun.isIpad() ? 23 : 24),
    height: 30,
    zIndex: 1000,
  },

  headerMatIcon: {
    fontSize: GFun.fontSize(22),
    height: 30,
    zIndex: 1000,
  },

  cardMatIcon: {
    fontSize: GFun.fontSize(22),
    marginBottom: 15,
    marginRight: 30,
    width: 40,
    height: 40,
    alignSelf: 'center',
  },

  headerShareButtonIcon: {
    fontSize: GFun.fontSize(24),
    height: 30,
    marginTop: -10,
  },

  notiTextStyle: {
    fontSize: GFun.fontSize(24),
    fontWeight: 'bold',
    textAlign: 'center',
  },

  notiSubTextStyle: {
    fontSize: GFun.fontSize(13),
    fontWeight: 'bold',
    textAlign: 'center',
  },

  parallaxImage: {
    width: GFun.width() - 50,
    height: GFun.height() - 95,
  },

  imageContainer: {
    flex: 1,
    marginBottom: Platform.select({ ios: 0, android: 1 }),
    backgroundColor: 'white',
    borderRadius: 12,
  },

  imageParallax: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },

  webViewLoading: {
    flex: 1,
    position: 'absolute',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },

  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'blue',
  },

  appIntro: {
    width: 375,
    height: 425,
    alignSelf: 'center',
    zIndex: 10000,
  },

  text: {
    fontFamily: 'Kanit-Light',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontSize: GFun.fontSize(16),
  },

  title: {
    fontFamily: 'Kanit-Light',
    fontSize: GFun.fontSize(22),
    color: 'white',
    textAlign: 'center',
  },

  buttonCircle: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, .2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
