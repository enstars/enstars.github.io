import {
  Alert,
  Anchor,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { IconAlertCircle, IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { useForm } from "@mantine/form";

import { getLayout } from "components/Layout";
import getServerSideUser from "services/firebase/getServerSideUser";
import { sendPasswordReset } from "services/firebase/firestore";
import z from "zod";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { CONSTANTS } from "services/makotools/constants";

function Page() {
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
  const [showEmailFromUsername, setShowEmailFromUsername] = useState<
    string | boolean | null
  >(null);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [errorMessage, setError] = useState<string | null>(null);
  const [captchaComplete, setCaptchaComplete] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: "",
    },
  });

  return (
    <Container
      pt="lg"
      style={{ height: "100%", maxWidth: 400, transform: "translateY(25%)" }}
    >
      <Anchor
        component={Link}
        href="/login"
        id="signin-back-link"
        size="sm"
        color="dimmed"
        mb="sm"
        style={{ display: "block" }}
      >
        Back to Login
      </Anchor>
      {emailSent && (
        <Alert color="green" mb="md" icon={<IconCheck />}>
          A password reset link has been sent to your email address.
        </Alert>
      )}
      {errorMessage && (
        <Alert color="red" mb="md" icon={<IconX />}>
          An error occurred: {errorMessage}
        </Alert>
      )}
      <Paper radius="md" p="md" withBorder sx={{ width: "100%" }}>
        <Title order={2} size="lg" mb="sm">
          Forgot password?
        </Title>
        <Text size="sm" mb="md" color="dimmed">
          First, let's locate your account.
        </Text>
        <form
          id="send-password-reset"
          onSubmit={form.onSubmit(async (values) => {
            setIsEmailValid(null);
            setShowEmailFromUsername(null);
            try {
              if (z.string().email().safeParse(values.email).success) {
                const res = await axios.post("/api/email/validate", {
                  email: values.email,
                });
                const isValid = res.data.valid;
                if (isValid) {
                  setIsEmailValid(true);
                } else {
                  setIsEmailValid(false);
                }
              } else {
                const res = await axios.post("/api/username/email", {
                  username: values.email,
                  censored: true,
                });
                const email = res.data.email;
                setShowEmailFromUsername(email);
              }
            } catch {
              if (z.string().email().safeParse(values.email)) {
                setIsEmailValid(false);
              } else {
                setShowEmailFromUsername(false);
              }
            }
          })}
        >
          <Stack>
            <TextInput
              label="Email Address or Username"
              placeholder="MakoTools account email address or username"
              required
              {...form.getInputProps("email")}
            />
            <Button
              type="submit"
              variant={
                isEmailValid || showEmailFromUsername ? "outline" : "filled"
              }
            >
              Find User
            </Button>
            {isEmailValid && (
              <Box mt={8}>
                <Alert color="lime" title="Success!">
                  An account associated with the given email has been found!
                  Click the button below to send a password reset link to the
                  provided email.
                </Alert>
                <Button
                  mt={8}
                  disabled={!!!captchaComplete}
                  onClick={() => {
                    sendPasswordReset(
                      form.values.email,
                      setEmailSent,
                      setError
                    );
                  }}
                  fullWidth
                >
                  Send Password Reset Link
                </Button>
              </Box>
            )}
            {showEmailFromUsername && (
              <Box mt={8}>
                <Alert color="lime" title="Success!">
                  The following email address has been found for this username:
                  <Text weight="bold">{showEmailFromUsername}</Text>Click the
                  button below to send a password reset link to this email
                  address.
                </Alert>
                <Button
                  mt={8}
                  fullWidth
                  disabled={!!!captchaComplete}
                  onClick={async () => {
                    try {
                      const res = await axios.post("/api/username/email", {
                        username: form.values.email,
                        censored: false,
                      });
                      const addy = res.data.email;
                      sendPasswordReset(addy, setEmailSent, setError);
                    } catch {}
                  }}
                >
                  Send Password Reset Link
                </Button>
              </Box>
            )}
            {isEmailValid === false && (
              <Box mt={8}>
                <Alert
                  icon={<IconAlertCircle size={20} />}
                  title="Error"
                  color="red"
                >
                  An account with this email address could not be found. Please
                  try another email address or{" "}
                  <Anchor component={Link} href="/login">
                    register a new account
                  </Anchor>{" "}
                  with the given address.
                </Alert>
              </Box>
            )}
            {showEmailFromUsername === false && (
              <Box mt={8}>
                An account with that username doesn't exist. Please use a known
                email address or{" "}
                <Anchor component={Link} href="/login">
                  register a new account
                </Anchor>
                .
              </Box>
            )}
            {(isEmailValid || showEmailFromUsername) && (
              <ReCAPTCHA
                sitekey={CONSTANTS.KEYS.CAPTCHA}
                onChange={(value) => {
                  setCaptchaComplete(value);
                }}
              />
            )}
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export const getServerSideProps = getServerSideUser(() => {
  return { props: {} };
});
Page.getLayout = getLayout({
  hideSidebar: true,
  hideFooter: true,
  hideHeader: true,
});

export default Page;
