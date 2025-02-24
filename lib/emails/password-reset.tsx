import { Html, Head, Body, Container, Text, Link, Preview, Img } from "@react-email/components"

interface PasswordResetEmailProps {
  resetLink: string
  userName: string
}

export default function PasswordResetEmail({ resetLink, userName }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* LOGO */}
          <Img
            src="/logo.svg" // Update with your actual logo URL
            width="150"
            height="50"
            alt="SlateChain Logo"
            style={logo}
          />
          
          <Text style={heading}>Hi {userName},</Text>
          <Text style={paragraph}>
            We received a request to reset your password. Click the button below to choose a new password:
          </Text>
          <Link href={resetLink} style={button}>
            Reset Password
          </Link>
          <Text style={paragraph}>If you didn't request this, you can safely ignore this email.</Text>
          <Text style={footer}>This link will expire in 1 hour for security reasons.</Text>
        </Container>
      </Body>
    </Html>
  )
}

const logo = {
  display: "block",
  margin: "0 auto",
  paddingBottom: "20px",
}

const main = {
  backgroundColor: "#f6f9fc",
  padding: "10px 0",
}

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  padding: "45px",
  maxWidth: "600px",
}

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  marginBottom: "20px",
}

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  marginBottom: "20px",
}

const button = {
  backgroundColor: "#000000",
  borderRadius: "5px",
  color: "#fff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "bold",
  padding: "12px 30px",
  textDecoration: "none",
  textAlign: "center" as const,
  marginBottom: "20px",
}

const footer = {
  color: "#666666",
  fontSize: "14px",
  fontStyle: "italic",
}
