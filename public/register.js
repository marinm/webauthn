const { startRegistration } = SimpleWebAuthnBrowser;

async function register() {
  const options = await fetch("generate-registration-options").then((options) =>
    options.json(),
  );

  let attestation;
  try {
    attestation = await startRegistration({ optionsJSON: options });
  } catch (error) {
    throw error.name === "InvalidStateError"
      ? new Error("Authenticator was probably already registered by user")
      : error;
  }

  const verification = await fetch("verify-registration", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(attestation),
  }).then((response) => response.json());

  if (verification && verification.verified) {
    return true;
  } else {
    throw new Error(`Something went wrong: ${JSON.stringify(verification)}`);
  }
}
