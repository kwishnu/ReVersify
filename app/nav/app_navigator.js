'use strict';
import React, {Component} from 'react';
//import { Navigator } from 'react-native';
import NavigationExperimental from 'react-native-deprecated-custom-components';
const Splash = require('../routes/splash');
const Intro = require('../routes/intro');
const Home = require('../routes/home');
const Settings = require('../routes/settings');
const Mission = require('../routes/mission');
const About = require('../routes/about');
const Social = require('../routes/social');
const Game = require('../routes/game');
const Book = require('../routes/book');
const Collection = require('../routes/collection');
const Daily = require('../routes/daily');
const Favorites = require('../routes/favorites');
const Bounce = require('../routes/bounce');
const HintStore = require('../routes/hintstore');
const Store = require('../routes/store');
const Reader = require('../routes/reader');
const Intro1 = require('../intro/intro1');

class AppNavigator extends React.Component {
    constructor(props) {
        super(props);
    }
    navigatorRenderScene(routeID) {
        switch (routeID) {
            case 'splash':
                return Splash;
            case 'intro':
                return Intro;
            case 'home':
                return Home;
            case 'settings':
                return Settings;
            case 'mission':
                return Mission;
            case 'about':
                return About;
            case 'social':
                return Social;
            case 'game':
                return Game;
            case 'book':
                return Book;
            case 'collection':
                return Collection;
            case 'daily':
                return Daily;
            case 'favorites':
                return Favorites;
            case 'bounce':
                return Bounce;
            case 'hints':
                return HintStore;
            case 'store':
                return Store;
            case 'reader':
                return Reader;
            case 'intro1':
                return Intro1;

            // Add more ids here
        }
//NavigationExperimental.Navigator
    }

    render() {
        return (
            <NavigationExperimental.Navigator
              initialRoute={ { id: 'splash',  passProps: {motive: 'initialize'} } }
              renderScene={(route, navigator) => {
                return React.createElement(this.navigatorRenderScene(route.id), { ...this.props, ...route.passProps, navigator, route } );
              }} />
        );
    }
}

module.exports = AppNavigator;
