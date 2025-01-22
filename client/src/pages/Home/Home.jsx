import React from 'react'
import styled from 'styled-components'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Benefits from './components/Benefits'
import SignUp from '../../components/SignUp'
import SignIn from '../../components/SignIn'

const Body = styled.div`
    background: #13111C;
    display: flex;
    justify-content: center;
    overflow-x: hidden;
`

const Container = styled.div`
    width: 100%;
    background-Image: linear-gradient(38.73deg, rgba(204, 0, 187, 0.25) 0%, rgba(201, 32, 184, 0) 50%), linear-gradient(141.27deg, rgba(0, 70, 209, 0) 50%, rgba(0, 70, 209, 0.25) 100%);    
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`

const Top = styled.div`
width: 100%;
display: flex;
padding-bottom: 50px;
flex-direction: column;
align-items: center;
background: linear-gradient(38.73deg, rgba(204, 0, 187, 0.15) 0%, rgba(201, 32, 184, 0) 50%), linear-gradient(141.27deg, rgba(0, 70, 209, 0) 50%, rgba(0, 70, 209, 0.15) 100%);
clip-path: polygon(0 0, 100% 0, 100% 100%,50% 95%, 0 100%);
@media (max-width: 768px) {
    clip-path: polygon(0 0, 100% 0, 100% 100%,50% 98%, 0 100%);
    padding-bottom: 0px;
}
`;
const Content = styled.div`
    width: 100%;
    height: 100%;
    background: #13111C;
    display: flex;
    flex-direction: column;
`

const Home = () => {
    const [SignInOpen, setSignInOpen] = React.useState(false);
    const [SignUpOpen, setSignUpOpen] = React.useState(false);

    return (
        <Body>
            <Container>
                <Top>
                    <Navbar setSignInOpen={setSignInOpen} />
                    <Hero setSignInOpen={setSignInOpen} />
                </Top>
                <Content>
                    <Features />
                    <Benefits />
                </Content>
                {SignUpOpen && (
                    <SignUp setSignUpOpen={setSignUpOpen} setSignInOpen={setSignInOpen} />
                )}
                {SignInOpen && (
                    <SignIn setSignInOpen={setSignInOpen} setSignUpOpen={setSignUpOpen} />
                )}
            </Container>
        </Body>
    )
}

export default Home