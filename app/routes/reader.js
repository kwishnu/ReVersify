import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Alert, BackHandler, AsyncStorage, AppState, ActivityIndicator } from 'react-native';
import Button from '../components/Button';
import configs from '../config/configs';
import { normalize, normalizeFont }  from '../config/pixelRatio';
import moment from 'moment';
const styles = require('../styles/styles');
const {width, height} = require('Dimensions').get('window');


module.exports = class Reader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 'reader',
            isLoading: true,
            title: '',
            section1: '',
            section2: '',
            section3: '',
            initial: '',
            backOpacity: 0,
            forwardOpacity: 0,
            bgColor: ''
        };
        this.goBack = this.goBack.bind(this);
    }
    componentDidMount(){
        console.log(JSON.stringify(this.props.homeData[this.props.dataElement]));

        let title = this.props.homeData[this.props.dataElement].title;
        let bg = this.props.homeData[this.props.dataElement].bg_color;
        let chapterText = this.props.homeData[this.props.dataElement].chapters[this.props.chapterIndex];
        let initialLetter = chapterText.substr(0, 1);
        chapterText = chapterText.substring(1);
        let backOpac = (this.props.chapterIndex > 0)?1:0;
        let forwardOpac = (this.props.chapterIndex < this.props.homeData[this.props.dataElement].chapters.length - 1)?1:0;

//setTimeout(() => { this.setState({ isLoading: false }); }, 500);
        this.setState({ title: title,
                        initial: initialLetter,
                        section1: chapterText,
                        section2: '',
                        section3: '',
                        backOpacity: backOpac,
                        forwardOpacity: forwardOpac,
                        bgColor: bg,
                        isLoading: false

        })
        BackHandler.addEventListener('hardwareBackPress', this.goBack);
        AppState.addEventListener('change', this.handleAppStateChange);
    }
    componentWillUnmount () {
        BackHandler.removeEventListener('hardwareBackPress', this.goBack);
        AppState.removeEventListener('change', this.handleAppStateChange);
    }
    handleAppStateChange=(appState)=>{
        if(appState == 'active'){
            this.props.navigator.replace({
                id: 'splash',
                passProps: {
                    motive: 'initialize'
                }
            });
        }
    }
    goBack() {
        try {
            this.props.navigator.pop({
                passProps: {
                    homeData: this.props.homeData,
                }
            });
        }
        catch(err) {
            window.alert(err.message);
        }
        return true;
    }
    nextChapter(direction){
        if(this.state.forwardOpacity == 0 && direction == 1)return;
        if(this.state.backOpacity == 0 && direction == -1)return;
        let newIndex = this.props.chapterIndex + direction;
        this.props.navigator.replace({
            id: 'bounce',
            passProps: {
                sender: 'reader',
                homeData: this.props.homeData,
                dataElement: this.props.dataElement,
                chapterIndex: newIndex,
            }
       });
    }

    render() {
        if(this.state.isLoading == true){
            return(
                <View style={[reader_styles.loading, {backgroundColor: '#222222'}]}>
                    <ActivityIndicator animating={true} size={'large'}/>
                </View>
            );
        }else{
            return (
                <View style={reader_styles.container}>
                    <View style={ reader_styles.header }>
                        <Button style={reader_styles.button} onPress={ () => this.goBack() }>
                            <Image source={ require('../images/arrowback.png') } style={ { width: normalize(height*0.07), height: normalize(height*0.07) } } />
                        </Button>
                        <Button style={[reader_styles.button, {opacity: this.state.backOpacity}]} onPress={ () => this.nextChapter(-1) }>
                            <Image source={ require('../images/playarrowback.png') } style={ { width: normalize(height*0.1), height: normalize(height*0.1) } } />
                        </Button>
                        <Text style={styles.header_text} >{this.state.title}</Text>
                        <Button style={[reader_styles.button, {opacity: this.state.forwardOpacity}]} onPress={ () => this.nextChapter(1)}>
                            <Image source={ require('../images/playarrowforward.png') } style={ { width: normalize(height*0.1), height: normalize(height*0.1) } } />
                        </Button>
                        <Button style={reader_styles.button}>
                            <Image source={ require('../images/noimage.png') } style={ { width: normalize(height*0.07), height: normalize(height*0.07) } } />
                        </Button>
                    </View>
                    <View style={[reader_styles.reader_container, {backgroundColor: this.state.bgColor}]}>
                        <ScrollView contentContainerStyle={reader_styles.text_container}>
                            <Text style={reader_styles.initial_text}>{this.state.initial}
                            <Text style={reader_styles.text}>{this.state.section1}
                                <Text style={reader_styles.bold_text}> {this.state.section2} </Text>
                                {this.state.section3}
                            </Text>
                            </Text>
                        </ScrollView>
                    </View>
                </View>
            );
        }
    }
}



const reader_styles = StyleSheet.create({
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
        padding: 6,
        width: width,
        backgroundColor: '#000000',
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        width: normalize(height*0.06),
        height: normalize(height*0.06)
    },
    reader_container: {
        flex: 15,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text_container: {
        width: width*.93,
        borderWidth: 2,
        borderColor: '#333333',
        backgroundColor: '#fffff0',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: height*.05,
        paddingHorizontal: height*.03,
    },
    text: {
        fontSize: normalizeFont(configs.LETTER_SIZE*0.09),
        color: '#000000',
        fontFamily: 'Book Antiqua',
    },
    bold_text: {
        fontSize: normalizeFont(configs.LETTER_SIZE*0.09),
        color: '#000000',
        fontFamily: 'Book Antiqua',
        fontWeight: 'bold'
    },
    initial_text: {
        fontSize: normalizeFont(configs.LETTER_SIZE*0.2),
        color: '#000000',
        fontFamily: 'Book Antiqua',
    },
});