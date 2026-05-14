import * as React from 'react';
import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface WelcomeTemplateProps {
  name: string;
  companyName: string;
}

export const WelcomeTemplate = ({ name, companyName }: WelcomeTemplateProps) => (
  <Html>
    <Head />
    <Preview>Welcome to {companyName}!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome aboard, {name}!</Heading>
        <Section style={section}>
          <Text style={text}>
            We're thrilled to have you join the team at {companyName}. Your account has been
            successfully created by your administrator.
          </Text>
          <Text style={text}>
            To get started, please log in to the portal and complete your onboarding profile.
          </Text>
          <Button style={button} href="https://app.example.com/login">
            Login to Dashboard
          </Button>
        </Section>
        <Text style={footer}>
          If you have any questions, please contact HR.
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};
const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};
const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  padding: '0 48px',
};
const section = {
  padding: '0 48px',
};
const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
};
const button = {
  backgroundColor: '#5469d4',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '210px',
  padding: '14px 7px',
  marginTop: '16px',
};
const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 48px',
  marginTop: '16px',
};

export default WelcomeTemplate;
