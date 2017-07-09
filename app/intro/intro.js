import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Image,
  Dimensions,
  AsyncStorage,
  Animated,
  Easing,
  BackHandler
} from 'react-native';
import configs from '../config/configs';
import { normalize, normalizeFont }  from '../config/pixelRatio';
const KEY_MyHints = 'myHintsKey';
const KEY_Premium = 'premiumOrNot';
const KEY_InfinteHints = 'infHintKey';
const KEY_PlayFirst = 'playFirstKey';
const KEY_ShowVerse = 'showVerseKey';
const KEY_ratedTheApp = 'ratedApp';
const KEY_ThankRated = 'thankRatedApp';
const KEY_expandInfo = 'expandInfoKey';
const KEY_Solved = 'numSolvedKey';
const KEY_Favorites = 'numFavoritesKey';
const KEY_show_score = 'showScoreKey';
const {width, height} = require('Dimensions').get('window');

class Intro extends Component {
    constructor(props) {
        super(props);
        this.offsetX = new Animated.Value(0);
        this.moveValue = new Animated.Value(0)
        this.state = {
            id: 'intro',
            arrowImage: require('../images/arrowforward.png'),
            showNextArrow: false,
            showWelcome: false,
            showText: false
        };
        this.handleHardwareBackButton = this.handleHardwareBackButton.bind(this);
    }
    componentDidMount() {
        this.animate_image_delay();
        setTimeout(()=> {this.setState({showNextArrow: true})}, 1800);
        setTimeout(()=> {this.setState({showWelcome: true})}, 2500);
        setTimeout(()=> {this.setState({showText: true})}, 3000);
        BackHandler.addEventListener('hardwareBackPress', this.handleHardwareBackButton);
        if (this.props.seenIntro != 'true'){
            var initArray = [
                [KEY_MyHints, '-1'],
                [KEY_Premium, 'false'],
                [KEY_InfinteHints, 'false'],
                [KEY_PlayFirst, 'false'],
                [KEY_ShowVerse, 'false'],
                [KEY_ratedTheApp, 'false'],
                [KEY_ThankRated, 'false'],
                [KEY_expandInfo, '1.1.1'],
                [KEY_Solved, '0'],
                [KEY_Favorites, '0'],
                [KEY_show_score, '1']
            ];
            try {
                AsyncStorage.multiSet(initArray);
            } catch (error) {
                window.alert('AsyncStorage error: ' + error.message);
            }
        }
    }
    componentWillUnmount () {
        BackHandler.removeEventListener('hardwareBackPress', this.handleHardwareBackButton);
    }
    handleHardwareBackButton=() => {
        this.goSomewhere();
    }
    goSomewhere(){
        let goToHere = this.props.destination;
        if (goToHere == 'home'){
            this.props.navigator.replace({
                id: goToHere,
                passProps: {
                    homeData: this.props.homeData,
                    connectionBool: this.props.connectionBool
                },
           });
        }else{
            this.props.navigator.pop({
                id: goToHere,
                passProps: {
                    homeData: this.props.homeData,
                },
           });
        }
    }
    animate_image_delay(){
        this.moveValue.setValue(0);
        Animated.sequence([
            Animated.delay(500),
            Animated.spring(
            this.moveValue,
                {
                    toValue: 1,
                    easing: Easing.back,
                    duration: 2000,
                }
            )
        ]).start()
    }
    intro1(){
        this.props.navigator.push({
            id: 'intro1',
            passProps: {
                destination: 'game',
                }
        });
    }

    render() {
        const move = this.moveValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -200]
        })
        return (
			<View style={ styles.container } >
                <View>
                    <Animated.Image style={[styles.image, {transform: [{translateY: move}]}] } source={require('../images/logo.png')} />
                </View>
                <View style={styles.skip} onStartShouldSetResponder={()=>this.handleHardwareBackButton()}>
                    <Text style={styles.skip_text}>Skip</Text>
                </View>
                { this.state.showWelcome &&
                <View style={styles.welcome_container}>
                    <Text style={styles.text_welcome}>Welcome!</Text>
                </View>
                }
                { this.state.showText &&
                <View style={styles.text_container}>
                    <Text style={styles.text}>Tap the arrow to take a quick tutorial...</Text>
                </View>
                }
                { this.state.showNextArrow &&
                <View style={styles.next_arrow} onStartShouldSetResponder={() => { this.intro1() }} >
                    <Image source={this.state.arrowImage}/>
                </View>
                }
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000'
    },
    image: {
        width: normalize(height*.35),
        height: normalize(height*.17),
        marginBottom: 20
    },
    welcome_container: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: width*.65,
        height: height/5.5,
        top: height*.4
    },
    text_container: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: width*.65,
        height: height/5.5,
        top: height*.5
    },
    next_arrow: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: width,
        height: height/5.5,
        top: height*.65
    },
    skip: {
        position: 'absolute',
        top: height*.92,
        left: width*.05,
        padding: height*.015
    },
    text_welcome: {
        fontSize: normalizeFont(configs.LETTER_SIZE*0.14),
        color: '#ffffff',
        textAlign: 'center'
    },
    text: {
        fontSize: normalizeFont(configs.LETTER_SIZE*0.1),
        color: '#486bdd',
        textAlign: 'center'
    },
    skip_text: {
        fontSize: normalizeFont(configs.LETTER_SIZE*0.14),
        fontWeight: 'bold',
        color: '#ffffff'
    }
});

module.exports = Intro;