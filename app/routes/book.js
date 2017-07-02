import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableHighlight, ListView, BackHandler, AsyncStorage, ActivityIndicator, AppState } from 'react-native';
import moment from 'moment';
import Button from '../components/Button';
import configs from '../config/configs';
import { normalize, normalizeFont }  from '../config/pixelRatio';
shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
invertColor = (hex,bw)  => {
    if (hex.indexOf('#') == 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length == 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length != 6) {
        throw new Error('Invalid HEX color.');
    }
    let r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}
shadeColor = (color, percent) => {
    percent = percent/100;
    let f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}
let SideMenu = require('react-native-side-menu');
let Menu = require('../nav/menu');
let homeData = {};
const styles = require('../styles/styles');
const {width, height} = require('Dimensions').get('window');
const NUM_WIDE = 3;
const CELL_WIDTH = Math.floor(width/NUM_WIDE); // one tile's fraction of the screen width
const CELL_PADDING = Math.floor(CELL_WIDTH * .05) + 5; // 5% of the cell width...+
const TILE_WIDTH = (CELL_WIDTH - CELL_PADDING * 2) - 7;
const BORDER_RADIUS = CELL_PADDING * .2 + 3;
const KEY_daily_solved_array = 'solved_array';
const KEY_Time = 'timeKey';

