import * as RNIap from 'react-native-iap';
import * as Api from '../components/actions/api';

export const getPurchase = async () => {
  await RNIap.initConnection();
  let availablePurchases = await RNIap.getPurchaseHistory();
  const sortedAvailablePurchases = availablePurchases.sort(
    (a, b) => b.transactionDate - a.transactionDate,
  );

  if (sortedAvailablePurchases.length != 0) {
    return sortedAvailablePurchases[0];
  }

  return null;
};

export async function checkReceiptAndroid(receiptData = null) {
  if (receiptData == null) {
    let purchase = await getPurchase();
    let receipt = JSON.parse(purchase.transactionReceipt);
    receiptData = {
      productId: purchase.productId,
      purchaseToken: receipt.purchaseToken,
    };
  }

  let resp = await Api.validateReceiptAndroid(JSON.stringify(receiptData));

  return resp?.data;
}

export async function checkReceiptIos(receiptData = null) {
  if (receiptData == null) {
    let purchase = await getPurchase();
    receiptData = {
      productId: purchase.productId,
      transactionReceipt: purchase.transactionReceipt,
    };
  }
  let resp = await Api.validateReceiptIos(JSON.stringify(receiptData));

  return resp?.data;
}
