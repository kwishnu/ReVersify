import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, BackHandler, AsyncStorage, Animated, ActivityIndicator, Alert, Platform, Linking, AppState } from 'react-native';
import moment from 'moment';
import Button from '../components/Button';
import Tile from '../components/Tile';
import GrayTile from '../components/GrayTile';
import DropdownMenu from '../components/DropdownMenu';
import configs from '../config/configs';
import { normalize, normalizeFont, getArrowSize, getArrowMargin }  from '../config/pixelRatio';
const deepCopy = require('../config/deepCopy.js');
const styles = require('../styles/styles');
const {width, height} = require('Dimensions').get('window');
let dsArray = [];
let homeData = {};
let Sound = require('react-native-sound');
const plink1 = new Sound('plink.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    window.alert('Sound file not found');
  }
});
reverse = (s) => {
    return s.split("").reverse().join("");
}
randomBetween = (min,max) => {
    return Math.floor(Math.random()*(max-min+1)+min);

}
shadeColor = (color, percent) => {
    percent = percent/100;
    let f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}
invertColor = (hex, bw) => {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
}


class Intro2 extends Component {
    constructor(props) {
        super(props);
        this.flip = new Animated.Value(0);
        this.grow = new Animated.Value(0);
        this.opac = new Animated.Value(0);
        this.state = {
            id: 'intro2',
            title: this.props.title,
            index: this.props.index,
            homeData: this.props.homeData,
            daily_solvedArray: this.props.daily_solvedArray,
            dataElement: this.props.dataElement,
            shouldShowDropdown: false,
            isLoading: true,
            pan: new Animated.ValueXY(0),
            scale: new Animated.Value(1),
            bgColor: '#cfe7c2',
            panelBgColor: '#cfe7c2',
            panelBorderColor: invertColor('#cfe7c2', true),
            showingVerse: false,
            pan0: new Animated.ValueXY(), pan1: new Animated.ValueXY(),
            rows2: true,
            rows3: true,
            rows4: true,
            rows5: true,
            rows6: true,
            rows7: true,
            rows8: true,
            numberOfRows: 1,
            frag0: '', frag1: '', frag2: '', frag3: '', frag4: '', frag5: '', frag6: '', frag7: '', frag8: '', frag9: '', frag10: '', frag11: '', frag12: '',
            frag13: '', frag14: '', frag15: '', frag16: '', frag17: '', frag18: '',frag19: '', frag20: '', frag21: '', frag22: '', frag23: '',
            panelText: '',
            line0Text: 'n the beginning God',
            line1Text: '',
            line2Text: '',
            line3Text: '',
            line4Text: '',
            line5Text: '',
            line6Text: '',
            line7Text: '',
            nextFrag: '',
            onThisFragment: 0,
            fragmentOrder: [],
            wordsArray: [[], [], [], [], [], [], [], []],
            wordArrayPosition: [0, 0, 0],
            verseKey: '',
            chapterVerse: '',
            initialLetter: '',
            addSpace: false,
            showNextArrow: false,
            showButtons: false,
            showHintButton: true,
            showFB: true,
            showTwitter: true,
            showFavorites: true,
            showBible: false,
            numFavorites: 0,
            letterImage: require('../images/letters/i.png'),
            arrowImage: require('../images/arrowforward.png'),
            scaleXY: new Animated.Value(0),
            soundString: 'Mute Sounds',
            useSounds: true,
            doneWithVerse: false,
            playedFirst: false,
            isPremium: false,
            numHints: 0,
            numSolved: 0,
            myHintsInitialNum: -1,
            hintNumOpacity: 1,
            hasInfiniteHints: false,
            entireVerse: '',
            showText1: false,
            showText2: false,
            showTiles: true,
            showFooter: true,
            text1text: 'Tap the tile to reverse its letters...',
            text2text: '...then drag it to the page.'
        }
        this.handleHardwareBackButton = this.handleHardwareBackButton.bind(this);
    }
    componentDidMount() {
        this.setState({frag1Opacity: 0});
        this.setPanelColors();
        BackHandler.addEventListener('hardwareBackPress', this.handleHardwareBackButton);
        homeData = this.props.homeData;
        this.setState({ letterImage: require('../images/letters/i.png') });
    }
    componentWillUnmount () {
        BackHandler.removeEventListener('hardwareBackPress', this.handleHardwareBackButton);
    }
    handleHardwareBackButton() {
        this.props.navigator.pop({
            id: 'intro1',
            passProps: {
                homeData: this.props.homeData,
                isPremium: this.props.isPremium,
                seenIntro: this.props.seenStart,
                connectionBool: this.props.connectionBool,
                destination: this.props.destination
            }
       });
        return true;
    }
    start(){
        setTimeout(()=>{
            Alert.alert('Reversing tiles', 'Some tiles have their letters arranged in reverse...by tapping a tile you can flip it the right way.',
            [{text: 'OK', onPress: () => this.giveDirections()}], { onDismiss: () => {this.giveDirections()} }
            );
        }, 500);
    }
    reset(){
        setTimeout(()=>{
            this.setState({ text1text: 'Tap the tile to reverse its letters...',
                            text2text: '...then drag it to the page.',
                            showText1: false,
                            showText2: false,
                            showTiles: true,
                            nextFrag: 'creat',
                            line0Text: 'n the beginning God',
                            line1Text: '',
                            showNextArrow: false,

            });
        }, 500);
    }
    goSomewhere(){
        if (this.props.seenIntro != 'true'){
            this.props.navigator.replace({
                id: 'home',
                passProps: {
                    homeData: this.props.homeData,
                    isPremium: this.props.isPremium,
                    seenIntro: this.props.seenIntro,
                    connectionBool: this.props.connectionBool,
                    destination: this.props.destination
                },
           });
        }else{
            this.props.navigator.pop({});
        }
    }
    setPanelColors(){
        let darkerPanel = shadeColor('#cfe7c2', -10);
        let darkerBorder = shadeColor('#cfe7c2', -50);
        this.setState({panelBgColor: darkerPanel, panelBorderColor: darkerBorder});
    }
    giveDirections(){
        setTimeout(()=>{this.setState({showText1: true})}, 100);
        setTimeout(()=>{this.setState({showText2: true})}, 1700);
    }
    onDrop(text) {
        if (text == 'creat'){
            this.setState({line1Text: 'creat'});
            setTimeout(() => {this.setState({ showText1: false, showText2: false, showTiles: false, showFooter: false })}, 1000);
            setTimeout(() => {this.setState({ showNextArrow: true, showFooter: true, showText1: true, text1text: 'Great!', showText2: true, text2text: 'Next up...' })}, 1001);
        }
    }
    footerBorder(color) {
        let bgC = '#cfe7c2';
        let darkerColor = (bgC == '#cfe7c2')?shadeColor('#2B0B30', 5):shadeColor(color, -40);
        return {borderColor: darkerColor};
    }
    headerBorder(color) {
        let bgC = '#cfe7c2';
        let darkerColor = (bgC == '#cfe7c2')?shadeColor('#2B0B30', 5):shadeColor(color, -40);
        return {borderColor: darkerColor};
    }
    headerFooterColor(color) {
        let bgC = '#cfe7c2';
        let darkerColor = (bgC == '#cfe7c2')? '#2B0B30':shadeColor(color, -40);
        return {backgroundColor: darkerColor};
    }

