// Set AWS credentials early to override any set in the calling environment.
process.env.AWS_SECRET_ACCESS_KEY = "abc123";
process.env.AWS_ACCESS_KEY_ID = "deadbeaf";
delete process.env.AWS_SESSION_TOKEN;

import { AwsHttps } from "./aws-https";
import nock from "nock";

describe("AwsHttps with AWS", () => {
  const serverHostname = "example.com";
  const serverUrl = "https://" + serverHostname;

  afterEach(() => {
    nock.cleanAll();
  });

  describe("with provided AWS credentials", () => {
    test("does a signed POST", async () => {
      // // GIVEN
      const awsCredentials = {
        accessKeyId: "ACCESS-KEY-ID",
        secretAccessKey: "SECRET-ACCESS-KEY",
        sessionToken: "SESSION-TOKEN",
      };

      const body = JSON.stringify({ cursor: 3, map: "Irvine" });
      const response = { success: true };
      const scope = nock(serverUrl, {
        reqheaders: {
          "X-Amz-Date": /20......T......Z/,
          Authorization:
            /AWS4-HMAC-SHA256 Credential=ACCESS-KEY-ID.*, SignedHeaders=content-length;content-type;host;x-amz-date;x-amz-security-token, Signature=.*/,
        },
      })
        .post("/test", body)
        .reply(200, response);
      const sut = new AwsHttps(true, awsCredentials);
      expect(AwsHttps["credentialsInitializedPromise"]).toBeUndefined();
      expect(sut["awsCredentials"]).toBe(awsCredentials);

      // WHEN
      const reply = await sut.request({
        protocol: "https:",
        method: "POST",
        hostname: serverHostname,
        path: "/test",
        body: body,
        awsSign: true,
        headers: { "Content-Type": "application/json" },
      });

      // THEN
      expect(reply).toEqual(response);
      expect(scope.isDone()).toBeTruthy();
      expect(AwsHttps["credentialsInitializedPromise"]).toBeUndefined();
      expect(sut["awsCredentials"]).toBe(awsCredentials);
    });
  });

  describe("with process AWS credentials", () => {
    const body = JSON.stringify({ cursor: 3, map: "Irvine" });
    const requestOptions = {
      protocol: "https:",
      method: "POST",
      hostname: serverHostname,
      path: "/test",
      body: body,
      awsSign: true,
      headers: { "Content-Type": "application/json" },
    };
    const response = { success: true };
    let scope: nock.Scope;

    beforeEach(() => {
      scope = nock(serverUrl, {
        reqheaders: {
          "X-Amz-Date": /20......T......Z/,
          Authorization:
            /AWS4-HMAC-SHA256 Credential=deadbeaf.*, SignedHeaders=content-length;content-type;host;x-amz-date, Signature=.*/,
        },
      })
        .post("/test", body)
        .reply(200, response);
    });

    test("does first signed POST", async () => {
      // // GIVEN
      const sut = new AwsHttps(true);
      expect(AwsHttps["credentialsInitializedPromise"]).toBeUndefined();
      expect(sut["awsCredentials"]).toBeUndefined();

      // WHEN
      const reply = await sut.request(requestOptions);

      // THEN
      expect(reply).toEqual(response);
      expect(scope.isDone()).toBeTruthy();
      expect(AwsHttps["credentialsInitializedPromise"]).toBeTruthy();
      expect(sut["awsCredentials"]).toBeDefined();
    });

    test("does another signed POST; reuse creds", async () => {
      // // GIVEN
      const sut = new AwsHttps(true);
      expect(AwsHttps["credentialsInitializedPromise"]).toBeDefined();
      expect(sut["awsCredentials"]).toBeUndefined();

      // WHEN
      const reply = await sut.request(requestOptions);

      // THEN
      expect(reply).toEqual(response);
      expect(scope.isDone()).toBeTruthy();
      expect(AwsHttps["credentialsInitializedPromise"]).toBeTruthy();
      expect(sut["awsCredentials"]).toBeDefined();
    });

    test("resets credentials", async () => {
      const sut = new AwsHttps(false, true);
      expect(AwsHttps["credentialsInitializedPromise"]).toBeUndefined();
      expect(sut["awsCredentials"]).toBeUndefined();
    });

    test("after reset, again do signed POST", async () => {
      // // GIVEN
      const sut = new AwsHttps(true);
      expect(AwsHttps["credentialsInitializedPromise"]).toBeUndefined();
      expect(sut["awsCredentials"]).toBeUndefined();

      // WHEN
      const reply = await sut.request(requestOptions);

      // THEN
      expect(reply).toEqual(response);
      expect(scope.isDone()).toBeTruthy();
      expect(AwsHttps["credentialsInitializedPromise"]).toBeTruthy();
      expect(sut["awsCredentials"]).toBeDefined();
    });
  });
});
