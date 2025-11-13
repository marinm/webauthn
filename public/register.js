const { startRegistration } = SimpleWebAuthnBrowser;

async function register() {
  const options = await fetch("generate-registration-options").then((options) =>
    options.json(),
  );

  let attestation;
  try {
    console.log("Registration Options", JSON.stringify(options, null, 2));
    attestation = await startRegistration({ optionsJSON: options });
    console.log("Registration Response", JSON.stringify(attestation, null, 2));
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

  console.log("Server response", JSON.stringify(verification, null, 2));

  if (verification && verification.verified) {
    return true;
  } else {
    throw new Error(`Something went wrong: ${JSON.stringify(verification)}`);
  }
}
