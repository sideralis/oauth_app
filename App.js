import React from 'react';
import { UIManager, LayoutAnimation, Alert } from 'react-native';
import { authorize, refresh, revoke } from 'react-native-app-auth';
import { Page, Button, ButtonContainer, Form, Heading } from './components';

UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);

const config = {
    clientId: 'bEK8Z3VwdoUl5djZwlsza1LV',
    clientSecret: '20Xf8Dtc1HFnLHGZohg3LivjmwEQEN1ZGG1wgjxl69IftM2M',
    redirectUrl: 'com.ochrin.app:/callback',
    additionalParameters: {},
    scopes: ['profile'],
    serviceConfiguration: {
        authorizationEndpoint: 'http://192.168.1.83:5000/oauth/authorize',
        tokenEndpoint: 'http://192.168.1.83:5000/oauth/token',
        revocationEndpoint: 'http://192.168.1.83:5000/oauth/revoke'
    },
    usePKCE: false,
    dangerouslyAllowInsecureHttpRequests: true
};

export default class App extends React.Component {
    state = {
        hasLoggedInOnce: false,
        accessToken: '',
        accessTokenExpirationDate: '',
        refreshToken: '',
        user: ''
    };

    animateState(nextState, delay = 0) {
        setTimeout(() => {
            this.setState(() => {
                LayoutAnimation.easeInEaseOut();
                return nextState;
            });
        }, delay);
    }

    authorize = async () => {
        try {
            const authState = await authorize(config);
            this.animateState(
                {
                    hasLoggedInOnce: true,
                    accessToken: authState.accessToken,
                    accessTokenExpirationDate: authState.accessTokenExpirationDate,
                    refreshToken: authState.refreshToken,
                    scopes: authState.scopes
                },
                500
            );
        } catch (error) {
            Alert.alert('Failed to log in', error.message);
        }
    };

    refresh = async () => {
        try {
            const authState = await refresh(config, {
                refreshToken: this.state.refreshToken
            });

            this.animateState({
                accessToken: authState.accessToken || this.state.accessToken,
                accessTokenExpirationDate:
                    authState.accessTokenExpirationDate || this.state.accessTokenExpirationDate,
                refreshToken: authState.refreshToken || this.state.refreshToken
            });
        } catch (error) {
            Alert.alert('Failed to refresh token', error.message);
        }
    };

    revoke = async () => {
        try {
            await revoke(config, {
                tokenToRevoke: this.state.accessToken,
                sendClientId: true
            });
            this.animateState({
                accessToken: '',
                accessTokenExpirationDate: '',
                refreshToken: ''
            });
        } catch (error) {
            Alert.alert('Failed to revoke token', error.message);
        }
    };

    getData = async () => {
        fetch
    }

    getData = async () => {
        fetch('http://192.168.1.83:5000/api/me', {
            headers: {
                'Authorization': `Bearer ${this.state.accessToken}`
            }
        }).then(response => response.json())
            .then(data => {
                this.animateState({ user: data })
            })
            .catch(error => console.error(error));
    };

    render() {
        const { state } = this;
        return (
            <Page>
                {!!state.accessToken ? (
                    <Form>
                        <Form.Label>accessToken</Form.Label>
                        <Form.Value>{state.accessToken}</Form.Value>
                        <Form.Label>accessTokenExpirationDate</Form.Label>
                        <Form.Value>{state.accessTokenExpirationDate}</Form.Value>
                        <Form.Label>refreshToken</Form.Label>
                        <Form.Value>{state.refreshToken}</Form.Value>
                        <Form.Label>scopes</Form.Label>
                        <Form.Value>{state.scopes.join(', ')}</Form.Value>
                        <Form.Label>user</Form.Label>
                        <Form.Value>{JSON.stringify(state.user)}</Form.Value>
                    </Form>
                ) : (
                        <Heading>{state.hasLoggedInOnce ? 'Goodbye.' : 'Hello, stranger.'}</Heading>
                    )}

                <ButtonContainer>
                    {!state.accessToken ? (
                        <Button onPress={this.authorize} text="Authorize" color="#DA2536" />
                    ) : null}
                    {!!state.refreshToken ? (
                        <Button onPress={this.refresh} text="Refresh" color="#24C2CB" />
                    ) : null}
                    {!!state.accessToken ? (
                        <Button onPress={this.revoke} text="Revoke" color="#EF525B" />
                    ) : null}
                    {!!state.accessToken ? (
                        <Button onPress={this.getData} text="Get data" color="#EF525B" />
                    ) : null}

                </ButtonContainer>
            </Page>
        );
    }
}