    flipPanel(fromBook){
        this.flip.setValue(0);
        let chapterVerseStr = '';
        let pBgC ='';
        let pBC = '';
        let bool = false;
        let pText = (fromBook == true)?this.props.title:this.state.chapterVerse;
        if(!this.state.showingVerse){
            pBgC = '#555555';
            pBC = '#000000';
            bool = true;
            this.setState({panelText:  pText,
                                       panelBgColor: pBgC,
                                       panelBorderColor: pBC,
                                       showingVerse: bool
            })
            Animated.timing(this.flip,
                 {
                    toValue: 1,
                    duration: 1000,
                  }
            ).start();
        }else{
            this.setPanelColors();
            this.setState({panelText: '', showingVerse: bool});
        }
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <View style={[intro_styles.container, {backgroundColor: this.state.bgColor}]}>
                    <View style={[intro_styles.header, this.headerBorder(this.state.bgColor), this.headerFooterColor(this.state.bgColor)]}>
                        <Button style={[intro_styles.button, {marginLeft: getArrowMargin()}]} onPress={() => this.closeGame(this.props.fromWhere)}>
                            <Image source={ require('../images/close.png') } style={{ width: getArrowSize(), height: getArrowSize()}} />
                        </Button>
                        <Button style={[intro_styles.button, {marginRight: getArrowMargin()}]} onPress={ () => this.showDropdown()}>
                            <Image source={ require('../images/dropdown.png') } style={{ width: getArrowSize(), height: getArrowSize()}} />
                        </Button>
                    </View>
                    <View style={intro_styles.tablet}>
                            <Image style={intro_styles.biblegraphic} source={require('../images/biblegraphic.png')} />
                            <Image style={intro_styles.letter} source={this.state.letterImage} />
                                <View style={intro_styles.verse_container}>
                                    <View style={intro_styles.first_line}>
                                        <Text style={intro_styles.verse_text} >{ this.state.line0Text }</Text>
                                    </View>
                                    <View style={intro_styles.first_line}>
                                        <Text style={intro_styles.verse_text} >{ this.state.line1Text }</Text>
                                    </View>
                                    <View style={intro_styles.first_line}>
                                        <Text style={intro_styles.verse_text} >{ this.state.line2Text }</Text>
                                    </View>
                                    <View style={intro_styles.line}>
                                        <Text style={intro_styles.verse_text} >{ this.state.line3Text }</Text>
                                    </View>
                                    <View style={intro_styles.line}>
                                        <Text style={intro_styles.verse_text} >{ this.state.line4Text }</Text>
                                    </View>
                                    <View style={intro_styles.line}>
                                        <Text style={intro_styles.verse_text} >{ this.state.line5Text }</Text>
                                    </View>
                                    <View style={intro_styles.line}>
                                        <Text style={intro_styles.verse_text} >{ this.state.line6Text }</Text>
                                    </View>
                                    <View style={intro_styles.line}>
                                        <Text style={intro_styles.verse_text} >{ this.state.line7Text }</Text>
                                    </View>
                                    <View style={intro_styles.line}></View>
                                </View>
                    </View>
                    <View style={intro_styles.verse_panel_container}>
                        <Animated.View style={[intro_styles.verse_panel, {backgroundColor: this.state.panelBgColor, borderColor: this.state.panelBorderColor}]}>
                                    <Text style={intro_styles.panel_text} >{this.state.panelText}</Text>
                        </Animated.View>
                    </View>
                    { this.state.showNextArrow &&
                    <View style={intro_styles.next_arrow}>
                        <Image source={this.state.arrowImage}/>
                    </View>
                    }
                    { this.state.showText1 &&
                    <View style={intro_styles.text1}>
                        <Text style={intro_styles.instructions_text}>{this.state.text1text}</Text>
                    </View>
                    }
                    { this.state.showText2 &&
                    <View style={intro_styles.text2}>
                        <Text style={intro_styles.instructions_text}>{this.state.text2text}</Text>
                    </View>
                    }
                    <View style={intro_styles.game}>
                     { this.state.showTiles &&
                        <View>
                           <View style={intro_styles.tile_row} >
                                <Tile opac={0} ref={(a) => { this.a = a; }}  text={ 'nthebegi' } nextFrag={ 'nthebegi' } onDrop={ (text)=>{ this.onDrop(text); }} sounds={ this.state.useSounds }/>
                                <GrayTile ref={(b) => { this.b = b; }} text={ 'sandt' } nextFrag={ this.state.nextFrag } onDrop={ (text)=>{ this.onDrop(text); }} sounds={ this.state.useSounds }/>
                                <GrayTile ref={(c) => { this.c = c; }} text={ 'edtheh' } nextFrag={ this.state.nextFrag } onDrop={ (text)=>{ this.onDrop(text); }} sounds={ this.state.useSounds }/>
                            </View>
                            <View style={intro_styles.tile_row} >
                                <Tile ref={(d) => { this.d = d; }} text={ 'taerc' } nextFrag={ 'creat' } onDrop={ (text)=>{ this.onDrop(text); }} sounds={ this.state.useSounds }/>
                                <GrayTile ref={(e) => { this.e = e; }} text={ 'eaven' } nextFrag={ this.state.nextFrag } onDrop={ (text)=>{ this.onDrop(text); }} sounds={ this.state.useSounds }/>
                                <Tile opac={0} ref={(f) => { this.f = f; }} text={ 'ninggod' } nextFrag={ this.state.nextFrag } onDrop={ (text)=>{ this.onDrop(text); }} sounds={ this.state.useSounds }/>
                            </View>
                            <View style={intro_styles.tile_row} >
                                <GrayTile ref={(g) => { this.g = g; }} text={ 'heearth' } nextFrag={ this.state.nextFrag } onDrop={ (text)=>{ this.onDrop(text); }} sounds={ this.state.useSounds }/>
                            </View>
                        </View>
                    }
                    </View>
                    { this.state.showFooter &&
                    <View style={[intro_styles.footer, this.footerBorder(this.state.bgColor), this.headerFooterColor(this.state.bgColor)]}>
                        <View style={{padding: height*.015}} onStartShouldSetResponder={()=>this.goSomewhere()}>
                            <Text style={intro_styles.footer_text}>Skip</Text>
                        </View>
                        <View style={{height:height*.09, width: height*.09, alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={intro_styles.footer_text}></Text>
                        </View>
                    </View>
                    }
                </View>
                {this.state.shouldShowDropdown &&
                        <DropdownMenu onPress={(num)=>{ this.onDropdownSelect(num); }} item1={this.state.soundString} item2={'Reset Verse'} item3={'How to Play'}/>
                }
            </View>
        );
    }
}



const intro_styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 6,
        width: width,
        borderBottomWidth: 6,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        width: normalize(height*0.077),
        height: normalize(height*0.077)
    },
    tablet: {
        marginTop: 6,
        flex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        width: width,
    },
    biblegraphic: {
        position: 'absolute',
        top: height*.008,
        left: (width-(height*.478))/2,
        height: height*.29,
        width: height*.478,
    },
    text1: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: width,
        height: height*.15,
        top: height*.48,
        paddingHorizontal: height*.06
    },
    text2: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: width,
        height: height*.15,
        top: height*.722,
        paddingHorizontal: height*.06
    },
    letter: {
        position: 'absolute',
        top: height*.052,
        left: (width-(height*.478))/2 + height*.058,
        width: height*.08,
        height: height*.083,
    },
    verse_container: {
        flex: 1,
        position: 'absolute',
        top: height*.05,
        left: (width-(height*.478))/2 + height*.063,
        width: width*.75,
        height: height*.25,
    },
    first_line: {
        flex: 1,
        paddingLeft: height*.075,
    },
    line: {
        flex: 1,
    },
    verse_text: {
        fontSize: normalizeFont(configs.LETTER_SIZE*0.09),
        color: '#000000',
        fontFamily: 'Book Antiqua',
    },
    verse_panel_container: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
        width: width,
    },
    verse_panel: {
        alignItems: 'center',
        justifyContent: 'center',
        width: height/3.5,
        height: height/20,
        borderWidth: StyleSheet.hairlineWidth,
    },
    panel_text: {
        fontSize: normalizeFont(configs.LETTER_SIZE*0.08),
        color: '#ffffff'
    },
    instructions_text: {
        fontSize: normalizeFont(configs.LETTER_SIZE*0.1),
        color: '#000000',
        textAlign: 'center',

    },
    game: {
        flex: 16,
        marginTop: 6,
        alignItems: 'center',
        justifyContent: 'center',
        width: width,
    },
    footer: {
        flex: 3,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: width,
        borderTopWidth: 6,
        paddingHorizontal: normalize(height*0.01),
    },
    footer_text: {
        fontSize: normalizeFont(configs.LETTER_SIZE*0.14),
        fontWeight: 'bold',
        color: '#ffffff',
    },
    hint_container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: normalize(height*0.12),
        height: normalize(height*0.085),
    },
    hint_button: {
        height: height/23,
        width: height/9,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#486bdd',
        borderRadius: 15,
    },
    hint_text: {
        fontSize: normalizeFont(configs.LETTER_SIZE*0.094),
        color: '#ffffff',
        fontWeight: 'bold',
    },
    tile_row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    next_arrow: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: width,
        height: height/5.5,
        top: height*.6,
    },
    after_buttons: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: width,
        top: height*.7,
        height: height/4,
    },
    button_image: {
        width: 60,
        height: 60,
        margin: 3
    }
});

module.exports = Intro2;