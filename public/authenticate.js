const { startAuthentication } = SimpleWebAuthnBrowser;

async function authenticate() {
  const resp = await fetch("generate-authentication-options");

  let asseResp;
  try {
    const opts = await resp.json();
    console.log("Authentication Options", JSON.stringify(opts, null, 2));

    asseResp = await startAuthentication({ optionsJSON: opts });
    console.log("Authentication Response", JSON.stringify(asseResp, null, 2));
  } catch (error) {
    throw new Error(error);
  }

  const verificationResp = await fetch("verify-authentication", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(asseResp),
  });

  const verificationJSON = await verificationResp.json();
  console.log("Server Response", JSON.stringify(verificationJSON, null, 2));

  if (verificationJSON && verificationJSON.verified) {
    return true;
  } else {
    throw new Error(JSON.stringify(verificationJSON));
  }
}
