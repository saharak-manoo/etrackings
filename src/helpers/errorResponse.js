export function ResponseView(navigation, statusCode, SheetManager, callback) {
  switch (statusCode) {
    case 401:
      SheetManager.show('PleaseLogin', {
        payload: {
          sheetName: 'PleaseLogin',
          navigation: navigation,
        },
      });
      break;
    case 403:
      SheetManager.show('PleaseLogin', {
        payload: {
          sheetName: 'PleaseLogin',
          navigation: navigation,
        },
      });
      break;
    case 500:
      SheetManager.show('ServerError', {
        payload: {
          sheetName: 'ServerError',
          navigation: navigation,
        },
      });
      break;
    case 502:
      SheetManager.show('ServerError', {
        payload: {
          sheetName: 'ServerError',
          navigation: navigation,
        },
      });
      break;
    default:
      SheetManager.show('NoInternetConnected', {
        payload: {
          sheetName: 'NoInternetConnected',
          navigation: navigation,
        },
      });
      break;
  }
}