class Book extends Component{
    constructor(props) {
        super(props);
//        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.dataSource = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        })
        this.state = {
            id: 'book',
            homeData: this.props.homeData,
            title: this.props.title,
            isOpen: false,
            dataSource: this.props.homeData[this.props.dataElement].verses,
//            dataSource: ds.cloneWithRows(Array.from(new Array(parseInt(this.props.homeData[this.props.dataElement].num_verses, 10)), (x,i) => i)),
            bgColor: this.props.bgColor,
            headerColor: '',
            titleColor: '',
            isLoading: true,
        };
        this.handleHardwareBackButton = this.handleHardwareBackButton.bind(this);
    }
    componentDidMount() {
        homeData = this.state.homeData;
        this.setColors();
        AppState.addEventListener('change', this.handleAppStateChange);
        BackHandler.addEventListener('hardwareBackPress', this.handleHardwareBackButton);
        setTimeout(() => {this.stopSpinner()}, 10);
    }
    componentWillUnmount () {
        BackHandler.removeEventListener('hardwareBackPress', this.handleHardwareBackButton);
        AppState.removeEventListener('change', this.handleAppStateChange);
    }
    handleAppStateChange=(appState)=>{
        if(appState == 'active'){
            var timeNow = moment().valueOf();
            AsyncStorage.getItem(KEY_Time).then((storedTime) => {
                var sT = JSON.parse(storedTime);
                var diff = (timeNow - sT)/1000;
                if(diff>7200){
                    try {
                        AsyncStorage.setItem(KEY_Time, JSON.stringify(timeNow));
                    } catch (error) {
                        window.alert('AsyncStorage error: ' + error.message);
                    }
                    this.props.navigator.replace({
                        id: 'splash',
                        passProps: {
                            motive: 'initialize'
                        }
                    });
                }else{
                    try {
                        AsyncStorage.setItem(KEY_Time, JSON.stringify(timeNow));
                    } catch (error) {
                        window.alert('AsyncStorage error: ' + error.message);
                    }
                }
            });
        }
    }
    stopSpinner(){
        this.setState({isLoading: false});
    }
    setColors(){
        let bgC = this.props.bgColor;
        let fieldColor = (bgC == '#cfe7c2')? '#cfe7c2':shadeColor(bgC, 10);
        let headColor = (bgC == '#cfe7c2')? '#2B0B30':shadeColor(bgC, -20);
        let titletextColor = (bgC == '#cfe7c2')? '#9eacda':invertColor(headColor, true);
        this.setState({
            bgColor: fieldColor,
            headerColor: headColor,
            titleColor: titletextColor,
        });
    }
    handleHardwareBackButton() {
        if (this.state.isOpen) {
            this.toggle();
            return true;
        }else{
            let myPackArray = [];
            let str = '';
            for (let key in homeData){
                if (homeData[key].type == 'mypack'){
                    myPackArray.push(homeData[key].title);
                }
            }
            var levels = [5, 5, 6, 7];
            var taken = -1;
            for(var i=0; i<4; i++){
                var titleIndex = -1;
                var rnd = Array.from(new Array(homeData[levels[i]].data.length), (x,i) => i);
                rnd = shuffleArray(rnd);
                for (var r=0; r<rnd.length; r++){
                    if (myPackArray.indexOf(homeData[levels[i]].data[rnd[r]].name) < 0 && rnd[r] != taken){
                        titleIndex = rnd[r];
                        taken = rnd[r];
                        myPackArray.push(homeData[r].title);
                        break;
                    }
                }
                if (titleIndex > -1){
                    homeData[18 + i].title = '*' + homeData[levels[i]].data[titleIndex].name;
                    homeData[18 + i].product_id = homeData[levels[i]].data[titleIndex].product_id;
                    homeData[18 + i].num_verses = homeData[levels[i]].data[titleIndex].num_verses;
                    homeData[18 + i].bg_color = homeData[levels[i]].data[titleIndex].color;
                }else{
                    homeData[18 + i].show = 'false';
                }
            }
            try {
                this.props.navigator.replace({
                    id: 'home',
                    passProps: {
                        homeData: homeData,
                    }
                });
                return true;
            } catch(err)  {
                return false;
            }
        }
    }
    toggle() {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }
    updateMenuState(isOpen) {
        this.setState({ isOpen: isOpen });
    }
    onMenuItemSelected = (item) => {
            var myPackArray = [];
            var keepInList = [];
            switch (item.link){
                case 'home':
                    this.props.navigator.replace({
                        id: 'home',
                        passProps: {
                            homeData: this.props.homeData,
                        }
                    });
                    break;
                case 'game':
                    this.props.navigator.replace({
                        id: 'game',
                        passProps: {
                            homeData: this.props.homeData,
                            daily_solvedArray: this.props.sArray,
                            title: this.props.todayFull,
                            index: '0',
                            bgColor: '#055105',
                            fromWhere: 'home',
                            dataElement: '16',
                            isPremium: this.props.isPremium
                        },
                    });
                    return;
                case 'daily':
                    if(this.props.isPremium == 'true'){
                        this.goToDaily('18');
                    }else{
                        this.goToDaily('17');
                    }
                    break;
                case 'intro':
                    this.props.navigator.push({
                        id: 'intro',
                        passProps: {
                            destination: 'collection',
                            homeData: this.props.homeData,
                            introIndex: 1,
                            seenIntro: 'true'
                        }
                    });
                    break;
                case 'store':
                    for (var j=0; j<this.props.homeData.length; j++){
                        if (this.props.homeData[j].type == 'mypack'){
                            myPackArray.push(this.props.homeData[j].title);
                        }
                    }
                    for (var i=this.props.homeData[item.index].data.length - 1; i>=0; i--){
                        if(myPackArray.indexOf(this.props.homeData[item.index].data[i].name) < 0){
                            keepInList.push(this.props.homeData[item.index].data[i]);
                        }
                    }
                    keepInList = keepInList.reverse();
                    this.props.navigator.push({
                        id: 'store',
                        passProps: {
                            dataIndex: item.index,
                            title: item.title + ' Puzzle Packs',
                            availableList: keepInList,
                            homeData: this.props.homeData,
                        }
                    });
                    break;
                case 'store3':
                    if(this.props.homeData[item.index].data.length == 0){
                        Alert.alert('Coming soon...', 'Sorry, no combo packs available yet; please check back!');
                        return;
                    }
                    keepInList = this.props.homeData[item.index].data;

                    for (var j=0; j<this.props.homeData.length; j++){
                        if (this.props.homeData[j].type == 'mypack'){
                            myPackArray.push(this.props.homeData[j].title);
                        }
                    }
                    for (var i=this.props.homeData[item.index].data.length - 1; i>=0; i--){
                        if((myPackArray.indexOf(this.props.homeData[item.index].data[i].name[0]) > -1) && (myPackArray.indexOf(this.props.homeData[item.index].data[i].name[1]) > -1) && (myPackArray.indexOf(this.props.homeData[item.index].data[i].name[2]) > -1)){
                            keepInList.splice(i, 1);
                        }
                    }
                    this.props.navigator.push({
                        id: 'combo store',
                        passProps: {
                            dataIndex: item.index,
                            title: item.title + ' Value Packs',
                            availableList: keepInList,
                            homeData: this.props.homeData,
                        }
                    });
                    break;
                case 'facebook':
                    this.props.navigator.push({
                        id: 'social',
                        passProps: {
                            which: 'FB',
                            color: '#3b5998',
                            homeData: this.props.homeData,
                        }
                    });
                    break;
                case 'twitter'://#1da1f2
                    this.props.navigator.push({
                        id: 'social',
                        passProps: {
                            which: 'TW',
                            color: '#1da1f2',
                            homeData: this.props.homeData,
                        }
                    });
                    break;
                case 'settings':
                    this.props.navigator.push({
                        id: 'settings',
                        passProps: {
                            destination: 'collection',
                            homeData: this.props.homeData,
                        }
                    });
                    break;
                case 'about':
                    this.props.navigator.push({
                        id: 'about',
                        passProps: {
                            destination: 'collection',
                            homeData: this.props.homeData,
                        }
                    });
                    break;
            }
    }
    border(color) {
        return {
            borderColor: color,
            borderWidth: 2,
        };
    }
    darkBorder(color) {
        var darkerColor = shadeColor(color, -60);
            return {borderColor: darkerColor};
    }
    bg(num){
         let strToReturn='';
         let numberSolved = parseInt(this.props.homeData[this.props.dataElement].num_solved, 10);
         let numPuzzles = parseInt(this.props.homeData[this.props.dataElement].num_verses, 10);
         if (numberSolved == numPuzzles){
//            strToReturn = (this.props.homeData[this.props.dataElement].solved[num] == 0)?'#00FF00':'#079707';
            return {
                backgroundColor: '#00FF00'
            };
         }
         let onThis = parseInt(this.props.homeData[this.props.dataElement].num_solved, 10);
         if(num==onThis){
             strToReturn='#00FF00';
             }else if(num<onThis){
             strToReturn='#079707';
             }else{
             strToReturn='#999ba0';
         }
         return {
             backgroundColor: strToReturn
         };
    }
    getUnderlay(num){
         let strToReturn='';
         let onThis = parseInt(this.props.homeData[this.props.dataElement].num_solved, 10);
         let numPuzzles = parseInt(this.props.homeData[this.props.dataElement].num_verses, 10);
         if (onThis == numPuzzles){
            strToReturn = (this.props.homeData[this.props.dataElement].solved[num] == 0)?'#00FF00':'#079707';
            return strToReturn;
         }
         if(num==onThis){
             strToReturn='#00FF00';
             }else if(num<onThis){
             strToReturn='#079707';
             }else{
             strToReturn='#999ba0';
             }

         return strToReturn;
    }
    getBorder(num){
         let strToReturn='';
         let onThis = parseInt(this.props.homeData[this.props.dataElement].num_solved, 10);
         let numPuzzles = parseInt(this.props.homeData[this.props.dataElement].num_verses, 10);
         if (onThis == numPuzzles){
            strToReturn = (this.props.homeData[this.props.dataElement].solved[num] == 0)?'#00FF00':'#00a700';
            return {borderColor: strToReturn};
         }
         if(num==onThis){
             strToReturn='#0F0';
             }else if(num<onThis){
                 strToReturn='#00a700';
             }else{
                 strToReturn='#7e867e';
             }
         return {borderColor: strToReturn};
    }
    getText(verse){
        let verseArray = verse.split('**');
        return verseArray[1];

    }
    goToDaily(index){
        let sArray = [];
        let gripeText = (this.props.isPremium == 'true')?'':'Purchase any item in the app and always have access here to the previous 30 Daily Verses!';

        AsyncStorage.getItem(KEY_daily_solved_array).then((theArray) => {
            if (theArray !== null) {
              sArray = JSON.parse(theArray);
            }
            this.props.navigator.replace({
                id: 'daily',
                passProps: {
                    homeData: this.props.homeData,
                    daily_solvedArray: sArray,
                    title: 'Daily Verses',
                    todayFull: this.props.todayFull,
                    gripeText: gripeText,
                    dataElement: index,
                    bgColor: '#055105'
                },
            });
        });
    }
    launchReader(){
        window.alert('Launch Reader...');

    }
    onSelect(verseStr, index) {
        let bgC = this.props.bgColor;
        let newColor = (bgC == '#000000')? '#cfe7c2':this.props.bgColor;
        this.props.navigator.replace({
            id: 'game',
            passProps: {
                homeData: this.props.homeData,
                title: this.getText(verseStr),
                index: index,
                fromWhere: 'book',
                daily_solvedArray: this.props.daily_solvedArray,
                dataElement: this.props.dataElement,
                bgColor: newColor,
                myTitle: this.props.title
            },
       });
    }

