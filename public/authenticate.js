const { startAuthentication } = SimpleWebAuthnBrowser;

async function authenticate() {
  const resp = await fetch("authenticate");

  let asseResp;
  try {
    const opts = await resp.json();
    asseResp = await startAuthentication({ optionsJSON: opts });
  } catch (error) {
    throw new Error(error);
  }

  const verificationResp = await fetch("authenticate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(asseResp),
  });

  const verificationJSON = await verificationResp.json();

  if (verificationJSON && verificationJSON.verified) {
    return true;
  } else {
    throw new Error(JSON.stringify(verificationJSON));
  }
}
