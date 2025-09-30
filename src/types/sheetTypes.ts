import { StackNavigationProp } from '@react-navigation/stack';

declare module 'react-native-actions-sheet' {
  interface Sheets {
    QRCode: {
      sheetName: string;
      navigation: StackNavigationProp<any>;
      title: string;
      courier: string;
    };
  }
}