    render() {
        const menu = <Menu onItemSelected={ this.onMenuItemSelected } data = {this.props.homeData} />;
        const ds = this.dataSource.cloneWithRows(this.props.homeData[this.props.dataElement].verses);
        if(this.state.isLoading == true){
            return(
                <View style={[collection_styles.loading, {backgroundColor: '#222222'}]}>
                    <ActivityIndicator animating={true} size={'large'}/>
                </View>
            )
        }else{
            return (
                <SideMenu
                    menu={ menu }
                    isOpen={ this.state.isOpen }
                    onChange={ (isOpen) => this.updateMenuState(isOpen) }>

                    <View style={ [collection_styles.container, {backgroundColor: this.state.bgColor}, this.darkBorder(this.state.bgColor)] }>
                        <View style={ [collection_styles.header, {backgroundColor: this.state.headerColor}]}>
                            <Button style={collection_styles.button} onPress={ () => this.handleHardwareBackButton() }>
                                <Image source={ require('../images/arrowback.png') } style={ { width: normalize(height*0.07), height: normalize(height*0.07) } } />
                            </Button>
                            <Text style={{fontSize: configs.LETTER_SIZE * 0.7, color: this.state.titleColor}} >{this.props.title}</Text>
                            <Button style={collection_styles.button} onPress={ () => this.launchReader()}>
                                <Image source={ require('../images/bible.png') } style={ { width: normalize(height*0.1), height: normalize(height*0.1) } } />
                            </Button>
                        </View>
                        <View style={ [collection_styles.tiles_container, {backgroundColor: this.state.bgColor}, this.darkBorder(this.state.bgColor)] }>
                             <ListView  showsVerticalScrollIndicator ={false}
                                        initialListSize ={100}
                                        contentContainerStyle={ collection_styles.listview }
                                        dataSource={ds}
                                        renderRow={(rowData, sectionID, rowID) =>
                                         <View>
                                             <TouchableHighlight onPress={() => this.onSelect(rowData, rowID)}
                                                                 style={collection_styles.launcher} >
                                                 <Text style={ collection_styles.launcher_text }>{this.getText(rowData)}</Text>
                                             </TouchableHighlight>
                                         </View>}
                             />
                        </View>
                     </View>
                </SideMenu>
            );
        }
    }
}


const collection_styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: window.width,
        marginBottom: 10
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        width: normalize(height*0.077),
        height: normalize(height*0.077)
    },
    listview: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
    },
    tiles_container: {
        flex: 11,
        paddingLeft: 6,
        paddingRight: 6,
    },
    launcher: {
        width: height*.25,
        height: height*.05,
        borderRadius: 2,
        borderWidth: 1,
        margin: height*.005,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff'
    },
    launcher_text: {
        fontSize: normalizeFont(configs.LETTER_SIZE*.075),
        fontWeight: 'bold'
    }
});

module.exports = Book;