import { useEffect, useState } from "react";
Login;
import {
  Container,
  Paper,
  Text,
  Button,
  Divider,
  TextInput,
  PasswordInput,
  Group,
  Anchor,
  Checkbox,
  Stack,
  Title,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertTriangle, IconBrandGoogle } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";

import useUser from "services/firebase/user";
import {
  signInWithGoogle,
  signUpWithEmail,
  signInFunction,
} from "services/firebase/authentication";
import { showNotification } from "@mantine/notifications";
import { z } from "zod";
import { FirebaseError } from "firebase-admin";

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [signOnError, setSignOnError] = useState<FirebaseError | null>(null);

  const router = useRouter();
  const { user, userDB, updateUserDB, isUserDBPending } = useUser();

  function signOnAlertMsg(error: string) {
    switch (error) {
      case "timeout":
        return (
          <span>
            The operation has timed out. Please try again or{" "}
            <Anchor inherit href="/issues">
              submit an issue
            </Anchor>{" "}
            if the problem is persistent.
          </span>
        );
      case "too-many-requests":
        return (
          <span>
            The server has received too many sign on requests. Please wait and
            try again later.
          </span>
        );
      case "email-already-in-use":
        return (
          <span>
            The email you tried to sign up with is already in use. Please try
            registering with a new email or login into the account associated
            with the provided email.
          </span>
        );
      case "taken-username":
        return (
          <span>
            The provided username is already in use. Please provide another
            username
          </span>
        );
      case "short-username":
        return (
          <span>The provided username must be 8 characters or longer</span>
        );
      default:
        return (
          <span>
            An unknown sign on error has occured. Please try again or{" "}
            <Anchor href="/issues">submit an issue</Anchor> if the problem is
            persistent.
          </span>
        );
    }
  }

  useEffect(() => {
    if (signOnError) {
      const codeRegex = /\(([^)]+)\)/;
      const errorCodeFull = signOnError.code ?? signOnError.message;
      const errorCode =
        codeRegex.exec(errorCodeFull)?.[1].split("/")[1] ??
        errorCodeFull.split("/")[1] ??
        errorCodeFull;

      switch (errorCode) {
        case "wrong-password":
          form.setFieldError(
            "password",
            "This password is incorrect. Please try again or reset your password."
          );
          break;
        case "user-not-found":
          form.setFieldError(
            "email",
            "A user with this email or username could not be found."
          );
        case "email-already-in-use":
          form.setFieldError(
            "email",
            "The email you tried to sign up with is already in use. Please try registering with a new email or login into the account associated with the provided email."
          );
        default:
          showNotification({
            id: "signinError",
            color: "red",
            title: "An error occurred",
            message: signOnAlertMsg(errorCode),
            icon: <IconAlertTriangle />,
            autoClose: 5000,
          });
          break;
      }
    } else {
    }
  }, [signOnError]);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      terms: false,
    },

    validate: {
      email: (val) =>
        !isRegister
          ? null
          : z.string().email().safeParse(val).success
          ? null
          : "Please provide a valid email",
      password: (val) =>
        val.length >= 6 ? null : "Password must be over 6 characters long",
      terms: (val: boolean) =>
        !isRegister
          ? null
          : val
          ? null
          : "You must agree to the Terms of Service",
    },
  });

  useEffect(() => {
    if (userDB) {
      router.push("/");
    }

    return () => {
      if (isRegister && userDB && updateUserDB) {
        updateUserDB.mutate({ name: form.values.name });
      }
    };
  }, [user, router, form, isRegister, updateUserDB]);

  const onError = (error: any) => {
    if (error.response.data)
      setSignOnError(error.response.data as FirebaseError);
    else setSignOnError(error as FirebaseError);
  };

  return (
    <Container
      id="signin-container"
      pt="lg"
      style={{ height: "100%", maxWidth: 400, transform: "translateY(25%)" }}
    >
      {userDB ? (
        <Text id="signin-redirect" align="center" color="dimmed" size="sm">
          Redirecting you to MakoTools
        </Text>
      ) : (
        <>
          <Anchor
            component={Link}
            href="/"
            id="signin-back-link"
            size="sm"
            color="dimmed"
            mb="sm"
            style={{ display: "block" }}
          >
            Back to MakoTools
          </Anchor>
          <Paper
            id="signin-paper-container"
            radius="md"
            p="md"
            withBorder
            sx={{ width: "100%" }}
          >
            <LoadingOverlay visible={isUserDBPending} />
            <Title id="signin-title" order={2} size="lg" mb="sm">
              {isRegister ? "Sign up" : "Sign in"}
            </Title>
            <Stack spacing="xs">
              <Button
                id="signin-google"
                variant="default"
                leftIcon={<IconBrandGoogle size={16} />}
                onClick={() => signInWithGoogle()}
                style={{ width: "100%" }}
              >
                {isRegister ? "Sign up" : "Sign in"} with Google
              </Button>
            </Stack>

            <Divider
              id="signin-email-divider"
              label={`Or ${isRegister ? "sign up" : "sign in"} with email`}
              mt="md"
              mb="sm"
            />
            <form
              id="signin-form"
              onSubmit={form.onSubmit(() => {
                setSignOnError(null);
                if (isRegister) {
                  signUpWithEmail(
                    form.values.email,
                    form.values.password,
                    onError
                  );
                } else {
                  signInFunction(
                    form.values.email,
                    form.values.password,
                    onError
                  );
                }
              })}
            >
              <Stack id="signin-form-elements" spacing="xs">
                {isRegister && (
                  <TextInput
                    id="signin-input-name"
                    placeholder="Anzu"
                    label="Name"
                    required
                    {...form.getInputProps("name")}
                  />
                )}
                <TextInput
                  id="siginin-input-email"
                  placeholder="anzu@ensemblesquare.com"
                  label={isRegister ? "Email" : "Email or Username"}
                  required
                  {...form.getInputProps("email")}
                />
                <PasswordInput
                  id="signin-input-password"
                  placeholder="Password"
                  label="Password"
                  required
                  {...form.getInputProps("password")}
                />
                {isRegister && (
                  <Checkbox
                    id="signin-checkbox-tos"
                    label="I agree to the Terms of Service"
                    {...form.getInputProps("terms", { type: "checkbox" })}
                  />
                )}
                <Group
                  id="signin-form-footer"
                  style={{
                    flexWrap: "nowrap",
                    justifyContent: "space-between",
                  }}
                >
                  <Stack spacing="xs">
                    <Anchor
                      component="button"
                      type="button"
                      color="dimmed"
                      onClick={() => {
                        setIsRegister(!isRegister);
                        setSignOnError(null);
                      }}
                      size="xs"
                      style={{ maxWidth: "100%" }}
                    >
                      {isRegister
                        ? "Already have an account? Sign in"
                        : "Don't have an account? Sign up"}
                    </Anchor>
                    <Anchor
                      href="/login/reset_password"
                      color="dimmed"
                      size="xs"
                      style={{ maxWidth: "100%", textAlign: "left" }}
                    >
                      Forgot password?
                    </Anchor>
                  </Stack>

                  <Button id="signin-form-button" type="submit">
                    {!isRegister ? "Sign in" : "Sign up"}
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        </>
      )}
    </Container>
  );
}

export default Login;
