import 'intl';
import 'intl/locale-data/jsonp/pt-BR';
import { AppRegistry } from 'react-native';
import AppProvider from './src/index';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => AppProvider);
