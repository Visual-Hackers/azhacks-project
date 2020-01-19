import React, {
    Component
} from 'react';
import axios from "axios/index";
import {
    withRouter
} from 'react-router-dom';

import Cookies from 'universal-cookie';
import {
    v4 as uuid
} from 'uuid';

import Message from './Message';
import Card from './Card';

const cookies = new Cookies();

class Chatbot extends Component {
    messagesEnd;
    talkInput;

    constructor(props) {
        super(props);
        // This binding is necessary to make `this` work in the callback
        this._handleInputKeyPress = this._handleInputKeyPress.bind(this);

        this.state = {
            messages: [],
            shopWelcomeSent: false,
        };
        if (cookies.get('userID') === undefined) {
            cookies.set('userID', uuid(), {
                path: '/'
            });
        }
    }

    async df_text_query(text) {
        let says = {
            speaks: 'user',
            msg: {
                text: {
                    text: text
                }
            }
        }
        this.setState({
            messages: [...this.state.messages, says]
        });
        const request = {
            queryInput: {
                text: {
                    text: text,
                    languageCode: 'en-US',
                },
            }
        };
        await this.df_client_call(request);
    };



    async df_event_query(event) {

        const request = {
            queryInput: {
                event: {
                    name: event,
                    languageCode: 'en-US',
                },
            }
        };

        await this.df_client_call(request);

    };

    async df_client_call(request) {

        try {

            if (this.state.clientToken === false) {
                const res = await axios.get('/api/get_client_token');
                this.setState({
                    clientToken: res.data.token
                });
            }

            var config = {
                headers: {
                    'Authorization': "Bearer " + this.state.clientToken,
                    'Content-Type': 'application/json; charset=utf-8'
                }
            };


            const res = await axios.post(
                'https://dialogflow.googleapis.com/v2/projects/' + process.env.REACT_APP_GOOGLE_PROJECT_ID +
                '/agent/sessions/' + process.env.REACT_APP_DF_SESSION_ID + cookies.get('userID') + ':detectIntent',
                request,
                config
            );

            let says = {};

            if (res.data.queryResult.fulfillmentMessages) {
                for (let msg of res.data.queryResult.fulfillmentMessages) {
                    says = {
                        speaks: 'bot',
                        msg: msg
                    }
                    this.setState({
                        messages: [...this.state.messages, says]
                    });
                }
            }
        } catch (e) {
            console.log(e);
            if (e.response.status === 401 && this.state.regenerateToken < 1) {
                this.setState({
                    clientToken: false,
                    regenerateToken: 1
                });
                this.df_client_call(request);
            } else {
                let says = {
                    speaks: 'bot',
                    msg: {
                        text: {
                            text: "I'm having troubles. I need to terminate. will be back later"
                        }
                    }
                }
                this.setState({
                    messages: [...this.state.messages, says]
                });
                let that = this;
                setTimeout(function () {
                    that.setState({
                        showBot: false
                    })
                }, 2000);
            }
        }

    }

    resolveAfterXSeconds(x) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(x);
            }, x * 1000);
        })
    }

    async componentDidMount() {
        this.df_event_query('Welcome');

        if (window.location.pathname === '/shop' && !this.state.shopWelcomeSent) {
            await this.resolveAfterXSeconds(1);
            this.df_event_query('WELCOME_SHOP');
            this.setState({
                shopWelcomeSent: true,
                showBot: true
            });
        }

        this.props.history.listen(() => {
            if (this.props.history.location.pathname === '/shop' && !this.state.shopWelcomeSent) {
                this.df_event_query('WELCOME_SHOP');
                this.setState({
                    shopWelcomeSent: true,
                    showBot: true
                });
            }
        });
    }

    componentDidUpdate() {
        this.messagesEnd.scrollIntoView({
            behavior: "smooth"
        });
        if (this.talkInput) {
            this.talkInput.focus();
        }
    }

    renderCards(cards) {
        return cards.map((card, i) => < Card key = {
                i
            }
            payload = {
                card
            }
            />);
        }

        renderOneMessage(message, i) {

            if (message.msg && message.msg.text && message.msg.text.text) {
                return <Message key = {
                    i
                }
                speaks = {
                    message.speaks
                }
                text = {
                    message.msg.text.text
                }
                />;
            } else if (message.msg && message.msg.payload.fields.cards) { //message.msg.payload.fields.cards.listValue.values

                return <div key = {
                        i
                    } >
                    <
                    div className = "card-panel green lighten-5 z-depth-1" >
                    <
                    div style = {
                        {
                            overflow: 'hidden'
                        }
                    } >
                    <
                    div className = "col s2" >
                    <
                    a href = "/"
                className = "btn-floating btn-large waves-effect waves-light purple" > {
                    message.speaks
                } < /a> < /
                div > <
                    div style = {
                        {
                            overflow: 'auto',
                            overflowY: 'scroll'
                        }
                    } >
                    <
                    div style = {
                        {
                            height: 300,
                            width: message.msg.payload.fields.cards.listValue.values.length * 270
                        }
                    } > {
                        this.renderCards(message.msg.payload.fields.cards.listValue.values)
                    } < /div>  < /
                    div > <
                    /div>  < /
                    div > <
                    /div>
            }
        }

        renderMessages(returnedMessages) {
            if (returnedMessages) {
                return returnedMessages.map((message, i) => {
                    return this.renderOneMessage(message, i);
                })
            } else {
                return null;
            }
        }

        _handleInputKeyPress(e) {
            if (e.key === 'Enter') {
                this.df_text_query(e.target.value);
                e.target.value = '';
            }
        }

        render() {
              return (<
                  div style = {
                      {
                          minHeight: 500,
                          width: '100%',
                          border: '1px solid lightgray'
                      }
                  }>
                  <
                  div id = "chatbot"
                  style = {
                      {
                          minHeight: 388,
                          maxHeight: 388,
                          width: '100%',
                          overflow: 'auto'
                      }
                  }>
                  {
                      this.renderMessages(this.state.messages)
                  } <
                  div ref = {
                      (el) => {
                          this.messagesEnd = el;
                      }
                  }
                  style = {
                      {
                          float: "left",
                          clear: "both"
                      }
                  } >
                  <
                  /div> < /
                  div > <
                  div className = " col s12" >
                  <
                  input style = {
                      {
                          margin: 0,
                          paddingLeft: '1%',
                          paddingRight: '1%',
                          width: '98%'
                      }
                  }
                  ref = {
                      (input) => {
                          this.talkInput = input;
                      }
                  }
                  placeholder = "ask a question"
                  onKeyPress = {
                      this._handleInputKeyPress
                  }
                  id = "user_says"
                  type = "text" / >
                  <
                  /div>
                  <
                  /div>
              );
        }
    }

    export default withRouter(Chatbot);
