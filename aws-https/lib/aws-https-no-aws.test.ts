import { AwsHttps } from "./aws-https";
import nock from "nock";
import { URL } from "url";
import * as AWS from "aws-sdk";

describe("AwsHttps-No-AWS", () => {
  const serverHostname = "example.com";
  const serverUrl = "https://" + serverHostname;

  beforeAll(() => {
    // Don't allow actual Internet access
    //nock.disableNetConnect();
  });

  afterAll(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  test("request(sigv4) no AWS creds", async () => {
    // // GIVEN
    const sut = new AwsHttps(false);

    const originalAwsGetCredentials = AWS.config.getCredentials;
    AWS.config.getCredentials = (callback: (err: AWS.AWSError, credentials: any) => void) => {
      callback(new Error("Could not load credentials from any providers") as AWS.AWSError, null);
    };

    // WHEN
    let exception: Error | null = null;
    try {
      await sut.request({
        protocol: "https:",
        method: "GET",
        hostname: serverHostname,
        awsSign: true,
      });
    } catch (err) {
      exception = err as Error;
    } finally {
      AWS.config.getCredentials = originalAwsGetCredentials;
    }

    // THEN
    expect(exception).toBeTruthy();
    expect(exception!.message).toEqual("Could not load credentials from any providers");
  });

  test("request(GET /test?cloud=ONICA) success", async () => {
    // // GIVEN
    const response = { success: true };
    const scope = nock(serverUrl)
      .get("/test")
      .query({ cloud: "ONICA" })
      .matchHeader("accept", "application/json")
      .reply(200, response);
    const sut = new AwsHttps();

    // WHEN
    const reply = await sut.request({
      protocol: "https:",
      method: "GET",
      hostname: serverHostname,
      path: "/test?cloud=ONICA",
      headers: { accept: "application/json" },
    });

    // THEN
    expect(reply).toEqual(response);
    expect(scope.isDone()).toBeTruthy();
  });

  test("request(DELETE /deadline) no response body to parse", async () => {
    // // GIVEN
    const scope = nock(serverUrl).delete("/deadline").reply(200);
    const sut = new AwsHttps(true);

    // WHEN
    const reply = await sut.request({
      protocol: "https:",
      method: "DELETE",
      hostname: serverHostname,
      path: "/deadline",
    });

    // THEN
    expect(reply).toEqual(null);
    expect(scope.isDone()).toBeTruthy();
  });

  test("request(GET) bad JSON parse", async () => {
    // // GIVEN
    const scope = nock(serverUrl)
      .get("/test")
      .query({ cloud: "ONICA" })
      .matchHeader("accept", "application/json")
      .reply(200, "success: false"); // invalid JSON
    const sut = new AwsHttps(true);

    // WHEN
    let exception: unknown;
    try {
      await sut.request({
        protocol: "https:",
        method: "GET",
        hostname: serverHostname,
        path: "/test?cloud=ONICA",
        headers: { accept: "application/json" },
      });
    } catch (err) {
      exception = err;
    }

    // THEN
    expect(exception).toBeInstanceOf(SyntaxError);
    expect(scope.isDone()).toBeTruthy();
  });

  test("request(GET /on-premise) not found", async () => {
    // // GIVEN
    const response = { statusCode: 404, message: "Go serverless!" };
    const scope = nock(serverUrl).get("/on-premise").reply(404, response);
    const sut = new AwsHttps();

    // WHEN
    let exception: Error | null = null;
    try {
      await sut.request({
        protocol: "https:",
        method: "GET",
        hostname: serverHostname,
        path: "/on-premise",
        headers: { accept: "application/json" },
      });
    } catch (err) {
      exception = err as Error;
    }

    // THEN
    expect(exception).toEqual(new Error("Failed to load content, status code: 404"));
    expect((exception as any).statusCode).toEqual(404);
    expect(scope.isDone()).toBeTruthy();
  });

  test("request(timeout)", async () => {
    // GIVEN
    const scope = nock(serverUrl).get("/test").delay(100).reply(200, { s: "unreachable" });
    const sut = new AwsHttps();

    // WHEN
    try {
      await sut.request({
        protocol: "https:",
        method: "GET",
        hostname: serverHostname,
        path: "/test",
        timeout: 10,
      });
      fail("expected to throw");
    } catch (err: any) {
      // THEN
      expect(err.code).toEqual("ECONNRESET");
      expect(scope.isDone()).toBeTruthy();
    }
  });

  test("buildOptions", () => {
    // GIVEN
    const url = new URL(serverUrl + "/experts?cloud=ONICA");
    const sut = new AwsHttps();

    // WHEN
    const options = sut.buildOptions("HEAD", url, 200);

    // THEN
    expect(options.protocol).toEqual("https:");
    expect(options.method).toEqual("HEAD");
    expect(options.hostname).toEqual(serverHostname);
    expect(options.port).toEqual(443);
    expect(options.path).toEqual("/experts?cloud=ONICA");
    expect(options.timeout).toEqual(200);
  });
});
